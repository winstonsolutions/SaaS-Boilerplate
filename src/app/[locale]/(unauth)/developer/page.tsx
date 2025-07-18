import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { Footer } from '@/templates/Footer';
import { Navbar } from '@/templates/Navbar';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'Developer' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default function DeveloperPage(props: { params: { locale: string } }) {
  const { locale } = props.params;
  unstable_setRequestLocale(locale);
  const t = useTranslations('Developer');

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-block rounded-full bg-green-100 px-4 py-2 text-green-800">
            <span className="text-sm font-medium">{t('availability_status')}</span>
          </div>
          <h1 className="mb-4 text-4xl font-bold">{t('page_title')}</h1>
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
            {t('page_subtitle')}
          </p>
        </div>

        <section className="mb-16">
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
              <div className="md:col-span-2">
                <h2 className="mb-6 text-2xl font-semibold">{t('intro_title')}</h2>
                <p className="mb-4 text-lg">
                  {t('intro_paragraph_1')}
                </p>
                <p className="mb-6">
                  {t('intro_paragraph_2')}
                </p>

                <div className="mb-8">
                  <h3 className="mb-4 text-xl font-semibold">{t('location_title')}</h3>
                  <p className="text-muted-foreground">
                    {t('location_description')}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="relative mb-6 size-48 overflow-hidden rounded-full">
                  <Image
                    src="/developer-avatar.jpg"
                    alt="Winston Zhao"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Winston Zhao</h3>
                <p className="mb-4 text-center text-muted-foreground">{t('developer_title')}</p>
                <div className="flex flex-col gap-2">
                  <a
                    href="mailto:winston.zhao@example.com"
                    className="rounded-lg bg-primary px-4 py-2 text-center text-primary-foreground hover:bg-primary/90"
                  >
                    {t('contact_email')}
                  </a>
                  <a
                    href="https://linkedin.com/in/winston-zhao"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-border px-4 py-2 text-center hover:bg-muted"
                  >
                    {t('contact_linkedin')}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-2xl font-semibold">{t('tech_stack_title')}</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg bg-card p-6 shadow-sm">
                <h3 className="mb-3 text-lg font-medium">{t('frontend_title')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('frontend_description')}
                </p>
              </div>
              <div className="rounded-lg bg-card p-6 shadow-sm">
                <h3 className="mb-3 text-lg font-medium">{t('backend_title')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('backend_description')}
                </p>
              </div>
              <div className="rounded-lg bg-card p-6 shadow-sm">
                <h3 className="mb-3 text-lg font-medium">{t('database_title')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('database_description')}
                </p>
              </div>
              <div className="rounded-lg bg-card p-6 shadow-sm">
                <h3 className="mb-3 text-lg font-medium">{t('auth_title')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('auth_description')}
                </p>
              </div>
              <div className="rounded-lg bg-card p-6 shadow-sm">
                <h3 className="mb-3 text-lg font-medium">{t('payment_title')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('payment_description')}
                </p>
              </div>
              <div className="rounded-lg bg-card p-6 shadow-sm">
                <h3 className="mb-3 text-lg font-medium">{t('deployment_title')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('deployment_description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-2xl font-semibold">{t('project_highlights_title')}</h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="rounded-lg border border-border p-6">
                <h3 className="mb-3 text-lg font-semibold">{t('highlight_1_title')}</h3>
                <p className="text-muted-foreground">
                  {t('highlight_1_description')}
                </p>
              </div>
              <div className="rounded-lg border border-border p-6">
                <h3 className="mb-3 text-lg font-semibold">{t('highlight_2_title')}</h3>
                <p className="text-muted-foreground">
                  {t('highlight_2_description')}
                </p>
              </div>
              <div className="rounded-lg border border-border p-6">
                <h3 className="mb-3 text-lg font-semibold">{t('highlight_3_title')}</h3>
                <p className="text-muted-foreground">
                  {t('highlight_3_description')}
                </p>
              </div>
              <div className="rounded-lg border border-border p-6">
                <h3 className="mb-3 text-lg font-semibold">{t('highlight_4_title')}</h3>
                <p className="text-muted-foreground">
                  {t('highlight_4_description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-2xl font-semibold">{t('career_title')}</h2>
            <p className="mb-8 text-lg">
              {t('career_description')}
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <a
                href="mailto:winston.zhao@example.com"
                className="rounded-lg bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90"
              >
                {t('contact_button')}
              </a>
              <a
                href="https://your-portfolio.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-border px-6 py-3 hover:bg-muted"
              >
                {t('portfolio_button')}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
