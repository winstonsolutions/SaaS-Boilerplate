import { CheckCircle2, CircleDot, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Section } from '@/features/landing/Section';

export const Roadmap = () => {
  const t = useTranslations('Roadmap');

  const features = [
    {
      title: t('feature1_title'),
      description: t('feature1_description'),
      status: 'completed',
    },
    {
      title: t('feature2_title'),
      description: t('feature2_description'),
      status: 'completed',
    },
    {
      title: t('feature3_title'),
      description: t('feature3_description'),
      status: 'completed',
    },
    {
      title: t('feature4_title'),
      description: t('feature4_description'),
      status: 'completed',
    },
    {
      title: t('feature5_title'),
      description: t('feature5_description'),
      status: 'in-progress',
    },
    {
      title: t('feature6_title'),
      description: t('feature6_description'),
      status: 'in-progress',
    },
    {
      title: t('feature7_title'),
      description: t('feature7_description'),
      status: 'planned',
    },
    {
      title: t('feature8_title'),
      description: t('feature8_description'),
      status: 'planned',
    },
  ];

  return (
    <Section
      subtitle={t('section_subtitle')}
      title={t('section_title')}
      description={t('section_description')}
    >
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <div
            key={index}
            className="relative flex flex-col rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="mb-4 flex items-center gap-2">
              {feature.status === 'completed' && (
                <CheckCircle2 className="size-5 text-green-500" />
              )}
              {feature.status === 'in-progress' && (
                <Clock className="size-5 text-amber-500" />
              )}
              {feature.status === 'planned' && (
                <CircleDot className="size-5 text-blue-500" />
              )}
              <h3 className="text-lg font-semibold">{feature.title}</h3>
            </div>
            <p className="text-muted-foreground">{feature.description}</p>
            <div className="mt-4 flex items-center">
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                  feature.status === 'completed'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : feature.status === 'in-progress'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                }`}
              >
                {feature.status === 'completed' && t('status_completed')}
                {feature.status === 'in-progress' && t('status_in_progress')}
                {feature.status === 'planned' && t('status_planned')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};
