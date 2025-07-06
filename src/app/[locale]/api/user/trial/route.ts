import { getAuth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@/libs/DB';

export async function GET(request: NextRequest) {
  try {
    // 获取用户认证信息
    const auth = getAuth(request);
    const { userId } = auth;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 查询用户试用信息
    const { data, error } = await db
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 如果找不到用户记录，创建一个新的
    if (!data) {
      // 从Clerk获取用户email
      const userEmail = auth.sessionClaims?.email || '';

      // 创建新用户记录
      const now = new Date().toISOString();
      const newUser = {
        clerk_id: userId,
        email: userEmail,
        trial_started_at: now,
        updated_at: now,
      };

      const { data: createdUser, error: insertError } = await db
        .from('users')
        .insert(newUser)
        .select()
        .single();

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      return NextResponse.json({
        trialStartedAt: now,
        user: createdUser,
      });
    }

    return NextResponse.json({
      trialStartedAt: data.trial_started_at,
      user: data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
