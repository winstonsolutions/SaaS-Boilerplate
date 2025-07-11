'use client';

import { useParams } from 'next/navigation';
import React, { useCallback } from 'react';

import { DevUserInfo } from '@/features/dashboard/DevUserInfo';
import { LicenseActivation } from '@/features/dashboard/LicenseActivation';
import { PaymentSuccessNotice } from '@/features/dashboard/PaymentSuccessNotice';
import { SubscriptionStatusCard } from '@/features/dashboard/SubscriptionStatus';
import { usePerformance } from '@/hooks/usePerformance';
import { useUserData } from '@/hooks/useUserData';
import type { UserSubscriptionStatus } from '@/types/Subscription';
import { ExtensionBridge } from '@/utils/ExtensionBridge';

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
  const { userStatus, isLoading, refetch } = useUserData(locale, initialUserStatus);
  const { markStart, markEnd } = usePerformance('DashboardContent');

  // Create a refresh function to pass to children
  const refreshUserStatus = useCallback(() => {
    refetch();
  }, [refetch]);

  // 添加扩展状态同步（仅在初始用户状态时同步，避免与useUserData重复）
  React.useEffect(() => {
    if (initialUserStatus && userStatus && !isLoading) {
      // 只有当使用了初始数据时才在这里同步，避免与useUserData重复
      const isPro = userStatus.accountStatus === 'pro'; // 真正的付费用户
      const isInTrial = userStatus.accountStatus === 'trial'; // 试用用户

      // 同步到扩展（防止重复调用）
      ExtensionBridge.notifyLogin(isPro, isInTrial);
    }
  }, [userStatus, isLoading, initialUserStatus]);

  // Create a unique key for components based on status
  const statusKey = userStatus ? `status-${userStatus.accountStatus}-${Date.now()}` : 'loading';

  // 性能监控
  React.useEffect(() => {
    if (isLoading) {
      markStart('data-loading');
    }
  }, [isLoading, markStart]);

  React.useEffect(() => {
    if (!isLoading && userStatus) {
      // 确保在markStart之后调用markEnd
      try {
        markEnd('data-loading');
      } catch {
        // 如果mark不存在，忽略错误
      }
    }
  }, [isLoading, userStatus, markEnd]);

  return (
    <>
      {/* DevUserInfo 组件 - 只在开发环境显示 */}
      <DevUserInfo />

      {/* 简单API测试 */}
      {/* <SimpleEmailTest /> */}

      {/* 邮件测试面板 - 只在开发环境显示 */}
      {/* <EmailTestPanel /> */}

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
                <div className="mb-6" key={statusKey}>
                  <SubscriptionStatusCard userStatus={userStatus} />
                </div>
              )}

              {userStatus && (
                <div className="mb-6">
                  <LicenseActivation onActivated={refreshUserStatus} />
                </div>
              )}
            </>
          )}
    </>
  );
}
