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
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20">
          <div className="container mx-auto px-6">
            <div className="text-center">
              <div className="mb-8 inline-block animate-pulse rounded-full bg-gradient-to-r from-green-400 to-blue-500 px-6 py-3 text-white shadow-lg">
                <span className="text-lg font-bold">{t('availability_status')}</span>
              </div>
              <h1 className="mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-5xl font-bold text-transparent dark:from-white dark:to-gray-300">
                {t('page_title')}
              </h1>
              <p className="mx-auto max-w-2xl text-xl text-muted-foreground/80">
                {t('page_subtitle')}
              </p>
              <div className="mt-8">
                <a
                  href="https://www.winstontech.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-xl bg-gradient-to-r from-green-500 to-purple-500 px-8 py-4 text-lg font-medium text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:from-green-600 hover:to-purple-600 hover:shadow-xl"
                >
                  <svg className="mr-3 size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  View Portfolio
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-6xl">
              <div className="grid grid-cols-1 gap-16 lg:grid-cols-3">
                <div className="space-y-8 lg:col-span-2">
                  <div>
                    <h2 className="mb-6 text-3xl font-bold">{t('intro_title')}</h2>
                    <div className="space-y-4 text-lg text-muted-foreground">
                      <p>{t('intro_paragraph_1')}</p>
                      <p>{t('intro_paragraph_2')}</p>
                    </div>
                  </div>

                  <div>
                    <h2 className="mb-6 text-3xl font-bold">{t('location_title')}</h2>
                    <div className="space-y-4 text-lg text-muted-foreground">
                      <p>{t('location_description')}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  {/* Profile Card */}
                  <div className="rounded-3xl border-0 bg-white p-8 shadow-xl transition-all duration-300 hover:shadow-2xl">
                    {/* #OpenToWork Badge - Top */}
                    <div className="relative mx-auto mb-2">
                      <div className="absolute -top-6 left-1/2 z-10 -translate-x-1/2">
                        <div className="rounded-full bg-gradient-to-r from-green-500 to-purple-500 px-6 py-2 text-base font-bold text-white shadow-lg">
                          #OpenToWork
                        </div>
                      </div>
                    </div>

                    {/* Avatar */}
                    <div className="relative mx-auto size-40 overflow-hidden rounded-full border-4 border-white shadow-lg">
                      <Image
                        src="/developer-avatar.jpg"
                        alt="Winston Zhao"
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>

                    {/* Name and title */}
                    <div className="mb-6 mt-4 text-center">
                      <h3 className="mb-1 text-2xl font-bold text-gray-900">Winston Zhao</h3>
                      <p className="text-lg text-gray-600">{t('developer_title')}</p>
                    </div>

                    {/* Contact links */}
                    <div className="flex flex-row items-center justify-center gap-3">
                      <a
                        href="mailto:winstonzhaotech@gmail.com"
                        className="flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-2 shadow-md transition-all duration-300 hover:shadow-lg"
                      >
                        <Image
                          src="/icons8-gmail-480.png"
                          alt="Gmail"
                          width={24}
                          height={24}
                          className="mr-2 shrink-0"
                        />
                        <span className="font-medium text-gray-800">Email</span>
                      </a>
                      <a
                        href="https://www.linkedin.com/in/winstontech"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center rounded-xl bg-[#0A66C2] px-5 py-2 text-white shadow-md transition-all duration-300 hover:shadow-lg"
                      >
                        <svg className="mr-2 size-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
                        </svg>
                        <span className="font-medium">LinkedIn</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="bg-muted/30 py-20">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-6xl">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-bold">{t('tech_stack_title')}</h2>
                <div className="mx-auto h-1 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                <div className="group rounded-2xl bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <h3 className="mb-4 text-xl font-semibold">{t('frontend_title')}</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {t('frontend_description')}
                  </p>
                </div>
                <div className="group rounded-2xl bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <h3 className="mb-4 text-xl font-semibold">{t('backend_title')}</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {t('backend_description')}
                  </p>
                </div>
                <div className="group rounded-2xl bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <h3 className="mb-4 text-xl font-semibold">{t('database_title')}</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {t('database_description')}
                  </p>
                </div>
                <div className="group rounded-2xl bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <h3 className="mb-4 text-xl font-semibold">{t('auth_title')}</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {t('auth_description')}
                  </p>
                </div>
                <div className="group rounded-2xl bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <h3 className="mb-4 text-xl font-semibold">{t('payment_title')}</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {t('payment_description')}
                  </p>
                </div>
                <div className="group rounded-2xl bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <h3 className="mb-4 text-xl font-semibold">{t('deployment_title')}</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {t('deployment_description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Project Highlights Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-6xl">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-bold">{t('project_highlights_title')}</h2>
                <div className="mx-auto h-1 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="group rounded-2xl border-2 border-border/50 p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
                  <h3 className="mb-4 text-xl font-semibold">{t('highlight_1_title')}</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {t('highlight_1_description')}
                  </p>
                </div>
                <div className="group rounded-2xl border-2 border-border/50 p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
                  <h3 className="mb-4 text-xl font-semibold">{t('highlight_2_title')}</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {t('highlight_2_description')}
                  </p>
                </div>
                <div className="group rounded-2xl border-2 border-border/50 p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
                  <h3 className="mb-4 text-xl font-semibold">{t('highlight_3_title')}</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {t('highlight_3_description')}
                  </p>
                </div>
                <div className="group rounded-2xl border-2 border-border/50 p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
                  <h3 className="mb-4 text-xl font-semibold">{t('highlight_4_title')}</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {t('highlight_4_description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-4xl">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-bold">{t('contact_title')}</h2>
                <div className="mx-auto h-1 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
              </div>
              <DeveloperContactForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
