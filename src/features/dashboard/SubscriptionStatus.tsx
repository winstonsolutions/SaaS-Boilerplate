'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTimeCalculation } from '@/hooks/useTimeCalculation';
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
  const t = useTranslations('SubscriptionStatus');

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

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-0">
        <div className="p-6">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t('account_status')}</h3>
            <Badge variant="outline" className={`font-medium ${userStatus.accountStatus === 'pro' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
              {userStatus.accountStatus === 'pro' ? t('pro_badge') : t('free_badge')}
            </Badge>
          </div>

          {isExpired
            ? (
                <div className="my-2 rounded-md bg-gray-50 p-4">
                  <p className="text-sm">{t('trial_expired')}</p>
                </div>
              )
            : (
                <>
                  <p className="font-medium">
                    {userStatus.accountStatus === 'pro' ? t('pro_active') : t('pro_trial_active')}
                  </p>
                  {remaining && (
                    <p className="text-sm font-medium text-purple-600">{remaining}</p>
                  )}

                  {userStatus.accountStatus !== 'pro'
                    ? (
                        <div className="my-2 h-2 w-full rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-purple-600 transition-all duration-300 ease-in-out"
                            style={{
                              width: `${progressPercentage}%`,
                            }}
                          >
                          </div>
                        </div>
                      )
                    : null}

                  <p className="text-sm text-gray-600">
                    {userStatus.accountStatus === 'pro'
                      ? t('pro_features_unlocked')
                      : t('try_pro_features')}
                  </p>
                </>
              )}
        </div>

        <div className="border-t p-6">
          <h3 className="mb-4 font-medium">{t('pro_features_title')}</h3>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium">{t('feature_custom_themes')}</p>
              <p className="text-xs text-gray-600">{t('feature_custom_themes_desc')}</p>
            </div>
            <div>
              <p className="text-sm font-medium">{t('feature_advanced_settings')}</p>
              <p className="text-xs text-gray-600">{t('feature_advanced_settings_desc')}</p>
            </div>
            <div>
              <p className="text-sm font-medium">{t('feature_priority_support')}</p>
              <p className="text-xs text-gray-600">{t('feature_priority_support_desc')}</p>
            </div>
          </div>

          {userStatus.accountStatus !== 'pro' && (
            <div className="mt-4">
              <Button
                className="w-full"
                variant="outline"
                onClick={handleDirectSubscribe}
                disabled={isLoading}
              >
                {isLoading ? t('upgrading') : t('upgrade_now')}
              </Button>
              {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
