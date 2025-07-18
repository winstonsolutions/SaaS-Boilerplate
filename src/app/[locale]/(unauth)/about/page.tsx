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
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-12">
          <div className="container mx-auto px-6">
            <div className="text-center">
              <h1 className="mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-5xl font-bold text-transparent dark:from-white dark:to-gray-300">
                {t('page_title')}
              </h1>
              <p className="mx-auto whitespace-nowrap text-xl text-muted-foreground/80">
                {t('page_subtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-12">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-6xl">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-bold">{t('story_title')}</h2>
                <div className="mx-auto h-1 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
              </div>
              <div className="mx-auto max-w-4xl space-y-6">
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {t('story_paragraph_1')}
                </p>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {t('story_paragraph_2')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="bg-muted/30 py-20">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-6xl">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-bold">{t('mission_title')}</h2>
                <div className="mx-auto h-1 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <p className="mt-8 whitespace-nowrap text-xl text-muted-foreground">
                  {t('mission_statement')}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="group rounded-2xl bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <h3 className="mb-4 text-xl font-semibold">{t('value_precision_title')}</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {t('value_precision_description')}
                  </p>
                </div>
                <div className="group rounded-2xl bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <h3 className="mb-4 text-xl font-semibold">{t('value_simplicity_title')}</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {t('value_simplicity_description')}
                  </p>
                </div>
                <div className="group rounded-2xl bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <h3 className="mb-4 text-xl font-semibold">{t('value_innovation_title')}</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {t('value_innovation_description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-6xl">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-bold">{t('features_title')}</h2>
                <div className="mx-auto h-1 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="group rounded-2xl border-2 border-border/50 p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
                  <h3 className="mb-4 text-xl font-semibold">{t('feature_1_title')}</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {t('feature_1_description')}
                  </p>
                </div>
                <div className="group rounded-2xl border-2 border-border/50 p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
                  <h3 className="mb-4 text-xl font-semibold">{t('feature_2_title')}</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {t('feature_2_description')}
                  </p>
                </div>
                <div className="group rounded-2xl border-2 border-border/50 p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
                  <h3 className="mb-4 text-xl font-semibold">{t('feature_3_title')}</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {t('feature_3_description')}
                  </p>
                </div>
                <div className="group rounded-2xl border-2 border-border/50 p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
                  <h3 className="mb-4 text-xl font-semibold">{t('feature_4_title')}</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {t('feature_4_description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="bg-muted/30 py-20">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-16">
                <h2 className="mb-4 text-3xl font-bold">{t('vision_title')}</h2>
                <div className="mx-auto h-1 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
              </div>
              <p className="mb-12 text-xl leading-relaxed text-muted-foreground">
                {t('vision_description')}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <a
                  href="/developer"
                  className="rounded-xl bg-primary px-8 py-4 text-lg font-medium text-primary-foreground shadow-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-xl"
                >
                  {t('meet_team_button')}
                </a>
                <a
                  href="/pricing"
                  className="rounded-xl border-2 border-border px-8 py-4 text-lg font-medium shadow-lg transition-all duration-300 hover:bg-muted hover:shadow-xl"
                >
                  {t('get_started_button')}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
