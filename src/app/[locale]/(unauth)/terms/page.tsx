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
              By accessing or using Pixel Capture's services, website, or browser extension (collectively, the "Service"),
              you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms,
              you may not access or use the Service.
            </p>
            <p>
              We reserve the right to modify these Terms at any time. Your continued use of the Service
              after any such changes constitutes your acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">2. Description of Service</h2>
            <p className="mb-4">
              Pixel Capture provides a browser extension and web application that allows users to capture screenshots with custom
              dimensions and pixel-perfect accuracy. The Service includes both free and paid subscription options with
              different features and limitations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">3. User Accounts</h2>
            <p className="mb-4">
              Some features of the Service require you to create an account. You are responsible for maintaining
              the confidentiality of your account information and password. You agree to notify us immediately of any
              unauthorized use of your account.
            </p>
            <p>
              You are responsible for all activities that occur under your account. We reserve the right to terminate
              accounts, in our sole discretion, for any or no reason.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">4. Subscription and Payments</h2>
            <p className="mb-4">
              Certain features of the Service are offered on a subscription basis. You agree to pay the subscription
              fees applicable to the plan you choose. We may change subscription fees by giving you advance notice.
              Your subscription will automatically renew unless canceled at least 24 hours before the end of the
              current billing period.
            </p>
            <p>
              All payments are non-refundable unless otherwise specified or required by applicable law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">5. User Content</h2>
            <p className="mb-4">
              Our Service allows you to capture, store, and share screenshots ("User Content"). You retain all
              rights to your User Content, but you grant us a worldwide, non-exclusive, royalty-free license to
              use, store, and display your User Content for the purpose of providing and improving the Service.
            </p>
            <p className="mb-4">
              You are solely responsible for your User Content and the consequences of sharing it. You represent
              and warrant that you have all necessary rights to your User Content and that it does not violate
              any third-party rights or applicable laws.
            </p>
            <p>
              We reserve the right, but are not obligated, to monitor and remove User Content that violates these Terms
              or that we find objectionable for any reason.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">6. Prohibited Uses</h2>
            <p className="mb-4">You agree not to use the Service to:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Violate any laws or regulations</li>
              <li>Infringe on the rights of others</li>
              <li>Capture or distribute copyrighted or confidential information without authorization</li>
              <li>Distribute malware or other harmful content</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Use automated means to access or collect data from the Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">7. Intellectual Property</h2>
            <p className="mb-4">
              The Service and its original content, features, and functionality are owned by Pixel Capture and are protected by
              international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p>
              You may not copy, modify, distribute, sell, or lease any part of our Service or included software, nor may
              you reverse engineer or attempt to extract the source code of that software, unless you have our written permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">8. Limitation of Liability</h2>
            <p className="mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL PIXEL CAPTURE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
              CONSEQUENTIAL OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR
              OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">9. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of California,
              without regard to its conflict of law provisions. Any dispute arising from or relating to these Terms or
              the Service shall be subject to the exclusive jurisdiction of the courts located in San Francisco County, California.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">10. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at
              {' '}
              <a href="mailto:legal@pixelcapture.app" className="text-primary hover:underline">
                legal@pixelcapture.app
              </a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
