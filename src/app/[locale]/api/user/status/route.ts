import { getAuth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { SubscriptionService } from '@/libs/SubscriptionService';
import type { StatusApiResponse } from '@/types/Subscription';

/**
 * 用户状态API - 提供用户的订阅状态信息
 * 用于前端和浏览器扩展
 */
export async function GET(request: NextRequest): Promise<NextResponse<StatusApiResponse>> {
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

    // 获取用户订阅状态
    const userStatus = await SubscriptionService.getUserSubscriptionStatus(userId);

    if (!userStatus) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
      }, { status: 404 });
    }

    // 设置CORS头，允许扩展访问
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    return NextResponse.json({
      success: true,
      data: userStatus,
    }, { headers });
  } catch (error) {
    console.error('获取用户状态出错:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * 处理预检请求
 */
export async function OPTIONS() {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  return new NextResponse(null, { headers });
}
