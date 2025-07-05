'use client';

import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { buttonVariants } from '@/components/ui/buttonVariants';
import { Separator } from '@/components/ui/separator';

export const NavbarAuth = () => {
  const t = useTranslations('Navbar');

  return (
    <>
      {/* Authenticated UI */}
      <SignedIn>
        <li>
          <Separator orientation="vertical" className="h-4" />
        </li>
        <li data-fade>
          <Link href="/dashboard" className="mr-2 opacity-80 hover:opacity-100">{t('dashboard')}</Link>
        </li>
        <li>
          <UserButton
            userProfileMode="navigation"
            userProfileUrl="/dashboard/user-profile"
            appearance={{
              elements: {
                rootBox: 'px-2 py-1.5',
              },
            }}
          />
        </li>
      </SignedIn>

      {/* Unauthenticated UI */}
      <SignedOut>
        <li className="ml-1 mr-2.5" data-fade>
          <Link href="/sign-in">{t('sign_in')}</Link>
        </li>
        <li>
          <Link className={buttonVariants()} href="/sign-up">
            {t('sign_up')}
          </Link>
        </li>
      </SignedOut>
    </>
  );
};
