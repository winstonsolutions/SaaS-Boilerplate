import { useTranslations } from 'next-intl';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { Footer } from '@/templates/Footer';
import { Navbar } from '@/templates/Navbar';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'About' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default function AboutPage(props: { params: { locale: string } }) {
  const { locale } = props.params;
  unstable_setRequestLocale(locale);
  const t = useTranslations('About');

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold">{t('page_title')}</h1>
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
            {t('page_subtitle')}
          </p>
        </div>

        <section className="mb-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 text-2xl font-semibold">{t('story_title')}</h2>
            <p className="mb-4 text-lg">
              {t('story_paragraph_1')}
            </p>
            <p className="mb-4 text-lg">
              {t('story_paragraph_2')}
            </p>
          </div>
        </section>

        <section className="mb-16 bg-card/50 py-12">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 text-center text-2xl font-semibold">{t('mission_title')}</h2>
            <p className="mb-8 text-center text-lg">
              {t('mission_statement')}
            </p>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="rounded-lg bg-background p-6 shadow-sm">
                <h3 className="mb-3 text-lg font-medium">{t('value_precision_title')}</h3>
                <p className="text-muted-foreground">
                  {t('value_precision_description')}
                </p>
              </div>
              <div className="rounded-lg bg-background p-6 shadow-sm">
                <h3 className="mb-3 text-lg font-medium">{t('value_simplicity_title')}</h3>
                <p className="text-muted-foreground">
                  {t('value_simplicity_description')}
                </p>
              </div>
              <div className="rounded-lg bg-background p-6 shadow-sm">
                <h3 className="mb-3 text-lg font-medium">{t('value_innovation_title')}</h3>
                <p className="text-muted-foreground">
                  {t('value_innovation_description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 text-center text-2xl font-semibold">{t('features_title')}</h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="rounded-lg border border-border p-6">
                <h3 className="mb-3 text-xl font-semibold">{t('feature_1_title')}</h3>
                <p className="text-muted-foreground">
                  {t('feature_1_description')}
                </p>
              </div>
              <div className="rounded-lg border border-border p-6">
                <h3 className="mb-3 text-xl font-semibold">{t('feature_2_title')}</h3>
                <p className="text-muted-foreground">
                  {t('feature_2_description')}
                </p>
              </div>
              <div className="rounded-lg border border-border p-6">
                <h3 className="mb-3 text-xl font-semibold">{t('feature_3_title')}</h3>
                <p className="text-muted-foreground">
                  {t('feature_3_description')}
                </p>
              </div>
              <div className="rounded-lg border border-border p-6">
                <h3 className="mb-3 text-xl font-semibold">{t('feature_4_title')}</h3>
                <p className="text-muted-foreground">
                  {t('feature_4_description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-2xl font-semibold">{t('vision_title')}</h2>
            <p className="mb-8 text-lg">
              {t('vision_description')}
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <a
                href="/developer"
                className="rounded-lg bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90"
              >
                {t('meet_team_button')}
              </a>
              <a
                href="/pricing"
                className="rounded-lg border border-border px-6 py-3 hover:bg-muted"
              >
                {t('get_started_button')}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
