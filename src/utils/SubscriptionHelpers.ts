import { format, isAfter, isBefore } from 'date-fns';
import { enUS, zhCN } from 'date-fns/locale';

import type { SubscriptionStatus, UserSubscriptionStatus } from '@/types/Subscription';

import { TRIAL_DAYS } from './SubscriptionConfig';

// 格式化显示日期，支持中英文
export const formatDate = (date: Date | string | null, locale: string = 'en'): string => {
  if (!date) {
    return 'N/A';
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const dateLocale = locale === 'zh' ? zhCN : enUS;

  return format(dateObj, 'yyyy-MM-dd', { locale: dateLocale });
};

// 格式化显示到期日期，带剩余天数
export const formatExpiryDate = (date: Date | string | null, locale: string = 'en'): string => {
  if (!date) {
    return 'N/A';
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const dateLocale = locale === 'zh' ? zhCN : enUS;

  // 计算剩余天数
  const diffTime = dateObj.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const formattedDate = format(dateObj, 'yyyy-MM-dd', { locale: dateLocale });

  if (diffDays <= 0) {
    return locale === 'zh'
      ? `${formattedDate} (已过期)`
      : `${formattedDate} (Expired)`;
  }

  return locale === 'zh'
    ? `${formattedDate} (剩余 ${diffDays} 天)`
    : `${formattedDate} (${diffDays} days left)`;
};

// 检查是否在试用期内
export const isInTrialPeriod = (trialStartDate: string | null): boolean => {
  if (!trialStartDate) {
    return false;
  }

  const startDate = new Date(trialStartDate);
  const now = new Date();

  // 计算试用结束日期
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + TRIAL_DAYS);

  return isAfter(now, startDate) && isBefore(now, endDate);
};

// 检查订阅是否有效
export const isSubscriptionActive = (endDate: string | null): boolean => {
  if (!endDate) {
    return false;
  }

  const expiryDate = new Date(endDate);
  const now = new Date();

  return isAfter(expiryDate, now);
};

// 确定用户的订阅状态
export const determineUserStatus = (
  trialStartDate: string | null,
  subscriptionEndDate: string | null,
): SubscriptionStatus => {
  if (isSubscriptionActive(subscriptionEndDate)) {
    return 'pro';
  }

  if (isInTrialPeriod(trialStartDate)) {
    return 'trial';
  }

  if (trialStartDate || subscriptionEndDate) {
    return 'expired';
  }

  return 'inactive';
};

// 检查用户是否有Pro权限（试用期内或付费用户）
export const hasProAccess = (status: UserSubscriptionStatus | string): boolean => {
  if (typeof status === 'string') {
    return status === 'trial' || status === 'pro';
  }

  return status.accountStatus === 'trial' || status.accountStatus === 'pro';
};
