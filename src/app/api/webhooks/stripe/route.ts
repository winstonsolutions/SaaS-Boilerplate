import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';

import { logger } from '@/libs/Logger';
import { StripeService } from '@/libs/StripeService';

/**
 * 处理Stripe webhook回调
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 验证请求体不为空
    const rawBody = await request.text();
    if (!rawBody) {
      return NextResponse.json({ error: 'No body' }, { status: 400 });
    }

    // 获取Stripe签名
    const signature = request.headers.get('stripe-signature');
    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // 验证webhook签名
    const isValid = StripeService.verifyWebhookSignature(
      rawBody,
      signature,
    );

    if (!isValid) {
      logger.error('无效的Stripe签名');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 解析事件
    const { Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2024-06-20',
    });

    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || '',
    );

    // 根据事件类型处理
    switch (event.type) {
      case 'checkout.session.completed': {
        // 处理支付完成事件
        const session = event.data.object as Stripe.Checkout.Session;

        // 检查支付状态
        if (session.payment_status !== 'paid') {
          logger.info(
            { sessionId: session.id, paymentStatus: session.payment_status },
            '支付尚未完成，忽略事件',
          );
          return NextResponse.json({ received: true });
        }

        if (session.mode === 'subscription') {
          // 订阅模式 - 记录checkout完成，但实际处理在customer.subscription.created中进行
          logger.info({ sessionId: session.id, subscriptionId: session.subscription }, '订阅支付成功，等待subscription.created事件');
        } else {
          // 一次性支付模式
          const success = await StripeService.handlePaymentSucceeded(event);

          if (!success) {
            logger.error({ sessionId: session.id }, '处理支付成功失败');
            // 虽然处理失败，但我们还是返回200，避免Stripe重试
            return NextResponse.json({ received: true });
          }
        }

        logger.info({ sessionId: session.id }, '支付成功处理完成');
        break;
      }

      case 'customer.subscription.created': {
        // 处理新订阅创建事件
        logger.info('收到新订阅创建事件');
        const success = await StripeService.handleSubscriptionCreated(event);

        if (!success) {
          logger.error('处理订阅创建失败');
          // 返回200，避免Stripe重试
          return NextResponse.json({ received: true });
        }

        logger.info('订阅创建处理完成');
        break;
      }

      case 'invoice.paid': {
        // 处理账单支付事件
        logger.info('收到发票支付事件');
        // 可以处理订阅续费
        const success = await StripeService.handleInvoicePaid(event);
        if (!success) {
          logger.error('处理发票支付失败');
        }
        break;
      }

      case 'customer.subscription.updated': {
        // 处理订阅更新事件
        logger.info('收到订阅更新事件');
        const success = await StripeService.handleSubscriptionUpdated(event);
        if (!success) {
          logger.error('处理订阅更新失败');
        }
        break;
      }

      case 'customer.subscription.deleted': {
        // 处理订阅删除事件
        logger.info('收到订阅删除事件');
        const success = await StripeService.handleSubscriptionDeleted(event);
        if (!success) {
          logger.error('处理订阅删除失败');
        }
        break;
      }

      default:
        // 忽略其他类型的事件
        logger.info({ eventType: event.type }, '忽略未处理的Stripe事件类型');
    }

    // 成功处理事件，返回200状态码
    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error({ error }, '处理Stripe webhook时出错');

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
