// 使用服务器组件渲染初始UI
import { auth } from '@clerk/nextjs/server';
import React from 'react';

import { DashboardSuspense } from '@/features/dashboard/DashboardSuspense';
import { TitleBar } from '@/features/dashboard/TitleBar';
import { SubscriptionService } from '@/libs/SubscriptionService';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // 获取查询参数，如payment=success
  // 支持两种情况: payment=success 或 payment=success?session_id=xxx
  const paymentParam = searchParams.payment;
  const isPaymentSuccess = typeof paymentParam === 'string'
    && (paymentParam === 'success' || paymentParam.startsWith('success'));

  // 服务端预加载用户状态数据
  let initialUserStatus = null;
  try {
    const authResult = await auth();
    if (authResult.userId) {
      initialUserStatus = await SubscriptionService.getUserSubscriptionStatus(authResult.userId);
    }
  } catch (error) {
    console.error('Failed to preload user status:', error);
  }

  return (
    <>
      <TitleBar title="Dashboard" />

      <div className="container mx-auto max-w-5xl px-4 py-8">
        <DashboardSuspense
          isPaymentSuccess={isPaymentSuccess}
          initialUserStatus={initialUserStatus}
        />
      </div>
    </>
  );
}
