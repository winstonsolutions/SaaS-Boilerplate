import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { CenteredHero } from '@/features/landing/CenteredHero';
import { Section } from '@/features/landing/Section';

export const Hero = () => {
  const t = useTranslations('Hero');
  const navbarT = useTranslations('Navbar');

  return (
    <Section className="py-36">
      <CenteredHero
        banner={null}
        title={(
          <>
            <div className="mb-4">
              {t.rich('title_first_line', {
                important: chunks => (
                  <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text font-extrabold text-transparent">
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
          <div className="mt-8 flex justify-center">
            <div className="rounded-full bg-green-200/50 p-1.5 shadow-lg">
              <a
                href="https://chrome.google.com/webstore"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-green-400 px-6 py-4 text-2xl font-medium text-black shadow-lg transition-all hover:bg-green-500"
              >
                <Image
                  src="/assets/images/chrome-store-logo.svg"
                  alt="Chrome Web Store logo"
                  width={32}
                  height={32}
                />
                {navbarT('chrome')}
              </a>
            </div>
          </div>
        )}
        buttons={null}
      />
    </Section>
  );
};
