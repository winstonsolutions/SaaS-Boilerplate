import '@/styles/global.css';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import Script from 'next/script';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { unstable_setRequestLocale } from 'next-intl/server';

import { AllLocales } from '@/utils/AppConfig';

export const metadata: Metadata = {
  icons: [
    {
      rel: 'apple-touch-icon',
      url: '/apple-touch-icon.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      url: '/favicon-16x16.png',
    },
    {
      rel: 'icon',
      url: '/favicon.ico',
    },
  ],
};

export function generateStaticParams() {
  return AllLocales.map(locale => ({ locale }));
}

export default function RootLayout(props: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  unstable_setRequestLocale(props.params.locale);

  // Using internationalization in Client Components
  const messages = useMessages();

  // The `suppressHydrationWarning` in <html> is used to prevent hydration errors caused by `next-themes`.
  // Solution provided by the package itself: https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app

  // The `suppressHydrationWarning` attribute in <body> is used to prevent hydration errors caused by Sentry Overlay,
  // which dynamically adds a `style` attribute to the body tag.
  return (
    <html lang={props.params.locale} suppressHydrationWarning>
      <head>
        {/* 内联脚本用于立即显示骨架屏 */}
        <Script id="dashboard-preload" strategy="beforeInteractive">
          {`
          (function() {
            // 只在dashboard页面处理
            if (window.location.pathname.includes('/dashboard')) {
              document.documentElement.classList.add('dashboard-loading');

              // 创建并应用骨架屏样式
              var style = document.createElement('style');
              style.textContent = \`
                .skeleton {
                  background-image: linear-gradient(
                    90deg,
                    rgba(255, 255, 255, 0) 0,
                    rgba(255, 255, 255, 0.5) 50%,
                    rgba(255, 255, 255, 0) 100%
                  );
                  background-size: 100%;
                  animation: shimmer 1.5s infinite linear;
                  background-position: -1000px 0;
                }

                @keyframes shimmer {
                  from { background-position: -1000px 0; }
                  to { background-position: 1000px 0; }
                }

                /* 预先创建骨架屏 */
                #dashboard-preload-skeleton {
                  margin-bottom: 1.5rem;
                  border: 0;
                  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                  background-color: white;
                  border-radius: 0.5rem;
                }
              \`;
              document.head.appendChild(style);

              // 预创建骨架屏
              window.addEventListener('DOMContentLoaded', function() {
                setTimeout(function() {
                  var container = document.querySelector('.container');
                  if (container && !document.getElementById('dashboard-preload-skeleton')) {
                    var skeleton = document.createElement('div');
                    skeleton.id = 'dashboard-preload-skeleton';
                    skeleton.innerHTML = \`
                      <div class="p-6">
                        <div class="flex items-center justify-between mb-2">
                          <div class="h-6 bg-gray-200 rounded w-1/4 skeleton"></div>
                          <div class="h-6 bg-blue-100 rounded w-16 skeleton"></div>
                        </div>
                        <div class="h-5 bg-gray-200 rounded w-1/3 mb-1 skeleton"></div>
                        <div class="h-4 bg-purple-100 rounded w-1/4 mb-2 skeleton"></div>
                        <div class="w-full bg-gray-200 rounded-full h-2 mb-2"></div>
                        <div class="h-4 bg-gray-200 rounded w-1/2 skeleton"></div>
                      </div>
                    \`;
                    container.insertBefore(skeleton, container.firstChild);
                  }
                }, 0);
              });
            }
          })();
        `}
        </Script>
      </head>
      <body className="bg-gradient-to-b from-[#faf5ff] to-[#d8b4fe] text-foreground antialiased" suppressHydrationWarning>
        {/* PRO: Dark mode support for Shadcn UI */}
        <NextIntlClientProvider
          locale={props.params.locale}
          messages={messages}
        >
          {props.children}
          <SpeedInsights />
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
