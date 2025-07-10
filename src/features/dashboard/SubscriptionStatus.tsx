'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import type { UserSubscriptionStatus } from '@/types/Subscription';

type SubscriptionStatusProps = {
  userStatus: UserSubscriptionStatus;
};

export function SubscriptionStatusCard({ userStatus }: SubscriptionStatusProps) {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [remaining, setRemaining] = useState('');
  const [progressPercentage, setProgressPercentage] = useState(100);
  const [isExpired, setIsExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 直接处理支付流程
  const handleDirectSubscribe = async () => {
    if (!isSignedIn) {
      router.push('/sign-in?redirect_url=/dashboard');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 创建Stripe结账会话
      const response = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          successUrl: `${window.location.origin}/dashboard?payment=success`,
          cancelUrl: `${window.location.origin}/dashboard?payment=cancelled`,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '创建支付会话失败');
      }

      // 重定向到Stripe结账页面
      if (result.data.checkoutUrl) {
        window.location.href = result.data.checkoutUrl;
      }
    } catch (err) {
      console.error('支付过程出错:', err);
      setError(err instanceof Error ? err.message : '支付过程出现错误');
    } finally {
      setIsLoading(false);
    }
  };

  // 优化后的时间计算函数，使用useMemo缓存结果
  const timeCalculation = React.useMemo(() => {
    const targetDate = userStatus.accountStatus === 'trial'
      ? userStatus.trialEndsAt
      : userStatus.subscriptionEndsAt;

    if (!targetDate) {
      return { remainingText: '', progress: 0, expired: true };
    }

    try {
      const endDate = new Date(targetDate);
      const now = new Date();

      // If date has passed, show expired
      if (endDate < now) {
        return { remainingText: 'expired', progress: 0, expired: true };
      }

      // Calculate days, hours, minutes
      const diffTime = endDate.getTime() - now.getTime();
      const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

      // Calculate progress percentage - showing remaining time (not elapsed time)
      let progress = 100;
      if (userStatus.accountStatus === 'trial') {
        // For trial, assuming 7 days total
        const TRIAL_DAYS = 7;
        const totalTrialMs = TRIAL_DAYS * 24 * 60 * 60 * 1000;
        const remainingMs = diffTime;

        // Calculate what percentage of the trial remains
        progress = Math.min(100, Math.max(0, (remainingMs / totalTrialMs) * 100));
      } else if (userStatus.accountStatus === 'pro') {
        // For subscription, we need subscription start date
        // Since we don't have it, we'll use a fixed value for now
        progress = 70; // Placeholder for remaining subscription time
      }

      return {
        remainingText: `${days}d ${hours}h ${minutes}m remaining`,
        progress: Math.round(progress),
        expired: false,
      };
    } catch (error) {
      console.error('Date formatting error:', error);
      return { remainingText: '', progress: 0, expired: false };
    }
  }, [userStatus]);

  // 使用计算结果
  useEffect(() => {
    setRemaining(timeCalculation.remainingText);
    setProgressPercentage(timeCalculation.progress);
    setIsExpired(timeCalculation.expired);
  }, [timeCalculation]);

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-0">
        <div className="p-6">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Account Status</h3>
            <Badge variant="outline" className="bg-blue-50 font-medium text-blue-600">
              FREE
            </Badge>
          </div>

          {isExpired
            ? (
                <div className="my-2 rounded-md bg-gray-50 p-4">
                  <p className="text-sm">Your trial has expired. Purchase a license to continue using Pro features.</p>
                </div>
              )
            : (
                <>
                  <p className="font-medium">Pro Trial Active</p>
                  {remaining && (
                    <p className="text-sm font-medium text-purple-600">{remaining}</p>
                  )}

                  <div className="my-2 h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-purple-600 transition-all duration-300 ease-in-out"
                      style={{
                        width: `${progressPercentage}%`,
                      }}
                    >
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">
                    Try all Pro features for 7 days
                  </p>
                </>
              )}
        </div>

        <div className="border-t p-6">
          <h3 className="mb-4 font-medium">Pro Features</h3>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium">Custom Themes</p>
              <p className="text-xs text-gray-600">Personalize your progress bar</p>
            </div>
            <div>
              <p className="text-sm font-medium">Advanced Settings</p>
              <p className="text-xs text-gray-600">Countdown Timer Enabled</p>
            </div>
            <div>
              <p className="text-sm font-medium">Priority Support</p>
              <p className="text-xs text-gray-600">Get faster responses</p>
            </div>
          </div>

          <div className="mt-4">
            <Button
              className="w-full"
              variant="outline"
              onClick={handleDirectSubscribe}
              disabled={isLoading}
            >
              {isLoading ? '处理中...' : 'Upgrade Now'}
            </Button>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
