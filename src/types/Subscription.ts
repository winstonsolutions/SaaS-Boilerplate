import type { EnumValues } from './Enum';

// 订阅状态类型
export type SubscriptionStatus = 'trial' | 'pro' | 'expired' | 'inactive';

// 计费周期
export const BILLING_INTERVAL = {
  MONTH: 'month',
  YEAR: 'year',
} as const;

export type BillingInterval = EnumValues<typeof BILLING_INTERVAL>;

// 价格计划 - 修改为与现有代码兼容
export type PricingPlan = {
  id: string;
  price: number;
  interval: BillingInterval;
  name?: string;
  description?: string;
  priceId?: string;
  testPriceId?: string;
  devPriceId?: string;
  prodPriceId?: string;
  currency?: string;
  billingInterval?: BillingInterval; // 为了兼容之前的字段命名，保留这个
  features: {
    teamMember?: number;
    website?: number;
    storage?: number;
    transfer?: number;
  } | string[];
};

// License相关类型
export type License = {
  id: string;
  userId: string;
  licenseKey: string;
  expiresAt: string | null;
  createdAt: string;
  active: boolean;
  planType: string;
};

// 用户订阅状态
export type UserSubscriptionStatus = {
  isLoggedIn: boolean;
  accountStatus: SubscriptionStatus;
  isPro: boolean;
  isTrialActive: boolean;
  trialEndsAt: string | null;
  subscriptionEndsAt: string | null;
  email: string;
  licenseKey?: string;
};

// API响应接口
export type StatusApiResponse = {
  success: boolean;
  data?: UserSubscriptionStatus;
  error?: string;
};

// License激活请求
export type LicenseActivationRequest = {
  licenseKey: string;
};

// License激活响应
export type LicenseActivationResponse = {
  success: boolean;
  message: string;
  subscription?: UserSubscriptionStatus;
};

// 以下是原始代码保留的类型，为保持兼容性
export type IStripeSubscription = {
  stripeSubscriptionId: string | null;
  stripeSubscriptionPriceId: string | null;
  stripeSubscriptionStatus: string | null;
  stripeSubscriptionCurrentPeriodEnd: number | null;
};
