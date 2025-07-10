import { useTranslations } from 'next-intl';

import { PricingCard } from '@/features/billing/PricingCard';
import { PricingFeature } from '@/features/billing/PricingFeature';
import { PLAN_ID, PricingPlanList } from '@/utils/AppConfig';

// 定义features对象类型
type FeatureObject = {
  teamMember?: number;
  website?: number;
  storage?: number;
  transfer?: number;
};

// 辅助函数：安全地获取feature值
function getFeatureValue(features: any, key: keyof FeatureObject): number {
  if (features && typeof features === 'object' && !Array.isArray(features) && key in features) {
    return features[key] || 0;
  }
  return 0;
}

export const PricingInformation = (props: {
  buttonList: Record<string, React.ReactNode>;
}) => {
  const t = useTranslations('PricingPlan');

  return (
    <div className="mx-auto grid max-w-3xl grid-cols-1 gap-8 md:grid-cols-2">
      {Object.values(PricingPlanList).map(plan => (
        <PricingCard
          key={plan.id}
          planId={plan.id}
          price={plan.price}
          interval={plan.interval}
          button={props.buttonList[plan.id]}
        >
          <PricingFeature>
            {plan.id === PLAN_ID.PRO ? t('feature_pdf_support') : t('feature_basic_formats')}
          </PricingFeature>

          <PricingFeature>
            {t('feature_storage', {
              number: getFeatureValue(plan.features, 'storage'),
            })}
          </PricingFeature>

          <PricingFeature>
            {t('feature_transfer', {
              number: getFeatureValue(plan.features, 'transfer'),
            })}
          </PricingFeature>

          <PricingFeature>{t('feature_email_support')}</PricingFeature>
        </PricingCard>
      ))}
    </div>
  );
};
