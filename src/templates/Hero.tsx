import { GitHubLogoIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { buttonVariants } from '@/components/ui/buttonVariants';
import { CenteredHero } from '@/features/landing/CenteredHero';
import { Section } from '@/features/landing/Section';

export const Hero = () => {
  const t = useTranslations('Hero');

  return (
    <Section className="py-36">
      <CenteredHero
        banner={null}
        title={(
          <>
            <div className="mb-4">
              {t.rich('title_first_line', {
                important: chunks => (
                  <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    {chunks}
                  </span>
                ),
              })}
            </div>
            <div>
              {t('title_second_line')}
            </div>
          </>
        )}
        description={t('description')}
        chromeButton={(
          <a
            href="https://chrome.google.com/webstore"
            target="_blank"
            rel="noopener noreferrer"
            className="mx-auto mt-8 flex w-96 items-center justify-center gap-4 rounded-full bg-green-400 px-10 py-5 text-3xl font-medium text-black shadow-lg transition-all hover:bg-green-500"
          >
            <Image
              src="/assets/images/chrome-store-logo.svg"
              alt="Chrome Web Store logo"
              width={40}
              height={40}
            />
            Add to Chrome
          </a>
        )}
        buttons={(
          <>
            <a
              className={buttonVariants({ size: 'lg' })}
              href="https://github.com/ixartz/SaaS-Boilerplate"
            >
              {t('primary_button')}
            </a>

            <a
              className={buttonVariants({ variant: 'outline', size: 'lg' })}
              href="https://github.com/ixartz/SaaS-Boilerplate"
            >
              <GitHubLogoIcon className="mr-2 size-5" />
              {t('secondary_button')}
            </a>
          </>
        )}
      />
    </Section>
  );
};
