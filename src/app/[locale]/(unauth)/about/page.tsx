import { unstable_setRequestLocale } from 'next-intl/server';

import { Footer } from '@/templates/Footer';
import { Navbar } from '@/templates/Navbar';

export default function AboutPage(props: { params: { locale: string } }) {
  unstable_setRequestLocale(props.params.locale);

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold">About Pixel Capture</h1>
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
            Our mission is to empower creators with pixel-perfect screenshot tools
          </p>
        </div>

        <section className="mb-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-2xl font-semibold">Our Story</h2>
            <p className="mb-4">
              Pixel Capture was founded in 2023 by a team of designers and developers who were
              frustrated with the limitations of existing screenshot tools. We wanted to create a
              solution that offered pixel-perfect precision, custom dimensions, and seamless
              workflow integration.
            </p>
            <p className="mb-4">
              What started as a simple tool for our own use quickly evolved into a comprehensive
              browser extension that serves thousands of designers, developers, and content creators
              worldwide. Our commitment to quality and user experience has made Pixel Capture the
              go-to screenshot tool for professionals.
            </p>
          </div>
        </section>

        <section className="mb-16 bg-card/50 py-12">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-center text-2xl font-semibold">Our Mission</h2>
            <p className="mb-8 text-center text-lg">
              To provide the most precise, intuitive, and efficient screenshot tools that enhance
              creative workflows and save time for professionals around the world.
            </p>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="rounded-lg bg-background p-6 shadow-sm">
                <h3 className="mb-3 text-lg font-medium">Precision</h3>
                <p className="text-muted-foreground">
                  We believe that pixel-perfect accuracy matters, especially for designers and
                  developers who need to capture exact UI elements.
                </p>
              </div>
              <div className="rounded-lg bg-background p-6 shadow-sm">
                <h3 className="mb-3 text-lg font-medium">Simplicity</h3>
                <p className="text-muted-foreground">
                  Power doesn't have to be complex. We focus on intuitive design that makes
                  advanced features accessible to everyone.
                </p>
              </div>
              <div className="rounded-lg bg-background p-6 shadow-sm">
                <h3 className="mb-3 text-lg font-medium">Innovation</h3>
                <p className="text-muted-foreground">
                  We continuously push the boundaries of what's possible with screenshot tools,
                  integrating the latest technologies and user feedback.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-center text-2xl font-semibold">Meet Our Team</h2>
            <p className="mb-8 text-center">
              Pixel Capture is built by a small but passionate team dedicated to creating the best
              screenshot tool available.
            </p>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 size-32 overflow-hidden rounded-full bg-muted"></div>
                <h3 className="text-lg font-medium">Alex Chen</h3>
                <p className="text-sm text-muted-foreground">Founder & Lead Developer</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 size-32 overflow-hidden rounded-full bg-muted"></div>
                <h3 className="text-lg font-medium">Sarah Johnson</h3>
                <p className="text-sm text-muted-foreground">UX Designer</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 size-32 overflow-hidden rounded-full bg-muted"></div>
                <h3 className="text-lg font-medium">Michael Wong</h3>
                <p className="text-sm text-muted-foreground">Frontend Engineer</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
