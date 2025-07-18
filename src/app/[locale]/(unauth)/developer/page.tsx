import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { DeveloperContactForm } from '@/components/DeveloperContactForm';
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
          <div className="mb-6 inline-block animate-pulse rounded-full bg-gradient-to-r from-green-400 to-blue-500 px-6 py-3 text-white shadow-lg">
            <span className="text-lg font-bold">{t('availability_status')}</span>
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
                <p className="mb-4 text-base">
                  {t('intro_paragraph_1')}
                </p>
                <p className="mb-6 text-base">
                  {t('intro_paragraph_2')}
                </p>

                <div className="mb-8">
                  <h3 className="mb-4 text-2xl font-semibold">{t('location_title')}</h3>
                  <p className="text-base">
                    {t('location_description')}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="relative mb-6 size-48">
                  {/* Open to Work Frame */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 p-1">
                    <div className="relative size-full overflow-hidden rounded-full bg-white">
                      <Image
                        src="/developer-avatar.jpg"
                        alt="Winston Zhao"
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                  </div>
                  {/* Open to Work Badge */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                    <div className="rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                      #OpenToWork
                    </div>
                  </div>
                </div>
                <h3 className="mb-2 text-2xl font-semibold">Winston Zhao</h3>
                <p className="mb-4 text-center text-base text-muted-foreground">{t('developer_title')}</p>
                <div className="mx-auto flex max-w-64 flex-col gap-3">
                  <a
                    href="mailto:winstonzhaotech@gmail.com"
                    className="flex w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-xl bg-white px-5 py-2 shadow-sm transition-transform duration-300 ease-in-out hover:scale-105"
                  >
                    <Image
                      src="/icons8-gmail-480.png"
                      alt="Gmail"
                      width={24}
                      height={24}
                      className="shrink-0"
                    />
                    <span className="whitespace-nowrap text-sm font-medium text-gray-800">Email</span>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/winstontech"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-xl bg-[#0A66C2] px-5 py-2 text-white shadow-sm transition-transform duration-300 ease-in-out hover:scale-105"
                  >
                    <svg className="size-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
                    </svg>
                    <span className="whitespace-nowrap text-sm font-medium">LinkedIn</span>
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
                <h3 className="mb-3 text-2xl font-medium">{t('frontend_title')}</h3>
                <p className="text-base text-muted-foreground">
                  {t('frontend_description')}
                </p>
              </div>
              <div className="rounded-lg bg-card p-6 shadow-sm">
                <h3 className="mb-3 text-2xl font-medium">{t('backend_title')}</h3>
                <p className="text-base text-muted-foreground">
                  {t('backend_description')}
                </p>
              </div>
              <div className="rounded-lg bg-card p-6 shadow-sm">
                <h3 className="mb-3 text-2xl font-medium">{t('database_title')}</h3>
                <p className="text-base text-muted-foreground">
                  {t('database_description')}
                </p>
              </div>
              <div className="rounded-lg bg-card p-6 shadow-sm">
                <h3 className="mb-3 text-2xl font-medium">{t('auth_title')}</h3>
                <p className="text-base text-muted-foreground">
                  {t('auth_description')}
                </p>
              </div>
              <div className="rounded-lg bg-card p-6 shadow-sm">
                <h3 className="mb-3 text-2xl font-medium">{t('payment_title')}</h3>
                <p className="text-base text-muted-foreground">
                  {t('payment_description')}
                </p>
              </div>
              <div className="rounded-lg bg-card p-6 shadow-sm">
                <h3 className="mb-3 text-2xl font-medium">{t('deployment_title')}</h3>
                <p className="text-base text-muted-foreground">
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
                <h3 className="mb-3 text-2xl font-semibold">{t('highlight_1_title')}</h3>
                <p className="text-base text-muted-foreground">
                  {t('highlight_1_description')}
                </p>
              </div>
              <div className="rounded-lg border border-border p-6">
                <h3 className="mb-3 text-2xl font-semibold">{t('highlight_2_title')}</h3>
                <p className="text-base text-muted-foreground">
                  {t('highlight_2_description')}
                </p>
              </div>
              <div className="rounded-lg border border-border p-6">
                <h3 className="mb-3 text-2xl font-semibold">{t('highlight_3_title')}</h3>
                <p className="text-base text-muted-foreground">
                  {t('highlight_3_description')}
                </p>
              </div>
              <div className="rounded-lg border border-border p-6">
                <h3 className="mb-3 text-2xl font-semibold">{t('highlight_4_title')}</h3>
                <p className="text-base text-muted-foreground">
                  {t('highlight_4_description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-2xl font-semibold">{t('career_title')}</h2>
            <p className="mb-8 text-base">
              {t('career_description')}
            </p>
          </div>
        </section>

        <section className="mb-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-8 text-center text-2xl font-semibold">{t('contact_title')}</h2>
            <DeveloperContactForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
