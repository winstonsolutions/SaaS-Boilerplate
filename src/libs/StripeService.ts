import Stripe from 'stripe';

import { db } from '@/libs/DB';
import { EmailService } from '@/libs/EmailService';
import { LicenseService } from '@/libs/LicenseService';
import { logger } from '@/libs/Logger';
import { getCurrentPricingPlan } from '@/utils/SubscriptionConfig';

// 初始化Stripe客户端
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20', // 使用最新的API版本
});

/**
 * Stripe支付服务 - 处理支付和订阅相关功能
 */
export class StripeService {
  /**
   * 创建结账会话
   * @param userId 用户ID
   * @param email 用户邮箱
   * @param successUrl 支付成功后重定向的URL
   * @param cancelUrl 取消支付后重定向的URL
   */
  static async createCheckoutSession(
    userId: string,
    email: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<{ url: string | null; error?: string }> {
    try {
      // 获取价格计划信息
      const pricePlan = getCurrentPricingPlan();

      if (!pricePlan.priceId) {
        return {
          url: null,
          error: '未配置价格ID',
        };
      }

      // 创建结账会话
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: pricePlan.priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription', // 更改为订阅模式
        success_url: `${successUrl}${successUrl.includes('?') ? '&' : '?'}session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        customer_email: email,
        metadata: {
          userId,
          planType: 'monthly', // 目前只支持月付
          planId: pricePlan.id,
          price: pricePlan.price.toString(),
        },
      });

      return { url: session.url };
    } catch (error) {
      logger.error({ error }, '创建Stripe结账会话失败');
      return {
        url: null,
        error: error instanceof Error ? error.message : '创建支付会话失败',
      };
    }
  }

  /**
   * 处理支付成功的webhook事件
   * @param event Stripe webhook事件
   */
  static async handlePaymentSucceeded(event: Stripe.Event): Promise<boolean> {
    try {
      const session = event.data.object as Stripe.Checkout.Session;

      // 获取元数据
      const { userId, planType } = session.metadata || {};

      if (!userId) {
        logger.error('支付会话缺少userId元数据');
        return false;
      }

      // 查询用户信息
      const { data: user, error: userError } = await db
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        logger.error({ error: userError }, '查询用户信息失败');
        return false;
      }

      // 创建license
      const license = await LicenseService.createLicense(
        userId,
        user.email,
        planType || 'monthly',
        1, // 1个月的订阅
      );

      if (!license) {
        logger.error('创建license失败');
        return false;
      }

      // 更新用户订阅状态
      const { error: updateError } = await db
        .from('users')
        .update({
          subscription_status: 'pro',
          subscription_start_at: new Date().toISOString(),
          subscription_end_at: license.expiresAt,
        })
        .eq('id', userId);

      if (updateError) {
        logger.error({ error: updateError }, '更新用户订阅状态失败');
        return false;
      }

      // 记录支付信息
      const { error: paymentError } = await db
        .from('payments')
        .insert({
          user_id: userId,
          license_id: license.id,
          payment_id: session.payment_intent as string,
          amount: session.amount_total ? session.amount_total / 100 : 0, // Stripe金额以分为单位
          currency: session.currency,
          status: 'completed',
        });

      if (paymentError) {
        logger.error({ error: paymentError }, '记录支付信息失败');
        // 不中断流程
      }

      // 发送license key邮件
      await EmailService.sendLicenseEmail(
        user.email,
        license.licenseKey,
        license.expiresAt,
      );

      return true;
    } catch (error) {
      logger.error({ error }, '处理支付成功webhook失败');
      return false;
    }
  }

  /**
   * 验证webhook签名
   * @param payload 请求体
   * @param signature Stripe签名
   */
  static verifyWebhookSignature(
    payload: string,
    signature: string,
  ): boolean {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!webhookSecret) {
        logger.error('未配置STRIPE_WEBHOOK_SECRET环境变量');
        return false;
      }

      // 验证签名
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );

      return !!event;
    } catch (error) {
      logger.error({ error }, 'Stripe webhook签名验证失败');
      return false;
    }
  }

  /**
   * 手动创建license并处理付款
   * 用于手动测试或管理员操作
   */
  static async manuallyCreateLicense(
    userId: string,
    email: string,
    months: number = 1,
  ): Promise<{ success: boolean; licenseKey?: string; error?: string }> {
    try {
      // 创建license
      const license = await LicenseService.createLicense(
        userId,
        email,
        'monthly',
        months,
      );

      if (!license) {
        return { success: false, error: '创建license失败' };
      }

      // 更新用户订阅状态
      const { error: updateError } = await db
        .from('users')
        .update({
          subscription_status: 'pro',
          subscription_start_at: new Date().toISOString(),
          subscription_end_at: license.expiresAt,
        })
        .eq('id', userId);

      if (updateError) {
        return { success: false, error: '更新用户订阅状态失败' };
      }

      // 发送license key邮件
      await EmailService.sendLicenseEmail(
        email,
        license.licenseKey,
        license.expiresAt,
      );

      return { success: true, licenseKey: license.licenseKey };
    } catch (error) {
      logger.error({ error }, '手动创建license失败');
      return {
        success: false,
        error: error instanceof Error ? error.message : '创建license失败',
      };
    }
  }

  /**
   * 取消订阅
   */
  static async cancelSubscription(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // 将用户license设为失效
      const { error: licenseError } = await db
        .from('licenses')
        .update({ active: false })
        .eq('user_id', userId);

      if (licenseError) {
        return { success: false, error: '更新license状态失败' };
      }

      // 更新用户订阅状态
      const { error: userError } = await db
        .from('users')
        .update({
          subscription_status: 'expired',
          subscription_end_at: new Date().toISOString(), // 立即过期
        })
        .eq('id', userId);

      if (userError) {
        return { success: false, error: '更新用户订阅状态失败' };
      }

      return { success: true };
    } catch (error) {
      logger.error({ error }, '取消订阅失败');
      return {
        success: false,
        error: error instanceof Error ? error.message : '取消订阅失败',
      };
    }
  }

  /**
   * 处理订阅创建事件
   * @param event Stripe webhook事件
   */
  static async handleSubscriptionCreated(event: Stripe.Event): Promise<boolean> {
    try {
      const subscription = event.data.object as Stripe.Subscription;
      const { metadata } = subscription;

      // 获取用户ID，可能在metadata或customer的metadata中
      let userId = metadata?.userId;

      // 如果metadata中没有userId，可能需要从customer中获取
      if (!userId && typeof subscription.customer === 'string') {
        const customer = await stripe.customers.retrieve(subscription.customer);
        if (customer && !('deleted' in customer)) {
          userId = customer.metadata?.userId;
        }
      }

      if (!userId) {
        logger.error('订阅缺少userId元数据');
        return false;
      }

      // 查询用户信息
      const { data: user, error: userError } = await db
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        logger.error({ error: userError }, '查询用户信息失败');
        return false;
      }

      // 计算订阅结束时间
      const subscriptionEndDate = new Date(subscription.current_period_end * 1000);

      // 创建license
      const license = await LicenseService.createLicense(
        userId,
        user.email,
        'monthly',
        1, // 1个月的订阅
      );

      if (!license) {
        logger.error('创建license失败');
        return false;
      }

      // 更新用户订阅状态
      const { error: updateError } = await db
        .from('users')
        .update({
          subscription_status: 'pro',
          subscription_start_at: new Date().toISOString(),
          subscription_end_at: subscriptionEndDate.toISOString(),
          stripe_subscription_id: subscription.id,
        })
        .eq('id', userId);

      if (updateError) {
        logger.error({ error: updateError }, '更新用户订阅状态失败');
        return false;
      }

      // 记录支付信息
      const latestInvoice = subscription.latest_invoice;
      let paymentId = '';
      let amount = 0;

      if (typeof latestInvoice === 'string') {
        const invoice = await stripe.invoices.retrieve(latestInvoice);
        if (invoice.payment_intent && typeof invoice.payment_intent === 'string') {
          paymentId = invoice.payment_intent;
        }
        amount = invoice.amount_paid / 100; // Stripe金额以分为单位
      }

      const { error: paymentError } = await db
        .from('payments')
        .insert({
          user_id: userId,
          license_id: license.id,
          payment_id: paymentId,
          subscription_id: subscription.id,
          amount,
          currency: subscription.currency,
          status: 'completed',
        });

      if (paymentError) {
        logger.error({ error: paymentError }, '记录支付信息失败');
        // 不中断流程
      }

      // 发送license key邮件
      await EmailService.sendLicenseEmail(
        user.email,
        license.licenseKey,
        subscriptionEndDate.toISOString(),
      );

      return true;
    } catch (error) {
      logger.error({ error }, '处理订阅创建webhook失败');
      return false;
    }
  }

  /**
   * 处理发票支付事件（通常是续费）
   * @param event Stripe webhook事件
   */
  static async handleInvoicePaid(event: Stripe.Event): Promise<boolean> {
    try {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription as string;

      if (!subscriptionId) {
        logger.error('发票中没有订阅ID');
        return false;
      }

      // 获取订阅信息
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      let userId = subscription.metadata?.userId;

      // 如果metadata中没有userId，从customer中获取
      if (!userId && typeof subscription.customer === 'string') {
        const customer = await stripe.customers.retrieve(subscription.customer);
        if (customer && !('deleted' in customer)) {
          userId = customer.metadata?.userId;
        }
      }

      if (!userId) {
        logger.error('无法确定用户ID');
        return false;
      }

      // 获取用户信息
      const { data: user, error: userError } = await db
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        logger.error({ error: userError }, '查询用户信息失败');
        return false;
      }

      // 计算新的订阅结束时间
      const subscriptionEndDate = new Date(subscription.current_period_end * 1000);

      // 创建或更新license
      const license = await LicenseService.createLicense(
        userId,
        user.email,
        'monthly',
        1, // 1个月的订阅
      );

      if (!license) {
        logger.error('创建license失败');
        return false;
      }

      // 更新用户订阅状态
      const { error: updateError } = await db
        .from('users')
        .update({
          subscription_status: 'pro',
          subscription_end_at: subscriptionEndDate.toISOString(),
          stripe_subscription_id: subscriptionId,
        })
        .eq('id', userId);

      if (updateError) {
        logger.error({ error: updateError }, '更新用户订阅状态失败');
        return false;
      }

      // 记录支付信息
      const paymentId = typeof invoice.payment_intent === 'string' ? invoice.payment_intent : '';

      const { error: paymentError } = await db
        .from('payments')
        .insert({
          user_id: userId,
          license_id: license.id,
          payment_id: paymentId,
          subscription_id: subscriptionId,
          amount: invoice.amount_paid / 100,
          currency: invoice.currency,
          status: 'completed',
        });

      if (paymentError) {
        logger.error({ error: paymentError }, '记录支付信息失败');
        // 不中断流程
      }

      return true;
    } catch (error) {
      logger.error({ error }, '处理发票支付webhook失败');
      return false;
    }
  }

  /**
   * 处理订阅更新事件
   * @param event Stripe webhook事件
   */
  static async handleSubscriptionUpdated(event: Stripe.Event): Promise<boolean> {
    try {
      const subscription = event.data.object as Stripe.Subscription;

      // 检查状态，如果是active，表示正常更新
      if (subscription.status !== 'active') {
        logger.info({ status: subscription.status }, '订阅状态非active，不处理');
        return true; // 不处理非活跃状态的更新
      }

      // 查找用户记录
      const { data: userRecord, error: userError } = await db
        .from('users')
        .select('*')
        .eq('stripe_subscription_id', subscription.id)
        .single();

      if (userError || !userRecord) {
        logger.error({ error: userError, subscriptionId: subscription.id }, '找不到匹配的用户记录');
        return false;
      }

      // 更新用户订阅结束时间
      const subscriptionEndDate = new Date(subscription.current_period_end * 1000);

      const { error: updateError } = await db
        .from('users')
        .update({
          subscription_end_at: subscriptionEndDate.toISOString(),
        })
        .eq('id', userRecord.id);

      if (updateError) {
        logger.error({ error: updateError }, '更新用户订阅结束时间失败');
        return false;
      }

      return true;
    } catch (error) {
      logger.error({ error }, '处理订阅更新webhook失败');
      return false;
    }
  }

  /**
   * 处理订阅删除事件
   * @param event Stripe webhook事件
   */
  static async handleSubscriptionDeleted(event: Stripe.Event): Promise<boolean> {
    try {
      const subscription = event.data.object as Stripe.Subscription;

      // 查找用户记录
      const { data: userRecord, error: userError } = await db
        .from('users')
        .select('*')
        .eq('stripe_subscription_id', subscription.id)
        .single();

      if (userError || !userRecord) {
        logger.error({ error: userError, subscriptionId: subscription.id }, '找不到匹配的用户记录');
        return false;
      }

      // 将用户license设为失效
      const { error: licenseError } = await db
        .from('licenses')
        .update({ active: false })
        .eq('user_id', userRecord.id);

      if (licenseError) {
        logger.error({ error: licenseError }, '更新license状态失败');
        // 不中断流程
      }

      // 更新用户订阅状态
      const { error: updateError } = await db
        .from('users')
        .update({
          subscription_status: 'expired',
          subscription_end_at: new Date().toISOString(), // 立即过期
        })
        .eq('id', userRecord.id);

      if (updateError) {
        logger.error({ error: updateError }, '更新用户订阅状态失败');
        return false;
      }

      return true;
    } catch (error) {
      logger.error({ error }, '处理订阅删除webhook失败');
      return false;
    }
  }
}
