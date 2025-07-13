import { unstable_setRequestLocale } from 'next-intl/server';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Footer } from '@/templates/Footer';
import { Navbar } from '@/templates/Navbar';

export default function PrivacyPolicyPage(props: { params: { locale: string } }) {
  unstable_setRequestLocale(props.params.locale);

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold">Privacy Policy</h1>
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
            Last updated: July 13, 2025
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Introduction</h2>
            <p className="mb-4">
              As an independent developer of Pixel Capture, I respect your privacy and am committed to protecting your personal data.
              This simple privacy policy will inform you about how I look after your personal data when you use my browser extension.
            </p>
            <p>
              Please read this privacy policy carefully before using Pixel Capture.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Information I Collect</h2>
            <p className="mb-4">I collect only the necessary information to provide you with the Pixel Capture service:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Personal Data:</strong>
                {' '}
                Email address (when you create an account).
              </li>
              <li>
                <strong>Usage Data:</strong>
                {' '}
                Basic information about how you use the extension.
              </li>
              <li>
                <strong>Screenshot Data:</strong>
                {' '}
                The screenshots you capture using the extension, which are stored on your account if you choose to save them.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">How I Use Your Information</h2>
            <p className="mb-4">I use your information only for the following essential purposes:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>To provide and maintain Pixel Capture</li>
              <li>To notify you about important changes or updates</li>
              <li>To provide user support</li>
              <li>To improve the extension based on usage patterns</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Data Storage and Security</h2>
            <p className="mb-4">
              As a solo developer, I use reliable third-party services to store your data. Your screenshots and account
              information are stored securely, with industry-standard encryption. I do not share your data with
              any third parties for marketing purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How secure are my screenshots?</AccordionTrigger>
                <AccordionContent>
                  Your screenshots are stored securely with encryption both in transit and at rest. I use reliable
                  cloud hosting providers with industry-standard security measures.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Do you share my data with third parties?</AccordionTrigger>
                <AccordionContent>
                  I do not sell or share your personal data for marketing purposes. I only use third-party services
                  necessary to provide the Pixel Capture functionality (like cloud storage and authentication).
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>How long do you retain my data?</AccordionTrigger>
                <AccordionContent>
                  I retain your account information for as long as you maintain an active account.
                  Screenshots are stored until you delete them or close your account.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Changes to This Privacy Policy</h2>
            <p className="mb-4">
              I may update this Privacy Policy from time to time. I will notify you of any changes by
              posting the new Privacy Policy on the website and updating the "Last updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Contact Me</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact me at
              {' '}
              <a href="mailto:winstonzhaotech@gmail.com" className="text-primary hover:underline">
                winstonzhaotech@gmail.com
              </a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
