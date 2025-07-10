import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { logger } from '@/libs/Logger';

/**
 * 调试邮件配置的API端点
 * 仅在开发环境下可用
 */
export async function GET() {
  // 只在开发环境下允许访问
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { success: false, error: 'This endpoint is only available in development' },
      { status: 403 },
    );
  }

  const emailConfig = {
    from: 'PDF Pro <noreply@winstontech.me>',
    to: 'andyredjohn@gmail.com',
    subject: 'PDF Pro - 您的许可证密钥已就绪',
    resendApiKey: process.env.RESEND_API_KEY ? 'Configured' : 'Not configured',
    resendApiKeyLength: process.env.RESEND_API_KEY?.length || 0,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  };

  logger.info(emailConfig, '邮件配置调试信息');

  return NextResponse.json({
    success: true,
    message: 'Email configuration debug info',
    config: emailConfig,
  });
}

export async function POST(_request: NextRequest) {
  // 只在开发环境下允许测试
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { success: false, error: 'This endpoint is only available in development' },
      { status: 403 },
    );
  }

  try {
    logger.info('====== 直接测试Resend API ======');

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'RESEND_API_KEY not configured' },
        { status: 500 },
      );
    }

    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const emailConfig = {
      from: 'PDF Pro <noreply@winstontech.me>',
      to: 'andyredjohn@gmail.com',
      subject: 'PDF Pro - 测试邮件',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">测试邮件</h2>
          <p>这是一封来自PDF Pro的测试邮件。</p>
          <p><strong>发送时间:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>发件人:</strong> PDF Pro &lt;noreply@winstontech.me&gt;</p>
          <p>如果您收到这封邮件，说明邮件发送功能正常工作。</p>
        </div>
      `,
    };

    logger.info(emailConfig, '发送邮件配置');

    const { data, error } = await resend.emails.send(emailConfig);

    if (error) {
      logger.error({ error }, 'Resend API错误');
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Resend API error',
          details: error,
        },
        { status: 500 },
      );
    }

    logger.info({ data }, '邮件发送成功');
    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      emailId: data?.id,
      config: emailConfig,
    });
  } catch (error) {
    logger.error({ error }, '测试邮件发送异常');
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
