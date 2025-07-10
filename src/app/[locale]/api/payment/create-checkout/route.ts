import { getAuth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { logger } from '@/libs/Logger';
import { StripeService } from '@/libs/StripeService';
import { SubscriptionService } from '@/libs/SubscriptionService';

/**
 * 创建支付结账会话API
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 获取用户认证信息
    const auth = getAuth(request);
    const { userId } = auth;

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 });
    }

    // 解析请求体
    const body = await request.json();
    const { successUrl, cancelUrl } = body;

    if (!successUrl || !cancelUrl) {
      return NextResponse.json({
        success: false,
        error: 'Success and cancel URLs are required',
      }, { status: 400 });
    }

    // 获取用户信息
    const user = await SubscriptionService.getUserInfo(userId);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
      }, { status: 404 });
    }

    // 创建结账会话
    const result = await StripeService.createCheckoutSession(
      user.id,
      user.email,
      successUrl,
      cancelUrl,
    );

    if (!result.url) {
      logger.error({ userId, error: result.error }, '创建结账会话失败');

      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to create checkout session',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        checkoutUrl: result.url,
      },
    });
  } catch (error) {
    logger.error({ error }, '创建结账会话时出错');

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
