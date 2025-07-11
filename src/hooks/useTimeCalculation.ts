import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import type { UserSubscriptionStatus } from '@/types/Subscription';

export function useTimeCalculation(userStatus: UserSubscriptionStatus) {
  const t = useTranslations('SubscriptionStatus');

  // 优化后的时间计算函数，使用useMemo缓存结果
  return useMemo(() => {
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

      // 使用国际化文本
      const remainingText = t('time_remaining', {
        days,
        hours,
        minutes,
      });

      return {
        remainingText,
        progress: Math.round(progress),
        expired: false,
      };
    } catch (error) {
      console.error('Date formatting error:', error);
      return { remainingText: '', progress: 0, expired: false };
    }
  }, [userStatus, t]);
}
