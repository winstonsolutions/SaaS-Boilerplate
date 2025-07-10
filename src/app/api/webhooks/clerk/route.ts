import type { WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';

import { createUser, deleteUser, getUser, updateUser } from '@/libs/DB';
import { Env } from '@/libs/Env';

// 确保此路由不受身份验证保护
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Simple logging function for edge runtime
const log = (level: string, message: string, data?: any) => {
  // eslint-disable-next-line no-console
  console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](`[${level.toUpperCase()}] ${message}`, data || '');
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
      log('error', 'Missing svix headers');
      return new NextResponse('Error: Missing svix headers', { status: 400 });
    }

    // 获取请求体
    const payload = await req.json();
    const body = JSON.stringify(payload);
    log('info', 'Received webhook payload', `${body.substring(0, 200)}...`);

    // 验证webhook
    let event: WebhookEvent;
    const webhookSecret = Env.CLERK_WEBHOOK_SECRET || '';

    if (!webhookSecret) {
      log('error', 'CLERK_WEBHOOK_SECRET is not set');
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
      log('error', 'Error verifying webhook', err);
      return new NextResponse('Error: Invalid signature', { status: 400 });
    }

    log('info', 'Processing webhook event', { eventType: event.type });

    // 处理用户创建事件
    if (event.type === 'user.created') {
      const { id, email_addresses, first_name, last_name } = event.data;

      try {
        // 获取主要邮箱
        const primaryEmail = email_addresses.find(email => email.id === event.data.primary_email_address_id);
        if (!primaryEmail) {
          log('error', 'User has no primary email', { userId: id });
          return new NextResponse('User has no primary email', { status: 400 });
        }

        // 创建用户记录
        const user = await createUser({
          clerk_id: id,
          email: primaryEmail.email_address,
          first_name: first_name || undefined,
          last_name: last_name || undefined,
          trial_started_at: new Date(), // 添加试用开始时间
        });

        log('info', 'User created', { userId: id, supabaseId: user?.id || 'unknown' });
        return NextResponse.json({ message: 'User created successfully', userId: user?.id });
      } catch (error) {
        log('error', 'Error creating user', { error, userId: id });
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
          log('error', 'User has no primary email', { userId: id });
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
            trial_started_at: new Date(), // 添加试用开始时间
          });
          log('info', 'User created on update', { userId: id, supabaseId: user?.id || 'unknown' });
          return NextResponse.json({ message: 'User created on update', userId: user?.id });
        } else {
          // 更新现有用户
          const user = await updateUser(existingUser.id, {
            email: primaryEmail.email_address,
            first_name: first_name || undefined,
            last_name: last_name || undefined,
          });
          log('info', 'User updated', { userId: id, supabaseId: user?.id || 'unknown' });
          return NextResponse.json({ message: 'User updated successfully', userId: user?.id });
        }
      } catch (error) {
        log('error', 'Error updating user', { error, userId: id });
        return new NextResponse(`Error updating user: ${String(error)}`, { status: 500 });
      }
    }

    // 处理用户删除事件
    if (event.type === 'user.deleted') {
      const { id } = event.data;

      // 检查id是否存在
      if (!id) {
        log('error', 'User deleted event missing ID');
        return new NextResponse('User ID missing', { status: 400 });
      }

      try {
        // 删除用户记录
        const deletedUser = await deleteUser(id);

        if (deletedUser) {
          log('info', 'User deleted', { userId: id, supabaseId: deletedUser.id });
          return NextResponse.json({ message: 'User deleted successfully', userId: deletedUser.id });
        } else {
          log('warn', 'User not found for deletion', { userId: id });
          return NextResponse.json({ message: 'User not found for deletion' });
        }
      } catch (error) {
        log('error', 'Error deleting user', { error, userId: id });
        return new NextResponse(`Error deleting user: ${String(error)}`, { status: 500 });
      }
    }

    // 处理其他事件类型
    log('info', 'Received webhook', { eventType: event.type });
    return NextResponse.json({ message: `Webhook received: ${event.type}` });
  } catch (error) {
    log('error', 'Unhandled error in webhook handler', { error });
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
}
