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
            Last updated: June 1, 2023
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Introduction</h2>
            <p className="mb-4">
              At Pixel Capture, we respect your privacy and are committed to protecting your personal data.
              This privacy policy will inform you about how we look after your personal data when you visit
              our website or use our browser extension and tell you about your privacy rights and how the law protects you.
            </p>
            <p>
              Please read this privacy policy carefully before using our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Information We Collect</h2>
            <p className="mb-4">We collect several types of information from and about users of our Services, including:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Personal Data:</strong>
                {' '}
                Email address, first name, last name (when you create an account).
              </li>
              <li>
                <strong>Usage Data:</strong>
                {' '}
                Information about how you use our website and extension.
              </li>
              <li>
                <strong>Screenshot Data:</strong>
                {' '}
                The screenshots you capture using our extension, which may include
                personal or sensitive information depending on what you capture.
              </li>
              <li>
                <strong>Technical Data:</strong>
                {' '}
                Internet protocol (IP) address, browser type and version, time zone setting,
                browser plug-in types and versions, operating system and platform.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">How We Use Your Information</h2>
            <p className="mb-4">We use your information for the following purposes:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>To provide and maintain our services</li>
              <li>To notify you about changes to our services</li>
              <li>To allow you to participate in interactive features when you choose to do so</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information to improve our services</li>
              <li>To monitor the usage of our services</li>
              <li>To detect, prevent and address technical issues</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How secure are my screenshots?</AccordionTrigger>
                <AccordionContent>
                  Your screenshots are stored securely in our cloud storage with encryption both in transit
                  and at rest. We employ industry-standard security measures to protect your data.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Do you share my data with third parties?</AccordionTrigger>
                <AccordionContent>
                  We do not sell your personal data. We may share data with service providers who help us deliver
                  our services, but these providers are bound by strict confidentiality agreements.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>How long do you retain my data?</AccordionTrigger>
                <AccordionContent>
                  We retain your account information for as long as you maintain an active account.
                  Screenshots are stored until you delete them or close your account.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>What are my privacy rights?</AccordionTrigger>
                <AccordionContent>
                  You have the right to access, correct, update, or request deletion of your personal information.
                  You can also object to processing of your personal data or request that we restrict processing
                  in certain circumstances.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Changes to This Privacy Policy</h2>
            <p className="mb-4">
              We may update our Privacy Policy from time to time. We will notify you of any changes by
              posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
            <p>
              You are advised to review this Privacy Policy periodically for any changes. Changes to this
              Privacy Policy are effective when they are posted on this page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at
              {' '}
              <a href="mailto:privacy@pixelcapture.app" className="text-primary hover:underline">
                privacy@pixelcapture.app
              </a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
