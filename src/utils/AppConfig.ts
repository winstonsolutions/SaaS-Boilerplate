import type { LocalePrefix } from 'node_modules/next-intl/dist/types/src/routing/types';

import { BILLING_INTERVAL, type PricingPlan } from '@/types/Subscription';

const localePrefix: LocalePrefix = 'as-needed';

// FIXME: Update this configuration file based on your project information
export const AppConfig = {
  name: 'Pixel Capture',
  locales: [
    {
      id: 'en',
      name: 'English',
    },
    { id: 'fr', name: 'Français' },
    { id: 'zh', name: '中文' },
  ],
  defaultLocale: 'en',
  localePrefix,
};

export const AllLocales = AppConfig.locales.map(locale => locale.id);

export const PLAN_ID = {
  FREE: 'free',
  PRO: 'pro',
} as const;

export const PricingPlanList: Record<string, PricingPlan> = {
  [PLAN_ID.FREE]: {
    id: PLAN_ID.FREE,
    price: 0,
    interval: BILLING_INTERVAL.MONTH,
    testPriceId: '',
    devPriceId: '',
    prodPriceId: '',
    features: {
      teamMember: 1,
      website: 1,
      storage: 2,
      transfer: 2,
    },
  },
  [PLAN_ID.PRO]: {
    id: PLAN_ID.PRO,
    price: 1.99,
    interval: BILLING_INTERVAL.MONTH,
    testPriceId: 'price_pro_test',
    devPriceId: 'price_1PRO',
    prodPriceId: '',
    features: {
      teamMember: 1,
      website: 1,
      storage: 10,
      transfer: 10,
    },
  },
};
