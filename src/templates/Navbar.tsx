import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { CenteredMenu } from '@/features/landing/CenteredMenu';
import { Section } from '@/features/landing/Section';

import { Logo } from './Logo';
import { NavbarAuth } from './NavbarAuth';

export const Navbar = () => {
  const t = useTranslations('Navbar');

  return (
    <Section className="sticky top-0 z-50 px-3 py-6 shadow-sm backdrop-blur-sm">
      <CenteredMenu
        logo={<Logo />}
        rightMenu={(
          <>
            {/* PRO: Dark mode toggle button */}
            <li data-fade>
              <LocaleSwitcher />
            </li>

            <NavbarAuth />
          </>
        )}
      >
        <li>
          <Link href="/#features" scroll={true}>{t('features')}</Link>
        </li>
        <li>
          <Link href="/#pricing" scroll={true}>{t('pricing')}</Link>
        </li>
        <li>
          <Link href="/#faq" scroll={true}>{t('faq')}</Link>
        </li>
        <li>
          <Link href="/#roadmap" scroll={true}>{t('roadmap')}</Link>
        </li>
        <li>
          <Link href="https://chrome.google.com/webstore/detail/hcnejpkelpdohoofkpocjmemjomnfjog" target="_blank" rel="noopener noreferrer">{t('chrome')}</Link>
        </li>
      </CenteredMenu>
    </Section>
  );
};
