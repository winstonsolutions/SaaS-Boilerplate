'use client';

import { useParams } from 'next/navigation';
import React from 'react';

import { DevUserInfo } from '@/features/dashboard/DevUserInfo';
import { LicenseActivation } from '@/features/dashboard/LicenseActivation';
import { PaymentSuccessNotice } from '@/features/dashboard/PaymentSuccessNotice';
import { SubscriptionStatusCard } from '@/features/dashboard/SubscriptionStatus';
import { usePerformance } from '@/hooks/usePerformance';
import { useUserData } from '@/hooks/useUserData';
import type { UserSubscriptionStatus } from '@/types/Subscription';

// 清理后的骨架屏组件
const DashboardSkeleton = () => (
  <div className="mb-6 animate-pulse rounded-lg border-0 bg-white shadow-sm">
    <div className="p-6">
      <div className="mb-2 flex items-center justify-between">
        <div className="h-6 w-1/4 rounded bg-gray-200"></div>
        <div className="h-6 w-16 rounded bg-blue-100"></div>
      </div>
      <div className="mb-1 h-5 w-1/3 rounded bg-gray-200"></div>
      <div className="mb-2 h-4 w-1/4 rounded bg-purple-100"></div>
      <div className="mb-2 h-2 w-full rounded-full bg-gray-200"></div>
      <div className="h-4 w-1/2 rounded bg-gray-200"></div>
    </div>
    <div className="border-t p-6">
      <div className="mb-4 h-5 w-1/4 rounded bg-gray-200"></div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="mb-1 h-4 rounded bg-gray-200"></div>
          <div className="h-3 w-3/4 rounded bg-gray-100"></div>
        </div>
        <div>
          <div className="mb-1 h-4 rounded bg-gray-200"></div>
          <div className="h-3 w-3/4 rounded bg-gray-100"></div>
        </div>
        <div>
          <div className="mb-1 h-4 rounded bg-gray-200"></div>
          <div className="h-3 w-3/4 rounded bg-gray-100"></div>
        </div>
      </div>
      <div className="mt-4">
        <div className="h-9 w-full rounded bg-gray-200"></div>
      </div>
    </div>
  </div>
);

type DashboardContentProps = {
  isPaymentSuccess: boolean;
  initialUserStatus?: UserSubscriptionStatus | null;
};

export function DashboardContent({ isPaymentSuccess, initialUserStatus }: DashboardContentProps) {
  const params = useParams();
  const locale = params.locale as string;
  const { userStatus, isLoading, error } = useUserData(locale, initialUserStatus);
  const { markStart, markEnd } = usePerformance('DashboardContent');

  // 性能监控
  React.useEffect(() => {
    if (!isLoading && userStatus) {
      markEnd('data-loading');
    }
  }, [isLoading, userStatus, markEnd]);

  React.useEffect(() => {
    if (isLoading) {
      markStart('data-loading');
    }
  }, [isLoading, markStart]);

  if (error) {
    return (
      <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-6">
        <h3 className="text-lg font-semibold text-red-800">Error</h3>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <>
      {/* DevUserInfo 组件 - 只在开发环境显示 */}
      <DevUserInfo />

      {/* 支付成功通知 */}
      {isPaymentSuccess && (
        <div className="mb-6">
          <PaymentSuccessNotice />
        </div>
      )}

      {/* 条件渲染：骨架屏或实际内容 */}
      {isLoading
        ? (
            <DashboardSkeleton />
          )
        : (
            <>
              {userStatus && (
                <div className="mb-6">
                  <SubscriptionStatusCard userStatus={userStatus} />
                </div>
              )}

              {userStatus && userStatus.accountStatus !== 'pro' && (
                <div className="mb-6">
                  <LicenseActivation />
                </div>
              )}
            </>
          )}
    </>
  );
}
