import { NextResponse } from 'next/server';

import { EmailService } from '@/libs/EmailService';
import { logger } from '@/libs/Logger';

export async function POST(request: Request) {
  try {
    logger.info('API接收到联系表单请求');

    // 解析请求数据
    const { name, email, subject, message } = await request.json();
    logger.info({ name, email, subject }, '联系表单数据');

    // 基本验证
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 },
      );
    }

    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 },
      );
    }

    // 使用EmailService发送联系表单邮件
    logger.info('开始发送联系表单邮件');
    const result = await EmailService.sendContactFormEmail(
      name,
      email,
      subject,
      message,
    );

    if (!result) {
      logger.error('邮件发送失败');
      throw new Error('Failed to send email');
    }

    logger.info('邮件发送成功');

    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully!',
    });
  } catch (error) {
    logger.error({ error }, 'Error processing contact form');

    // 返回错误响应
    return NextResponse.json(
      { error: 'Failed to process contact form submission. Please try again later.' },
      { status: 500 },
    );
  }
}
