'use client';

import React, { Suspense } from 'react';

import type { UserSubscriptionStatus } from '@/types/Subscription';

import { DashboardContent } from './DashboardContent';
import { DashboardErrorBoundary } from './DashboardErrorBoundary';

// 更精细的骨架屏组件
const DashboardSkeleton = () => (
  <div className="mb-6 rounded-lg border-0 bg-white shadow-sm">
    <div className="p-6">
      <div className="mb-2 flex items-center justify-between">
        <div className="h-6 w-1/4 animate-pulse rounded bg-gray-200"></div>
        <div className="h-6 w-16 animate-pulse rounded bg-blue-100"></div>
      </div>
      <div className="mb-1 h-5 w-1/3 animate-pulse rounded bg-gray-200"></div>
      <div className="mb-2 h-4 w-1/4 animate-pulse rounded bg-purple-100"></div>
      <div className="mb-2 h-2 w-full animate-pulse rounded-full bg-gray-200"></div>
      <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200"></div>
    </div>
    <div className="border-t p-6">
      <div className="mb-4 h-5 w-1/4 animate-pulse rounded bg-gray-200"></div>
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={`skeleton-${i}`}>
            <div className="mb-1 h-4 animate-pulse rounded bg-gray-200"></div>
            <div className="h-3 w-3/4 animate-pulse rounded bg-gray-100"></div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <div className="h-9 w-full animate-pulse rounded bg-gray-200"></div>
      </div>
    </div>
  </div>
);

type DashboardSuspenseProps = {
  isPaymentSuccess: boolean;
  initialUserStatus?: UserSubscriptionStatus | null;
};

export function DashboardSuspense({ isPaymentSuccess, initialUserStatus }: DashboardSuspenseProps) {
  return (
    <DashboardErrorBoundary>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent
          isPaymentSuccess={isPaymentSuccess}
          initialUserStatus={initialUserStatus}
        />
      </Suspense>
    </DashboardErrorBoundary>
  );
}
