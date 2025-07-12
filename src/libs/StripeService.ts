import Stripe from 'stripe';

import { db } from '@/libs/DB';
import { EmailService } from '@/libs/EmailService';
import { LicenseService } from '@/libs/LicenseService';
import { logger } from '@/libs/Logger';
import { AppConfig } from '@/utils/AppConfig';
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
   * @param locale 用户语言偏好
   */
  static async createCheckoutSession(
    userId: string,
    email: string,
    successUrl: string,
    cancelUrl: string,
    locale: string = AppConfig.defaultLocale,
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

      // 查找或创建客户
      let customer: Stripe.Response<Stripe.Customer>;

      // 先尝试查找已有的客户
      const customers = await stripe.customers.list({
        email,
        limit: 1,
      });

      // 确保customers存在且有数据
      if (customers && customers.data && customers.data.length > 0 && customers.data[0]?.id) {
        // 客户已存在，更新元数据
        customer = await stripe.customers.update(
          customers.data[0].id,
          {
            metadata: {
              userId,
              locale, // 保存用户语言偏好
            },
          },
        );
      } else {
        // 创建新客户并设置元数据
        customer = await stripe.customers.create({
          email,
          metadata: {
            userId,
            locale, // 保存用户语言偏好
          },
        });
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
        customer: customer.id, // 使用客户ID而不是customer_email
        subscription_data: {
          metadata: {
            userId,
            locale, // 在订阅元数据中也保存语言偏好
          },
        },
        metadata: {
          userId,
          planType: 'monthly', // 目前只支持月付
          planId: pricePlan.id,
          price: pricePlan.price.toString(),
          locale, // 保存用户语言偏好
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
      const { userId, planType, locale } = session.metadata || {};
      // 获取用户语言偏好，如果未指定则使用默认语言
      const userLocale = locale || AppConfig.defaultLocale;

      if (!userId) {
        logger.error({
          sessionId: session.id,
          metadata: session.metadata,
        }, '支付会话缺少userId元数据');
        return false;
      }

      // 验证userId格式（应该是UUID格式）
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        logger.error({
          sessionId: session.id,
          userId,
        }, '支付会话中的userId格式无效');
        return false;
      }

      // 检查是否已处理过相同的支付
      const paymentIntent = session.payment_intent as string;
      if (paymentIntent) {
        try {
          const { data, error } = await db
            .from('payments')
            .select('id')
            .eq('user_id', userId)
            .eq('payment_id', paymentIntent)
            .limit(1);

          if (!error && data && data.length > 0) {
            logger.info({ userId, paymentIntent }, '该支付已处理过，避免重复处理');
            return true;
          }
        } catch (err) {
          logger.warn({ error: err }, '检查重复支付记录失败');
          // 继续处理
        }
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

      // 获取价格配置
      const { getCurrentPricingPlan } = await import('@/utils/SubscriptionConfig');
      const pricePlan = getCurrentPricingPlan();

      // 创建license - 但不激活
      const license = await LicenseService.createLicense(
        userId,
        user.email,
        planType || 'monthly',
        1, // 1个月的订阅
        pricePlan.price, // 传递正确的价格
      );

      if (!license) {
        logger.error('创建license失败');
        return false;
      }

      // 不再自动更新用户订阅状态为pro，让用户通过邮件中的激活码自行激活
      // 仅记录支付信息
      const { error: paymentError } = await db
        .from('payments')
        .insert({
          user_id: userId,
          license_id: license.id,
          payment_id: paymentIntent,
          amount: session.amount_total ? session.amount_total / 100 : 0, // Stripe金额以分为单位转为元
          currency: session.currency,
          status: 'completed',
          payment_date: new Date().toISOString(), // 添加支付时间
        });

      if (paymentError) {
        logger.error({ error: paymentError }, '记录支付信息失败');
        // 不中断流程
      } else {
        logger.info({
          userId,
          paymentIntent,
          amount: session.amount_total ? session.amount_total / 100 : 0,
          currency: session.currency,
        }, '成功记录一次性支付信息');
      }

      // 注意：一次性支付才在这里发送邮件
      // 订阅支付会在customer.subscription.created中发送邮件
      await EmailService.sendLicenseEmail(
        user.email,
        license.licenseKey,
        license.expiresAt,
        userLocale, // 使用用户语言偏好发送邮件
      );

      // 发送日志
      logger.info({
        userId,
        email: user.email,
        licenseKey: license.licenseKey,
        locale: userLocale,
      }, '已发送许可证邮件');

      return true;
    } catch (error) {
      logger.error({ error }, '处理支付成功事件失败');
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
      // 获取价格配置
      const { getCurrentPricingPlan } = await import('@/utils/SubscriptionConfig');
      const pricePlan = getCurrentPricingPlan();

      // 创建license
      const license = await LicenseService.createLicense(
        userId,
        email,
        'monthly',
        months,
        pricePlan.price, // 传递正确的价格
      );

      if (!license) {
        return { success: false, error: '创建license失败' };
      }

      // 不再自动更新用户订阅状态，让用户通过邮件收到的激活码自行激活

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
          subscription_expires_at: new Date().toISOString(), // 立即过期
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

      // 获取元数据
      const { userId, locale } = subscription.metadata || {};
      const userLocale = locale || AppConfig.defaultLocale; // 使用用户语言偏好，如果不存在则使用默认语言

      if (!userId) {
        logger.error('订阅事件缺少userId元数据');
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

      // 获取订阅详情
      const subscriptionData = {
        id: subscription.id,
        customerId: subscription.customer as string,
        status: subscription.status,
        startDate: new Date(subscription.start_date * 1000).toISOString(),
        endDate: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      };

      // 检查是否已记录该订阅
      const { data: existingSubscription, error: subscriptionCheckError } = await db
        .from('subscriptions')
        .select('id')
        .eq('subscription_id', subscriptionData.id)
        .limit(1);

      if (subscriptionCheckError) {
        logger.error({ error: subscriptionCheckError }, '检查现有订阅记录失败');
        // 继续处理
      } else if (existingSubscription && existingSubscription.length > 0) {
        // 订阅已存在，更新状态
        const { error: updateError } = await db
          .from('subscriptions')
          .update({
            status: subscriptionData.status,
            end_date: subscriptionData.endDate,
            cancel_at_period_end: subscriptionData.cancelAtPeriodEnd,
            updated_at: new Date().toISOString(),
          })
          .eq('subscription_id', subscriptionData.id);

        if (updateError) {
          logger.error({ error: updateError }, '更新订阅记录失败');
        } else {
          logger.info({ subscriptionId: subscriptionData.id }, '更新订阅记录成功');
        }

        return true; // 已处理过，直接返回成功
      }

      // 获取价格配置
      const { getCurrentPricingPlan } = await import('@/utils/SubscriptionConfig');
      const pricePlan = getCurrentPricingPlan();

      // 创建license
      const license = await LicenseService.createLicense(
        userId,
        user.email,
        'monthly', // 目前只支持月付
        1, // 1个月的订阅
        pricePlan.price, // 传递正确的价格
      );

      if (!license) {
        logger.error('创建license失败');
        return false;
      }

      // 记录订阅信息
      const { error: insertError } = await db
        .from('subscriptions')
        .insert({
          user_id: userId,
          license_id: license.id,
          subscription_id: subscriptionData.id,
          customer_id: subscriptionData.customerId,
          status: subscriptionData.status,
          start_date: subscriptionData.startDate,
          end_date: subscriptionData.endDate,
          cancel_at_period_end: subscriptionData.cancelAtPeriodEnd,
        });

      if (insertError) {
        logger.error({ error: insertError }, '记录订阅信息失败');
        // 不中断流程
      }

      // 添加支付记录 - 对于订阅创建事件
      // 使用实际的订阅价格而不是0
      const { error: paymentError } = await db
        .from('payments')
        .insert({
          user_id: userId,
          license_id: license.id,
          subscription_id: subscriptionData.id,
          payment_id: `sub_created_${subscriptionData.id}`, // 标记这是订阅创建事件
          amount: pricePlan.price, // 使用实际价格而不是0
          currency: 'usd',
          status: 'subscription_created',
          payment_date: subscriptionData.startDate,
        });

      if (paymentError) {
        logger.error({ error: paymentError }, '记录订阅创建支付事件失败');
        // 不中断流程
      }

      // 更新用户表中的订阅状态
      const { error: userUpdateError } = await db
        .from('users')
        .update({
          subscription_expires_at: subscriptionData.endDate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (userUpdateError) {
        logger.error({ error: userUpdateError }, '更新用户订阅状态失败');
        // 不中断流程
      }

      // 发送许可证邮件
      await EmailService.sendLicenseEmail(
        user.email,
        license.licenseKey,
        subscriptionData.endDate,
        userLocale, // 使用用户语言偏好
      );

      logger.info({
        subscriptionId: subscriptionData.id,
        userId,
        licenseKey: license.licenseKey,
        locale: userLocale,
      }, '订阅创建完成，已发送许可证邮件');

      return true;
    } catch (error) {
      logger.error({ error }, '处理订阅创建事件失败');
      return false;
    }
  }

  /**
   * 处理发票支付事件
   * @param event Stripe webhook事件
   */
  static async handleInvoicePaid(event: Stripe.Event): Promise<boolean> {
    try {
      const invoice = event.data.object as Stripe.Invoice;

      // 必须有订阅
      if (!invoice.subscription) {
        logger.info('发票不包含订阅ID，可能是一次性支付');
        return true; // 不是订阅的发票，忽略
      }

      // 尝试获取用户ID
      let userId = invoice.metadata?.userId;
      let userLocale = invoice.metadata?.locale || AppConfig.defaultLocale;

      // 如果发票元数据中没有userId，尝试从订阅或客户中获取
      if (!userId) {
        // 尝试从订阅中获取
        if (typeof invoice.subscription === 'string') {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
          userId = subscription.metadata?.userId;
          userLocale = subscription.metadata?.locale || userLocale;
        }

        // 如果订阅中没有，尝试从客户中获取
        if (!userId && typeof invoice.customer === 'string') {
          const customer = await stripe.customers.retrieve(invoice.customer);
          if (customer && !('deleted' in customer)) {
            userId = customer.metadata?.userId;
            userLocale = customer.metadata?.locale || userLocale;
          }
        }
      }

      // 如果还是找不到userId，尝试通过subscription_id从数据库中查询
      if (!userId && invoice.subscription) {
        const subscriptionId = typeof invoice.subscription === 'string'
          ? invoice.subscription
          : invoice.subscription.id;

        const { data: subscriptionRecord } = await db
          .from('subscriptions')
          .select('user_id')
          .eq('subscription_id', subscriptionId)
          .single();

        if (subscriptionRecord) {
          userId = subscriptionRecord.user_id;
          logger.info({ userId, subscriptionId }, '从数据库中找到用户ID');
        }
      }

      if (!userId) {
        logger.error({
          invoiceId: invoice.id,
          subscriptionId: invoice.subscription,
        }, '无法确定发票关联的用户ID');
        return false;
      }

      // 验证userId格式
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        logger.error({ invoiceId: invoice.id, userId }, '发票关联的userId格式无效');
        return false;
      }

      // 获取订阅信息
      let subscription: Stripe.Subscription | undefined;
      if (invoice.subscription) {
        const subscriptionId = typeof invoice.subscription === 'string'
          ? invoice.subscription
          : invoice.subscription.id;

        try {
          subscription = await stripe.subscriptions.retrieve(subscriptionId);
        } catch (err) {
          logger.warn({ error: err, subscriptionId }, '获取订阅信息失败');
        }
      }

      // 处理发票支付，更新用户订阅状态、生成license等
      return this.processInvoiceWithUserId(
        userId,
        invoice,
        typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id,
        subscription,
        userLocale, // 传递用户语言偏好
      );
    } catch (error) {
      logger.error({ error }, '处理发票支付事件失败');
      return false;
    }
  }

  /**
   * 使用已确定的userId处理发票
   * @param userId 用户ID
   * @param invoice Stripe发票对象
   * @param subscriptionId 订阅ID
   * @param subscription 订阅对象
   * @param locale 用户语言偏好
   */
  private static async processInvoiceWithUserId(
    userId: string,
    invoice: Stripe.Invoice,
    subscriptionId?: string,
    subscription?: Stripe.Subscription,
    locale: string = AppConfig.defaultLocale,
  ): Promise<boolean> {
    try {
      // 查询用户信息
      const { data: user, error: userError } = await db
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        logger.error({ error: userError, userId }, '查询用户信息失败');
        return false;
      }

      // 计算订阅结束时间
      let subscriptionEndDate: Date | null = null;
      if (subscription?.current_period_end) {
        subscriptionEndDate = new Date(subscription.current_period_end * 1000);
      } else if (invoice.period_end) {
        subscriptionEndDate = new Date(invoice.period_end * 1000);
      }

      // 获取价格配置
      const { getCurrentPricingPlan } = await import('@/utils/SubscriptionConfig');
      const pricePlan = getCurrentPricingPlan();

      // 创建license
      const license = await LicenseService.createLicense(
        userId,
        user.email,
        'monthly', // 目前只支持月付
        1, // 1个月的订阅
        pricePlan.price, // 传递正确的价格
      );

      if (!license) {
        logger.error('创建license失败');
        return false;
      }

      // 记录支付信息
      if (invoice.payment_intent && typeof invoice.payment_intent === 'string') {
        const paymentId = invoice.payment_intent;

        // 检查是否已存在相同的支付记录
        const { data: existingPayment } = await db
          .from('payments')
          .select('id')
          .eq('payment_id', paymentId)
          .eq('user_id', userId)
          .single();

        if (!existingPayment) {
          const { error: paymentError } = await db
            .from('payments')
            .insert({
              user_id: userId,
              license_id: license.id,
              payment_id: paymentId,
              subscription_id: subscriptionId,
              amount: invoice.amount_paid / 100, // 单位转换从分转为元
              currency: invoice.currency,
              status: 'completed',
              payment_date: new Date(invoice.created * 1000).toISOString(), // 添加支付时间
            });

          if (paymentError) {
            logger.error({ error: paymentError }, '记录支付信息失败');
            // 不中断流程
          } else {
            logger.info({
              userId,
              paymentId,
              amount: invoice.amount_paid / 100,
              currency: invoice.currency,
            }, '成功记录发票支付信息');
          }
        } else {
          logger.info({ userId, paymentId }, '支付记录已存在，跳过重复记录');
        }
      }

      // 更新订阅记录
      if (subscriptionId) {
        // 检查是否已有该订阅记录
        const { data: subscriptionData } = await db
          .from('subscriptions')
          .select('id')
          .eq('subscription_id', subscriptionId)
          .single();

        if (subscriptionData) {
          // 更新现有订阅记录
          const { error: updateError } = await db
            .from('subscriptions')
            .update({
              status: subscription?.status || 'active',
              end_date: subscriptionEndDate?.toISOString() || null,
              cancel_at_period_end: subscription?.cancel_at_period_end || false,
              updated_at: new Date().toISOString(),
            })
            .eq('subscription_id', subscriptionId);

          if (updateError) {
            logger.error({ error: updateError }, '更新订阅记录失败');
          }
        } else {
          // 创建新的订阅记录
          const { error: insertError } = await db
            .from('subscriptions')
            .insert({
              user_id: userId,
              license_id: license.id,
              subscription_id: subscriptionId,
              customer_id: typeof invoice.customer === 'string' ? invoice.customer : '',
              status: subscription?.status || 'active',
              start_date: subscription?.start_date
                ? new Date(subscription.start_date * 1000).toISOString()
                : new Date().toISOString(),
              end_date: subscriptionEndDate?.toISOString() || null,
              cancel_at_period_end: subscription?.cancel_at_period_end || false,
            });

          if (insertError) {
            logger.error({ error: insertError }, '创建订阅记录失败');
          }
        }
      }

      // 更新用户订阅状态
      const { error: userUpdateError } = await db
        .from('users')
        .update({
          subscription_expires_at: subscriptionEndDate?.toISOString() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (userUpdateError) {
        logger.error({ error: userUpdateError }, '更新用户订阅状态失败');
      }

      // 发送订阅确认邮件
      await EmailService.sendSubscriptionConfirmation(
        user.email,
        'Pro Monthly',
        subscriptionEndDate?.toISOString() || null,
        locale, // 使用用户语言偏好
      );

      logger.info({
        userId,
        invoiceId: invoice.id,
        subscriptionId,
        licenseKey: license.licenseKey,
        locale,
      }, '发票支付处理完成');

      return true;
    } catch (error) {
      logger.error({ error, userId, invoiceId: invoice.id }, '处理发票失败');
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

      // 通过 subscriptions 表查找用户ID
      const { data: subscriptionRecord, error: subscriptionError } = await db
        .from('subscriptions')
        .select('user_id')
        .eq('subscription_id', subscription.id)
        .single();

      if (subscriptionError || !subscriptionRecord) {
        logger.error({ error: subscriptionError, subscriptionId: subscription.id }, '找不到匹配的订阅记录');
        return false;
      }

      // 查找用户记录
      const { data: userRecord, error: userError } = await db
        .from('users')
        .select('*')
        .eq('id', subscriptionRecord.user_id)
        .single();

      if (userError || !userRecord) {
        logger.error({ error: userError, userId: subscriptionRecord.user_id }, '找不到匹配的用户记录');
        return false;
      }

      // 更新用户订阅结束时间
      const subscriptionEndDate = new Date(subscription.current_period_end * 1000);

      const { error: updateError } = await db
        .from('users')
        .update({
          subscription_expires_at: subscriptionEndDate.toISOString(),
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

      // 通过 subscriptions 表查找用户ID
      const { data: subscriptionRecord, error: subscriptionError } = await db
        .from('subscriptions')
        .select('user_id')
        .eq('subscription_id', subscription.id)
        .single();

      if (subscriptionError || !subscriptionRecord) {
        logger.error({ error: subscriptionError, subscriptionId: subscription.id }, '找不到匹配的订阅记录');
        return false;
      }

      // 查找用户记录
      const { data: userRecord, error: userError } = await db
        .from('users')
        .select('*')
        .eq('id', subscriptionRecord.user_id)
        .single();

      if (userError || !userRecord) {
        logger.error({ error: userError, userId: subscriptionRecord.user_id }, '找不到匹配的用户记录');
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
          subscription_expires_at: new Date().toISOString(), // 立即过期
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
