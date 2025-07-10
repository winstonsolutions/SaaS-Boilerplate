'use client';

import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { LicenseActivation } from '@/features/dashboard/LicenseActivation';
import { PaymentSuccessNotice } from '@/features/dashboard/PaymentSuccessNotice';
import { SubscriptionStatusCard } from '@/features/dashboard/SubscriptionStatus';
import type { UserSubscriptionStatus } from '@/types/Subscription';

// 预渲染骨架组件 - 立即显示，使用动画
const StaticSkeleton = () => (
  <div className="mb-6 rounded-lg border-0 bg-white shadow-sm">
    <div className="p-6">
      <div className="mb-2 flex items-center justify-between">
        <div className="skeleton h-6 w-1/4 rounded bg-gray-200"></div>
        <div className="skeleton h-6 w-16 rounded bg-blue-100"></div>
      </div>
      <div className="skeleton mb-1 h-5 w-1/3 rounded bg-gray-200"></div>
      <div className="skeleton mb-2 h-4 w-1/4 rounded bg-purple-100"></div>
      <div className="mb-2 h-2 w-full rounded-full bg-gray-200"></div>
      <div className="skeleton h-4 w-1/2 rounded bg-gray-200"></div>
    </div>
    <div className="border-t p-6">
      <div className="skeleton mb-4 h-5 w-1/4 rounded bg-gray-200"></div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="skeleton mb-1 h-4 rounded bg-gray-200"></div>
          <div className="skeleton h-3 w-3/4 rounded bg-gray-100"></div>
        </div>
        <div>
          <div className="skeleton mb-1 h-4 rounded bg-gray-200"></div>
          <div className="skeleton h-3 w-3/4 rounded bg-gray-100"></div>
        </div>
        <div>
          <div className="skeleton mb-1 h-4 rounded bg-gray-200"></div>
          <div className="skeleton h-3 w-3/4 rounded bg-gray-100"></div>
        </div>
      </div>
      <div className="mt-4">
        <div className="skeleton h-9 w-full rounded bg-gray-200"></div>
      </div>
    </div>
  </div>
);

// 使用DOMContentLoaded事件直接操作DOM显示骨架屏
if (typeof document !== 'undefined') {
  // 在脚本运行时立即执行
  const skeletonContainer = document.createElement('div');
  skeletonContainer.id = 'initial-skeleton';
  skeletonContainer.innerHTML = `
    <div class="mb-6 border-0 shadow-sm bg-white rounded-lg">
      <div class="p-6">
        <div class="flex items-center justify-between mb-2">
          <div class="h-6 bg-gray-200 rounded w-1/4 skeleton"></div>
          <div class="h-6 bg-blue-100 rounded w-16 skeleton"></div>
        </div>
        <div class="h-5 bg-gray-200 rounded w-1/3 mb-1 skeleton"></div>
        <div class="h-4 bg-purple-100 rounded w-1/4 mb-2 skeleton"></div>
        <div class="w-full bg-gray-200 rounded-full h-2 mb-2"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2 skeleton"></div>
      </div>
      <div class="border-t p-6">
        <div class="h-5 bg-gray-200 rounded w-1/4 mb-4 skeleton"></div>
        <div class="grid grid-cols-3 gap-4">
          <div>
            <div class="h-4 bg-gray-200 rounded mb-1 skeleton"></div>
            <div class="h-3 bg-gray-100 rounded w-3/4 skeleton"></div>
          </div>
          <div>
            <div class="h-4 bg-gray-200 rounded mb-1 skeleton"></div>
            <div class="h-3 bg-gray-100 rounded w-3/4 skeleton"></div>
          </div>
          <div>
            <div class="h-4 bg-gray-200 rounded mb-1 skeleton"></div>
            <div class="h-3 bg-gray-100 rounded w-3/4 skeleton"></div>
          </div>
        </div>
        <div class="mt-4">
          <div class="h-9 bg-gray-200 rounded w-full skeleton"></div>
        </div>
      </div>
    </div>
  `;

  // 页面加载时立即执行，使用requestAnimationFrame确保在首帧渲染
  requestAnimationFrame(() => {
    const dashboardContainer = document.querySelector('.container');
    if (dashboardContainer && !document.querySelector('#initial-skeleton')) {
      dashboardContainer.appendChild(skeletonContainer);
      document.body.classList.add('dashboard-loading');
    }
  });
}

export function DashboardContent({ isPaymentSuccess }: { isPaymentSuccess: boolean }) {
  const params = useParams();
  const locale = params.locale as string;
  const [userStatus, setUserStatus] = useState<UserSubscriptionStatus | null>(null);
  const [showSkeleton, setShowSkeleton] = useState(true);

  // 在页面完全加载后立即获取数据
  useEffect(() => {
    // 预先显示骨架，无需等待任何状态
    document.body.classList.add('dashboard-loading');

    // 移除初始骨架屏的辅助函数
    const removeInitialSkeleton = () => {
      const initialSkeleton = document.getElementById('initial-skeleton');
      if (initialSkeleton) {
        initialSkeleton.remove();
      }
    };

    // 避免在SSR期间执行
    if (typeof window === 'undefined') {
      return;
    }

    // 预先优化，立即启动数据获取
    let dataFetchStarted = false;

    // 使用原生fetch避免React状态更新延迟
    async function fetchData() {
      if (dataFetchStarted) {
        return;
      }
      dataFetchStarted = true;

      try {
        // 直接启动请求，不等待任何状态
        const response = await fetch(`/${locale}/api/user/status`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.data) {
          // 先设置数据
          setUserStatus(data.data);
          // 再隐藏骨架屏
          removeInitialSkeleton();
          setTimeout(() => {
            setShowSkeleton(false);
            document.body.classList.remove('dashboard-loading');
          }, 50); // 更短的延迟
        }
      } catch (error) {
        console.error('Error fetching user status:', error);
        removeInitialSkeleton();
        setShowSkeleton(false);
        document.body.classList.remove('dashboard-loading');
      }
    }

    // 立即启动数据获取，不等待任何状态
    fetchData();

    // 在任何情况下，最多显示骨架屏1秒
    const timer = setTimeout(() => {
      removeInitialSkeleton();
      setShowSkeleton(false);
      document.body.classList.remove('dashboard-loading');
    }, 1000);

    return () => {
      clearTimeout(timer);
      removeInitialSkeleton();
      document.body.classList.remove('dashboard-loading');
    };
  }, [locale]);

  // 始终返回内容，而不是等待
  return (
    <>
      {/* 支付成功通知 */}
      {isPaymentSuccess && (
        <div className="mb-6">
          <PaymentSuccessNotice />
        </div>
      )}

      {/* 条件渲染：骨架屏或实际内容 */}
      {showSkeleton
        ? (
            <StaticSkeleton />
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
