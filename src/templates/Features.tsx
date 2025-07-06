import { useTranslations } from 'next-intl';

import { Background } from '@/components/Background';
import { FeatureCard } from '@/features/landing/FeatureCard';
import { Section } from '@/features/landing/Section';

export const Features = () => {
  const t = useTranslations('Features');

  return (
    <Background>
      <Section
        subtitle={t('section_subtitle')}
        title={t('section_title')}
        description={t('section_description')}
        className="py-20"
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
                  <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3M12 12l8-4.5M12 12v9M12 12L4 7.5" />
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
                  <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3M12 12l8-4.5M12 12v9M12 12L4 7.5" />
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
                  <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3M12 12l8-4.5M12 12v9M12 12L4 7.5" />
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
                  <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3M12 12l8-4.5M12 12v9M12 12L4 7.5" />
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
                  <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3M12 12l8-4.5M12 12v9M12 12L4 7.5" />
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
                  <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3M12 12l8-4.5M12 12v9M12 12L4 7.5" />
                </svg>
              )}
              title={t('feature6_title')}
            >
              {t('feature6_description')}
            </FeatureCard>
          </div>

          {/* Extension-like browser UI showcase */}
          <div className="mx-auto mt-16 max-w-3xl overflow-hidden rounded-lg border border-border bg-card/80 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 border-b border-border bg-card/90 p-3">
              <div className="flex gap-1.5">
                <div className="size-3 rounded-full bg-red-400"></div>
                <div className="size-3 rounded-full bg-yellow-400"></div>
                <div className="size-3 rounded-full bg-green-400"></div>
              </div>
              <div className="flex-1 rounded-md bg-card/50 px-3 py-1.5 text-center text-xs text-muted-foreground">
                chrome-extension://pixel-capture
              </div>
              <div className="size-6 rounded-md bg-purple-100/30 p-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-purple-500">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13 12H3" />
                </svg>
              </div>
            </div>
            <div className="flex h-40 items-center justify-center p-4">
              <div className="text-center">
                <div className="mb-3 inline-block size-12 rounded-lg bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 p-3 shadow-md">
                  <svg
                    className="stroke-white stroke-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M0 0h24v24H0z" stroke="none" />
                    <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3M12 12l8-4.5M12 12v9M12 12L4 7.5" />
                  </svg>
                </div>
                <p className="text-lg font-medium">{t('section_subtitle')}</p>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </Background>
  );
};
