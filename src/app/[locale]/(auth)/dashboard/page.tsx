// 使用服务器组件渲染初始UI
import React from 'react';

import { DashboardContent } from '@/features/dashboard/DashboardContent';
import { TitleBar } from '@/features/dashboard/TitleBar';

export default function DashboardPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // 获取查询参数，如payment=success
  const isPaymentSuccess = searchParams.payment === 'success';

  return (
    <>
      <TitleBar title="Dashboard" />

      <div className="container mx-auto max-w-5xl px-4 py-8">
        <DashboardContent isPaymentSuccess={isPaymentSuccess} />
      </div>
    </>
  );
}
