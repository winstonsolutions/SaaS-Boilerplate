import type { WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';

import { createUser, getUser, updateUser } from '@/libs/DB';
import { Env } from '@/libs/Env';
import { logger } from '@/libs/Logger';

// 确保此路由不受身份验证保护
export const config = {
  runtime: 'edge',
  unstable_noStore: true,
};

export async function POST(req: NextRequest) {
  try {
    // 验证webhook请求
    const headerPayload = headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    // 如果没有签名头，可能不是来自Clerk的合法请求
    if (!svix_id || !svix_timestamp || !svix_signature) {
      logger.error('Missing svix headers');
      return new NextResponse('Error: Missing svix headers', { status: 400 });
    }

    // 获取请求体
    const payload = await req.json();
    const body = JSON.stringify(payload);
    logger.info({ body: `${body.substring(0, 200)}...` }, 'Received webhook payload');

    // 验证webhook
    let event: WebhookEvent;
    const webhookSecret = Env.CLERK_WEBHOOK_SECRET || '';

    if (!webhookSecret) {
      logger.error('CLERK_WEBHOOK_SECRET is not set');
      return new NextResponse('Server configuration error', { status: 500 });
    }

    try {
      const wh = new Webhook(webhookSecret);
      event = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      logger.error({ err }, 'Error verifying webhook');
      return new NextResponse('Error: Invalid signature', { status: 400 });
    }

    logger.info({ eventType: event.type }, 'Processing webhook event');

    // 处理用户创建事件
    if (event.type === 'user.created') {
      const { id, email_addresses, first_name, last_name } = event.data;

      try {
        // 获取主要邮箱
        const primaryEmail = email_addresses.find(email => email.id === event.data.primary_email_address_id);
        if (!primaryEmail) {
          logger.error({ userId: id }, 'User has no primary email');
          return new NextResponse('User has no primary email', { status: 400 });
        }

        // 创建用户记录
        const user = await createUser({
          clerk_id: id,
          email: primaryEmail.email_address,
          first_name: first_name || undefined,
          last_name: last_name || undefined,
        });

        logger.info({ userId: id, supabaseId: user?.id || 'unknown' }, 'User created');
        return NextResponse.json({ message: 'User created successfully', userId: user?.id });
      } catch (error) {
        logger.error({ error, userId: id }, 'Error creating user');
        return new NextResponse(`Error creating user: ${String(error)}`, { status: 500 });
      }
    }

    // 处理用户更新事件
    if (event.type === 'user.updated') {
      const { id, email_addresses, first_name, last_name } = event.data;

      try {
        // 获取主要邮箱
        const primaryEmail = email_addresses.find(email => email.id === event.data.primary_email_address_id);
        if (!primaryEmail) {
          logger.error({ userId: id }, 'User has no primary email');
          return new NextResponse('User has no primary email', { status: 400 });
        }

        // 查找用户
        const existingUser = await getUser(id);
        if (!existingUser) {
          // 如果用户不存在，创建用户
          const user = await createUser({
            clerk_id: id,
            email: primaryEmail.email_address,
            first_name: first_name || undefined,
            last_name: last_name || undefined,
          });
          logger.info({ userId: id, supabaseId: user?.id || 'unknown' }, 'User created on update');
          return NextResponse.json({ message: 'User created on update', userId: user?.id });
        } else {
          // 更新现有用户
          const user = await updateUser(existingUser.id, {
            email: primaryEmail.email_address,
            first_name: first_name || undefined,
            last_name: last_name || undefined,
          });
          logger.info({ userId: id, supabaseId: user?.id || 'unknown' }, 'User updated');
          return NextResponse.json({ message: 'User updated successfully', userId: user?.id });
        }
      } catch (error) {
        logger.error({ error, userId: id }, 'Error updating user');
        return new NextResponse(`Error updating user: ${String(error)}`, { status: 500 });
      }
    }

    // 处理其他事件类型
    logger.info({ eventType: event.type }, 'Received webhook');
    return NextResponse.json({ message: `Webhook received: ${event.type}` });
  } catch (error) {
    logger.error({ error }, 'Unhandled error in webhook handler');
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
}
