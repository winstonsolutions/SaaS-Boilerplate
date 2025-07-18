import Image from 'next/image';
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
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-2xl font-semibold">{t('story_title')}</h2>
            <p className="mb-4">
              {t('story_paragraph_1')}
            </p>
            <p className="mb-4">
              {t('story_paragraph_2')}
            </p>
          </div>
        </section>

        <section className="mb-16 bg-card/50 py-12">
          <div className="mx-auto max-w-3xl">
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
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-center text-2xl font-semibold">{t('about_me_title')}</h2>
            <div className="flex flex-col items-center">
              <div className="relative mb-6 size-40 overflow-hidden rounded-full">
                <Image
                  src="/developer-avatar.jpg"
                  alt={t('about_me_name')}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <h3 className="text-xl font-medium">{t('about_me_name')}</h3>
              <p className="mb-6 text-muted-foreground">{t('about_me_position')}</p>
              <p className="mb-4 text-center">
                {t('about_me_bio_1')}
              </p>
              <p className="text-center">
                {t('about_me_bio_2')}
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
