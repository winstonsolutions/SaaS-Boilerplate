import { BILLING_INTERVAL, type PricingPlan } from '@/types/Subscription';

// 试用期天数
export const TRIAL_DAYS = 7;

// 提醒发送天数（到期前X天）
export const REMINDER_DAYS = [7, 3, 1];

// 价格计划配置 - 兼容现有类型
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    description: 'Full access to all PixelCapture Pro features',
    priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || 'price_monthly',
    price: 1.99,
    currency: 'USD',
    interval: BILLING_INTERVAL.MONTH,
    features: [
      'PixelCapture Pro 高级功能',
      '无限制使用',
      '优先客户支持',
      '每月自动续期',
    ],
  },
];

// 获取当前价格计划
export const getCurrentPricingPlan = (): PricingPlan => {
  // 确保始终返回一个有效的价格计划
  return PRICING_PLANS[0] || {
    id: 'monthly',
    name: 'Monthly Plan',
    description: 'Full access to all PixelCapture Pro features',
    priceId: 'price_monthly',
    price: 1.99,
    currency: 'USD',
    interval: BILLING_INTERVAL.MONTH,
    features: ['PixelCapture Pro features'],
  };
};

// 检查用户是否有Pro权限（试用期内或付费用户）
export const hasProAccess = (status: string): boolean => {
  return status === 'trial' || status === 'pro';
};

// 计算剩余天数
export const calculateDaysRemaining = (endDate: string | null): number => {
  if (!endDate) {
    return 0;
  }

  const end = new Date(endDate);
  const now = new Date();

  // 将时间设置为当天的23:59:59
  end.setHours(23, 59, 59, 999);

  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
};
