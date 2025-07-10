import { getAuth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { LicenseService } from '@/libs/LicenseService';
import { logger } from '@/libs/Logger';
import { SubscriptionService } from '@/libs/SubscriptionService';

/**
 * 激活许可证密钥的API端点
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
    const { licenseKey } = body;

    if (!licenseKey) {
      return NextResponse.json({
        success: false,
        error: 'License key is required',
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

    // 激活许可证
    const result = await LicenseService.activateLicense(licenseKey, user.id);

    if (!result.success) {
      logger.warn({ userId, licenseKey, message: result.message }, '激活许可证失败');

      return NextResponse.json({
        success: false,
        error: result.message,
      }, { status: 400 });
    }

    // 成功后获取最新的订阅状态
    const updatedUserStatus = await SubscriptionService.getUserSubscriptionStatus(userId);

    logger.info({ userId, licenseKey }, '许可证激活成功');

    return NextResponse.json({
      success: true,
      message: result.message,
      data: updatedUserStatus,
    });
  } catch (error) {
    logger.error({ error }, '激活许可证密钥出错');

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
