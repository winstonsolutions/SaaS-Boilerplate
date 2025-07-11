// 使用服务器组件渲染初始UI
import { auth } from '@clerk/nextjs/server';
import { getTranslations } from 'next-intl/server';
import React from 'react';

import { DashboardSuspense } from '@/features/dashboard/DashboardSuspense';
import { TitleBar } from '@/features/dashboard/TitleBar';
import { SubscriptionService } from '@/libs/SubscriptionService';

export default async function DashboardPage({
  searchParams,
  params,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
  params: { locale: string };
}) {
  // 获取翻译
  const t = await getTranslations({
    locale: params.locale,
    namespace: 'DashboardIndex',
  });

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
      <TitleBar
        title={t('title_bar')}
        description={t('title_bar_description')}
      />

      <div className="container mx-auto max-w-5xl px-4 py-8">
        <DashboardSuspense
          isPaymentSuccess={isPaymentSuccess}
          initialUserStatus={initialUserStatus}
        />
      </div>
    </>
  );
}
