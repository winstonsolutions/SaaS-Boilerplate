import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { AppConfig } from '@/utils/AppConfig';

import { Logo } from './Logo';

export const Footer = () => {
  const t = useTranslations('Footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/30 pb-8 pt-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <Logo />
            </div>
            <p className="mb-4 max-w-md text-sm text-muted-foreground">
              {t('description')}
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://linkedin.com/in/winstontech"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <svg className="size-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                  <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              {t('product')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/#features"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t('features')}
                </Link>
              </li>
              <li>
                <Link
                  href="/#pricing"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t('pricing')}
                </Link>
              </li>
              <li>
                <Link
                  href="/#faq"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t('faq')}
                </Link>
              </li>
              <li>
                <Link
                  href="/#roadmap"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t('roadmap')}
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              {t('resources')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t('blog')}
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t('community')}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t('privacy_policy')}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t('terms_of_service')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Developer Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              {t('developer')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/developer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t('about_me')}
                </Link>
              </li>
              <li>
                <Link
                  href="mailto:winstonzhaotech@gmail.com"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t('contact')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>
            &copy;
            {' '}
            {currentYear}
            {' '}
            {AppConfig.name}
            .
            {' '}
            {t('all_rights_reserved')}
          </p>
        </div>
      </div>
    </footer>
  );
};
