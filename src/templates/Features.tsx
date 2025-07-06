import { useTranslations } from 'next-intl';

import { Background } from '@/components/Background';
import { FeatureCard } from '@/features/landing/FeatureCard';
import { Section } from '@/features/landing/Section';

export const Features = () => {
  const t = useTranslations('Features');

  return (
    <Background>
      <Section
        id="features"
        subtitle={t('section_subtitle')}
        title={t('section_title')}
        description={t('section_description')}
        className="scroll-mt-24 py-20"
      >
        <div className="relative">
          {/* Decorative background elements */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute left-0 top-1/4 size-64 rounded-full bg-purple-200 opacity-30 blur-3xl"></div>
            <div className="absolute bottom-1/3 right-10 size-64 rounded-full bg-indigo-200 opacity-30 blur-3xl"></div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={(
                <svg
                  className="stroke-primary-foreground stroke-2"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M0 0h24v24H0z" stroke="none" />
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21v-12" />
                  <path d="M14 12l2 2" />
                  <path d="M14 16l2-2" />
                </svg>
              )}
              title={t('feature1_title')}
            >
              {t('feature1_description')}
            </FeatureCard>

            <FeatureCard
              icon={(
                <svg
                  className="stroke-primary-foreground stroke-2"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M0 0h24v24H0z" stroke="none" />
                  <path d="M12 3l.01 0" />
                  <path d="M12 7l.01 0" />
                  <path d="M12 11l.01 0" />
                  <path d="M12 15l.01 0" />
                  <path d="M12 19l.01 0" />
                  <path d="M4 12l.01 0" />
                  <path d="M8 12l.01 0" />
                  <path d="M16 12l.01 0" />
                  <path d="M20 12l.01 0" />
                  <rect x="5" y="5" width="14" height="14" rx="1" />
                </svg>
              )}
              title={t('feature2_title')}
            >
              {t('feature2_description')}
            </FeatureCard>

            <FeatureCard
              icon={(
                <svg
                  className="stroke-primary-foreground stroke-2"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M0 0h24v24H0z" stroke="none" />
                  <path d="M19.95 11a8 8 0 1 0 -.5 4m.5 5v-5h-5" />
                  <path d="M13 7l-3 5h4l-3 5" />
                </svg>
              )}
              title={t('feature3_title')}
            >
              {t('feature3_description')}
            </FeatureCard>

            <FeatureCard
              icon={(
                <svg
                  className="stroke-primary-foreground stroke-2"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M0 0h24v24H0z" stroke="none" />
                  <path d="M7 18a4.6 4.4 0 0 1 0 -9a5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7h-12" />
                  <path d="M11 13v2m0 3v2m4 -5v2m0 3v2" />
                </svg>
              )}
              title={t('feature4_title')}
            >
              {t('feature4_description')}
            </FeatureCard>

            <FeatureCard
              icon={(
                <svg
                  className="stroke-primary-foreground stroke-2"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M0 0h24v24H0z" stroke="none" />
                  <path d="M4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-16a2 2 0 0 0 -2 -2h-12a2 2 0 0 0 -2 2z" />
                  <path d="M8 11h8" />
                  <path d="M8 15h5" />
                  <path d="M8 7h8" />
                  <rect x="14" y="14" width="4" height="4" rx="1" />
                </svg>
              )}
              title={t('feature5_title')}
            >
              {t('feature5_description')}
            </FeatureCard>

            <FeatureCard
              icon={(
                <svg
                  className="stroke-primary-foreground stroke-2"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M0 0h24v24H0z" stroke="none" />
                  <rect x="3" y="4" width="18" height="8" rx="1" />
                  <rect x="3" y="12" width="8" height="8" rx="1" />
                  <rect x="13" y="12" width="8" height="8" rx="1" />
                  <path d="M7 8v.01" />
                  <path d="M17 8v.01" />
                  <path d="M7 16v.01" />
                  <path d="M17 16v.01" />
                  <path d="M12 8h.01" />
                </svg>
              )}
              title={t('feature6_title')}
            >
              {t('feature6_description')}
            </FeatureCard>
          </div>
        </div>
      </Section>
    </Background>
  );
};
