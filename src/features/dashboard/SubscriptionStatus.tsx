'use client';

import { useUser } from '@clerk/nextjs';
import { ArrowRight, Check, Crown, HardDrive, Headphones, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTimeCalculation } from '@/hooks/useTimeCalculation';
import type { UserSubscriptionStatus } from '@/types/Subscription';

type SubscriptionStatusProps = {
  userStatus: UserSubscriptionStatus;
};

// 自定义PDF图标组件
const PdfIcon = ({ className, isPro = false }: { className?: string; isPro?: boolean }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={isPro ? 'text-green-600' : 'text-purple-600'}
        >
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <div className="absolute inset-x-0 bottom-1 flex justify-center">
          <span className={`text-[8px] font-medium ${isPro ? 'text-green-600' : 'text-purple-600'}`}>PDF</span>
        </div>
      </div>
    </div>
  );
};

export function SubscriptionStatusCard({ userStatus }: SubscriptionStatusProps) {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [remaining, setRemaining] = useState('');
  const [progressPercentage, setProgressPercentage] = useState(100);
  const [isExpired, setIsExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('SubscriptionStatus');
  const isPro = userStatus.accountStatus === 'pro';

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

  // 计算剩余时间和进度条
  const timeCalculation = useTimeCalculation(userStatus);

  // 使用计算结果
  useEffect(() => {
    setRemaining(timeCalculation.remainingText);
    setProgressPercentage(timeCalculation.progress);
    setIsExpired(timeCalculation.expired);
  }, [timeCalculation]);

  // Prepare status badge based on account type
  // eslint-disable-next-line style/multiline-ternary
  const statusBadge = isPro ? (
    <Badge variant="outline" className="animate-shine bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 bg-[length:400%_100%] font-medium text-white">
      <Crown className="mr-1 size-3.5" />
      {' '}
      {t('pro_badge')}
    </Badge>
  ) : (
    <Badge variant="outline" className="bg-blue-50 font-medium text-blue-600">
      {t('free_badge')}
    </Badge>
  );

  // Prepare content based on account type
  // eslint-disable-next-line style/multiline-ternary
  const statusContent = !isPro ? (
    <div className="space-y-4">
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-purple-600 transition-all duration-300 ease-in-out"
          style={{
            width: `${progressPercentage}%`,
          }}
        >
        </div>
      </div>

      {/* Free version features text */}
      <p className="text-sm text-gray-600">{t('try_pro_features')}</p>
    </div>
  ) : (
    <>
      <div className="flex items-center gap-2.5 rounded-md bg-green-50/50 p-1.5 pl-3">
        <div className="size-2.5 animate-pulse rounded-full bg-green-500 shadow-sm shadow-green-300"></div>
        <p className="text-sm font-medium text-green-700">{t('active_subscription')}</p>
      </div>

      {/* Features unlocked section - PRO only */}
      <p className="text-sm text-green-700">
        <span className="flex items-center gap-1.5">
          <Check className="size-4 text-green-600" />
          {t('pro_features_unlocked')}
        </span>
      </p>
    </>
  );

  return (
    <Card className={`border-0 shadow-sm transition-all duration-300 ${isPro ? 'bg-gradient-to-b from-white to-green-50' : ''}`}>
      <CardContent className="p-0">
        <div className={`p-6 ${isPro ? 'relative overflow-hidden' : ''}`}>
          {isPro && (
            <>
              <div className="absolute -right-12 -top-12 size-24 rotate-45 bg-gradient-to-br from-green-200 to-green-50 opacity-20"></div>
              <div className="absolute right-4 top-4 size-32 rounded-full bg-gradient-to-b from-green-50 to-transparent opacity-20"></div>
            </>
          )}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t('account_status')}</h3>
            {statusBadge}
          </div>

          {/* Content section - using pre-defined content variables to avoid linting issues */}
          {isExpired && (
            <div className="my-2 rounded-md bg-gray-50 p-4">
              <p className="text-sm">{t('trial_expired')}</p>
            </div>
          )}

          {!isExpired && (
            <div className={`mb-4 space-y-5 rounded-lg ${isPro ? 'bg-white/80 p-4 shadow-sm ring-1 ring-green-100' : ''}`}>
              {/* Status heading section */}
              <div>
                <h4 className={`text-xl font-medium ${isPro ? 'text-green-700' : ''}`}>
                  {isPro ? t('pro_active') : t('pro_trial_active')}
                </h4>
                {remaining && (
                  <p className={`mt-1.5 text-sm font-medium ${isPro ? 'text-green-600' : 'text-purple-600'}`}>
                    {remaining}
                  </p>
                )}
              </div>

              {/* Status indicator section */}
              {statusContent}
            </div>
          )}
        </div>

        <div className={`border-t p-6 ${isPro ? 'bg-gradient-to-b from-white to-green-50/30' : ''}`}>
          <h3 className="mb-6 text-center font-medium">{t('pro_features_title')}</h3>

          <div className="flex flex-wrap justify-around gap-6">
            <div className={`flex max-w-[30%] flex-1 flex-col items-center rounded-lg border p-5 text-center shadow-sm transition-all duration-300 ${isPro ? 'border-green-100 bg-white hover:shadow-md hover:shadow-green-100/50' : 'border-gray-100 bg-white'}`}>
              <PdfIcon className="mb-3 size-8" isPro={isPro} />
              <p className="mb-2 text-sm font-medium">{t('feature_custom_themes')}</p>
              <p className="text-xs text-gray-600">{t('feature_custom_themes_desc')}</p>
            </div>
            <div className={`flex max-w-[30%] flex-1 flex-col items-center rounded-lg border p-5 text-center shadow-sm transition-all duration-300 ${isPro ? 'border-green-100 bg-white hover:shadow-md hover:shadow-green-100/50' : 'border-gray-100 bg-white'}`}>
              <HardDrive className={`mb-3 size-8 ${isPro ? 'text-green-600' : 'text-purple-600'}`} />
              <p className="mb-2 text-sm font-medium">{t('feature_advanced_settings')}</p>
              <p className="text-xs text-gray-600">{t('feature_advanced_settings_desc')}</p>
            </div>
            <div className={`flex max-w-[30%] flex-1 flex-col items-center rounded-lg border p-5 text-center shadow-sm transition-all duration-300 ${isPro ? 'border-green-100 bg-white hover:shadow-md hover:shadow-green-100/50' : 'border-gray-100 bg-white'}`}>
              <Headphones className={`mb-3 size-8 ${isPro ? 'text-green-600' : 'text-purple-600'}`} />
              <p className="mb-2 text-sm font-medium">{t('feature_priority_support')}</p>
              <p className="text-xs text-gray-600">{t('feature_priority_support_desc')}</p>
            </div>
          </div>

          {!isPro && (
            <div className="mt-4">
              <Button
                className="group relative w-full overflow-hidden"
                variant="default"
                onClick={handleDirectSubscribe}
                disabled={isLoading}
              >
                <span className="absolute inset-0 animate-gradient-x bg-gradient-to-r from-purple-600 to-indigo-600"></span>
                <span className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 transition-opacity group-hover:opacity-100"></span>
                <span className="relative flex items-center justify-center gap-2">
                  <Sparkles className="size-4 animate-pulse" />
                  {isLoading ? t('upgrading') : t('upgrade_now')}
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Button>
              {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
