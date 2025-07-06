import { unstable_setRequestLocale } from 'next-intl/server';

import { Footer } from '@/templates/Footer';
import { Navbar } from '@/templates/Navbar';

export default function TermsOfServicePage(props: { params: { locale: string } }) {
  unstable_setRequestLocale(props.params.locale);

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold">Terms of Service</h1>
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
            Last updated: June 1, 2023
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing or using Pixel Capture's services or browser extension (collectively, the "Service"),
              you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms,
              you may not access or use the Service.
            </p>
            <p>
              I reserve the right to modify these Terms at any time. Your continued use of the Service
              after any such changes constitutes your acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">2. Description of Service</h2>
            <p className="mb-4">
              Pixel Capture is a browser extension that allows you to capture screenshots with custom
              dimensions and pixel-perfect accuracy. The Service includes both free and paid subscription options with
              different features.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">3. User Accounts</h2>
            <p className="mb-4">
              Some features of Pixel Capture require you to create an account. You are responsible for maintaining
              the confidentiality of your account information. Basic features can be used without an account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">4. Subscription and Payments</h2>
            <p className="mb-4">
              Certain features are offered on a subscription basis. You agree to pay the fees applicable to your
              chosen plan. Subscriptions will automatically renew unless canceled at least 24 hours before the end
              of the current billing period.
            </p>
            <p>
              All payments are processed through secure third-party payment processors.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">5. User Content</h2>
            <p className="mb-4">
              You retain all rights to the screenshots you capture. I do not claim ownership over your content.
              You are responsible for ensuring you have the right to capture and store any screenshots you take.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">6. Prohibited Uses</h2>
            <p className="mb-4">Please do not use Pixel Capture to:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Violate any laws or regulations</li>
              <li>Infringe on the rights of others</li>
              <li>Capture or distribute confidential information without authorization</li>
              <li>Attempt to interfere with the Service or servers</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">7. Intellectual Property</h2>
            <p className="mb-4">
              The Pixel Capture extension, brand name, logos, and code are owned by me and protected by
              intellectual property laws. You may not copy, modify, distribute, or reverse engineer
              the extension without permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">8. Limitation of Liability</h2>
            <p className="mb-4">
              Pixel Capture is provided "as is" without any warranties. I am not liable for any damages
              arising from your use of the Service or inability to access the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">9. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact me at
              {' '}
              <a href="mailto:alex@pixelcapture.app" className="text-primary hover:underline">
                alex@pixelcapture.app
              </a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
