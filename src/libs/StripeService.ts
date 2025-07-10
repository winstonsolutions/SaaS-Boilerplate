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
          { metadata: { userId } },
        );
      } else {
        // 创建新客户并设置元数据
        customer = await stripe.customers.create({
          email,
          metadata: { userId },
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
          metadata: { userId }, // 直接在订阅上设置元数据
        },
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

      // 创建license - 但不激活
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

      // 不再自动更新用户订阅状态为pro，让用户通过邮件中的激活码自行激活
      // 仅记录支付信息
      const { error: paymentError } = await db
        .from('payments')
        .insert({
          user_id: userId,
          license_id: license.id,
          payment_id: paymentIntent,
          amount: session.amount_total ? session.amount_total / 100 : 0, // Stripe金额以分为单位
          currency: session.currency,
          status: 'completed',
        });

      if (paymentError) {
        logger.error({ error: paymentError }, '记录支付信息失败');
        // 不中断流程
      }

      // 注意：一次性支付才在这里发送邮件
      // 订阅支付会在customer.subscription.created中发送邮件
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

      // 如果metadata中没有userId，从customer中获取
      if (!userId && typeof subscription.customer === 'string') {
        const customer = await stripe.customers.retrieve(subscription.customer);
        if (customer && !('deleted' in customer)) {
          userId = customer.metadata?.userId;
        }
      }

      // 如果还是没有userId，尝试从相关的checkout会话中获取
      if (!userId && subscription.latest_invoice) {
        try {
          // 尝试从最新发票中获取userId
          if (typeof subscription.latest_invoice === 'string') {
            const invoice = await stripe.invoices.retrieve(subscription.latest_invoice);

            // 尝试从发票的元数据中获取userId
            if (invoice.metadata && invoice.metadata.userId) {
              userId = invoice.metadata.userId;
              logger.info('从发票元数据中找到userId');
            } else if (invoice.customer && typeof invoice.customer === 'string') { // 如果发票中有customer信息，尝试从customer中获取userId
              const customer = await stripe.customers.retrieve(invoice.customer);
              if (customer && !('deleted' in customer) && customer.metadata?.userId) {
                userId = customer.metadata.userId;
                logger.info('从发票关联的客户元数据中找到userId');
              }
            }
          }
        } catch (err) {
          logger.warn({ error: err }, '从发票中获取userId失败');
        }
      }

      // 如果找不到userId，尝试通过subscription_id从数据库中查询
      if (!userId) {
        const { data: userRecord } = await db
          .from('users')
          .select('id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (userRecord) {
          userId = userRecord.id;
          logger.info({ userId, subscriptionId: subscription.id }, '从数据库中找到用户ID');
        }
      }

      if (!userId) {
        logger.error({
          subscriptionId: subscription.id,
          customerMetadata: subscription.customer,
        }, '订阅缺少userId元数据，无法确定用户ID');
        return false;
      }

      // 验证userId格式（应该是UUID格式）
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        logger.error({
          subscriptionId: subscription.id,
          userId,
        }, '订阅中的userId格式无效');
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
      let subscriptionEndDate;
      try {
        if (subscription.current_period_end) {
          subscriptionEndDate = new Date(subscription.current_period_end * 1000);
        } else {
          // 如果没有结束时间，设置为一个月后
          subscriptionEndDate = new Date();
          subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
        }

        if (Number.isNaN(subscriptionEndDate.getTime())) {
          // 如果日期无效，使用一个月后的日期
          logger.warn({ subscriptionId: subscription.id }, '订阅结束时间无效，使用默认值');
          subscriptionEndDate = new Date();
          subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
        }
      } catch (err) {
        logger.warn({ error: err, subscriptionId: subscription.id }, '处理订阅结束时间出错，使用默认值');
        subscriptionEndDate = new Date();
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
      }

      // 创建license - 但不激活
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

      // 不再自动更新用户订阅状态，让用户通过邮件收到的激活码自行激活
      // 仅保存支付和订阅信息

      // 记录支付信息
      try {
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

        // 只有在有有效payment_id时才记录支付信息
        if (paymentId) {
          // 检查是否已经存在相同的支付记录
          const { data: existingPayment } = await db
            .from('payments')
            .select('id')
            .eq('payment_id', paymentId)
            .eq('user_id', userId)
            .single();

          if (existingPayment) {
            logger.info({
              userId,
              paymentId,
            }, '支付记录已存在，跳过重复创建');
          } else {
            const paymentData: any = {
              user_id: userId,
              license_id: license.id,
              payment_id: paymentId,
              subscription_id: subscription.id,
              amount,
              currency: subscription.currency,
              status: 'completed',
            };

            const { error: paymentError } = await db
              .from('payments')
              .insert(paymentData);

            if (paymentError) {
              logger.error({ error: paymentError }, '记录支付信息失败');
              // 不中断流程
            } else {
              logger.info({
                userId,
                paymentId,
              }, '订阅支付记录创建成功');
            }
          }
        } else {
          logger.warn({ subscriptionId: subscription.id }, '无法获取payment_id，跳过支付记录创建');
        }
      } catch (err) {
        logger.error({ error: err }, '记录支付信息时出错');
        // 不中断流程
      }

      // 发送license key邮件，提示用户在dashboard中激活
      try {
        await EmailService.sendLicenseEmail(
          user.email,
          license.licenseKey,
          subscriptionEndDate.toISOString(),
        );
      } catch (err) {
        logger.error({ error: err }, '发送license key邮件失败');
        // 不中断流程
      }

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
      let subscriptionId = invoice.subscription as string | undefined;

      // 处理没有订阅ID的情况
      if (!subscriptionId) {
        logger.warn('发票中没有订阅ID，尝试从客户信息中获取活跃订阅');

        if (!invoice.customer) {
          logger.error('发票中没有客户ID，无法处理');
          return false;
        }

        // 尝试从客户信息中获取活跃的订阅
        const customerID = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer.id;
        const subscriptions = await stripe.subscriptions.list({
          customer: customerID,
          status: 'active',
          limit: 1,
        });

        if (subscriptions && subscriptions.data && subscriptions.data.length > 0 && subscriptions.data[0]?.id) {
          subscriptionId = subscriptions.data[0].id;
          logger.info({ subscriptionId }, '从客户的活跃订阅中找到订阅ID');
        } else {
          // 如果没有活跃订阅，尝试从metadata获取信息
          // Stripe API可能没有checkout_session属性，使用自定义元数据
          if (invoice.metadata && invoice.metadata.userId) {
            const userId = invoice.metadata.userId;
            logger.info({ userId }, '从发票元数据中获取到userId');

            // 根据userId处理后续逻辑
            return await this.processInvoiceWithUserId(userId, invoice);
          }

          logger.error('无法确定订阅ID或用户ID');
          return false;
        }
      }

      // 获取订阅信息
      if (subscriptionId) {
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

        return await this.processInvoiceWithUserId(userId, invoice, subscriptionId, subscription);
      } else {
        logger.error('缺少有效的订阅ID，无法处理发票');
        return false;
      }
    } catch (error) {
      logger.error({ error }, '处理发票支付webhook失败');
      return false;
    }
  }

  /**
   * 使用用户ID处理发票
   * @param userId 用户ID
   * @param invoice 发票对象
   * @param subscriptionId 可选的订阅ID
   * @param subscription 可选的订阅对象
   */
  private static async processInvoiceWithUserId(
    userId: string,
    invoice: Stripe.Invoice,
    subscriptionId?: string,
    subscription?: Stripe.Subscription,
  ): Promise<boolean> {
    // 检查是否已处理过相同的发票支付
    const invoicePaymentIntent = typeof invoice.payment_intent === 'string' ? invoice.payment_intent : '';
    if (invoicePaymentIntent) {
      try {
        const { data, error } = await db
          .from('payments')
          .select('id')
          .eq('user_id', userId)
          .eq('payment_id', invoicePaymentIntent)
          .limit(1);

        if (!error && data && data.length > 0) {
          logger.info({ userId, invoicePaymentIntent }, '该发票支付已处理过，避免重复处理');
          return true;
        }
      } catch (err) {
        logger.warn({ error: err }, '检查重复支付记录失败');
        // 继续处理
      }
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

    // 计算订阅结束时间，如果有订阅对象
    let subscriptionEndDate = new Date();
    try {
      if (subscription && subscription.current_period_end) {
        subscriptionEndDate = new Date(subscription.current_period_end * 1000);

        if (Number.isNaN(subscriptionEndDate.getTime())) {
          throw new TypeError('Invalid subscription end date');
        }
      } else {
        // 如果没有订阅对象或无效日期，设置为一个月后
        subscriptionEndDate = new Date();
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
      }
    } catch (err) {
      logger.warn({ error: err, subscriptionId }, '处理订阅结束时间出错，使用默认值');
      subscriptionEndDate = new Date();
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
    }

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

    // 不自动更新用户订阅状态，需要用户手动激活
    // 仅保存stripe_subscription_id用于后续管理
    try {
      // 先查询表结构，检查是否存在stripe_subscription_id列
      const { data: tableInfo, error: tableError } = await db
        .from('users')
        .select()
        .limit(1);

      // 只保存stripe_subscription_id，不更新订阅状态
      if (!tableError && tableInfo && tableInfo.length > 0 && subscriptionId) {
        const sampleUser = tableInfo[0];
        if ('stripe_subscription_id' in sampleUser) {
          const { error: updateError } = await db
            .from('users')
            .update({ stripe_subscription_id: subscriptionId })
            .eq('id', userId);

          if (updateError) {
            logger.error({ error: updateError }, '更新用户Stripe订阅ID失败');
            // 不中断流程，这不是关键错误
          }
        } else {
          logger.warn('users表中不存在stripe_subscription_id列，跳过此字段更新');
        }
      }
    } catch (err) {
      logger.error({ error: err }, '更新用户Stripe订阅ID时出错');
      // 不中断流程
    }

    // 检查是否已经存在相同的支付记录（避免重复创建）
    if (invoicePaymentIntent) {
      try {
        const { data: existingPayment } = await db
          .from('payments')
          .select('id')
          .eq('payment_id', invoicePaymentIntent)
          .eq('user_id', userId)
          .single();

        if (existingPayment) {
          logger.info({
            userId,
            paymentId: invoicePaymentIntent,
          }, '支付记录已存在，跳过重复创建');
        } else {
          // 记录支付信息
          const paymentData: any = {
            user_id: userId,
            license_id: license.id,
            payment_id: invoicePaymentIntent,
            amount: invoice.amount_paid / 100,
            currency: invoice.currency,
            status: 'completed',
          };

          // 只有在有订阅ID的情况下才添加
          if (subscriptionId) {
            paymentData.subscription_id = subscriptionId;
          }

          const { error: paymentError } = await db
            .from('payments')
            .insert(paymentData);

          if (paymentError) {
            logger.error({ error: paymentError }, '记录支付信息失败');
            // 不中断流程
          } else {
            logger.info({
              userId,
              paymentId: invoicePaymentIntent,
            }, '新支付记录创建成功');
          }
        }
      } catch (err) {
        logger.error({ error: err }, '检查或创建支付记录时出错');
        // 不中断流程
      }
    } else {
      logger.warn({ userId }, '无有效payment_id，跳过支付记录创建');
    }

    // 注意：invoice.paid事件通常是续费，不发送新的license邮件
    // 只有在初始订阅创建时才发送邮件（在handleSubscriptionCreated中处理）
    logger.info({ userId, licenseId: license.id }, '续费完成，license已创建但不发送邮件');

    return true;
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
