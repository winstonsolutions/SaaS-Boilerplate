import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { EmailService } from '@/libs/EmailService';
import { logger } from '@/libs/Logger';

/**
 * 测试邮件发送的API端点
 * 仅在开发环境下可用
 */
export async function POST(request: NextRequest) {
  logger.info('====== 测试邮件API被调用 ======');
  logger.info(`NODE_ENV: ${process.env.NODE_ENV}`);

  // 只在开发环境下允许测试
  if (process.env.NODE_ENV !== 'development') {
    logger.info('非开发环境，拒绝访问');
    return NextResponse.json(
      { success: false, error: 'This endpoint is only available in development' },
      { status: 403 },
    );
  }

  try {
    logger.info('开始解析请求体...');

    let requestBody;
    try {
      requestBody = await request.json();
      logger.info({ requestBody }, '请求体');
    } catch (parseError) {
      logger.error({ error: parseError }, '解析JSON失败');
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 },
      );
    }

    const { email } = requestBody;

    if (!email) {
      logger.info('缺少email参数');
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 },
      );
    }

    const targetEmail = 'andyredjohn@gmail.com';
    logger.info(`开始发送测试邮件到: ${targetEmail}`);
    logger.info('环境变量检查:');
    logger.info(`RESEND_API_KEY 配置状态: ${!!process.env.RESEND_API_KEY}`);
    logger.info(`RESEND_API_KEY 值: ${process.env.RESEND_API_KEY?.substring(0, 10)}...`);
    logger.info('使用固定发件人地址: PDF Pro <noreply@winstontech.me>');
    logger.info(`目标邮箱: ${targetEmail}`);
    logger.info(`NODE_ENV: ${process.env.NODE_ENV}`);

    // 发送测试邮件到指定地址
    const success = await EmailService.sendLicenseEmail(
      targetEmail,
      'TEST-PDFPRO-1234-5678-9012',
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天后过期
    );

    logger.info({ success }, '邮件发送结果');

    if (success) {
      logger.info({ email }, '测试邮件发送成功');
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully',
      });
    } else {
      logger.info('邮件发送失败');
      return NextResponse.json(
        { success: false, error: 'Failed to send test email - check server logs for details' },
        { status: 500 },
      );
    }
  } catch (error) {
    logger.error({ error }, '测试邮件API异常');

    return NextResponse.json(
      {
        success: false,
        error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 },
    );
  }
}

// 添加GET方法用于测试API是否正常工作
export async function GET() {
  logger.info('测试邮件API GET请求');
  return NextResponse.json({
    message: 'Email test API is working',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
}
