import Image from 'next/image';
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
            My mission is to create powerful tools that make designers' and developers' lives easier
          </p>
        </div>

        <section className="mb-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-2xl font-semibold">My Story</h2>
            <p className="mb-4">
              Hi there! I'm Winston Zhao, an independent developer with a passion for creating useful tools
              for the web community. Pixel Capture was born in 2025 out of my own frustration with
              existing screenshot tools. I wanted a solution that offered pixel-perfect precision,
              custom dimensions, and seamless workflow integration.
            </p>
            <p className="mb-4">
              What started as a simple tool for my own use quickly evolved into a comprehensive
              browser extension that now serves thousands of designers, developers, and content creators
              worldwide. My commitment to quality and user experience drives the continuous improvement
              of Pixel Capture.
            </p>
          </div>
        </section>

        <section className="mb-16 bg-card/50 py-12">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-center text-2xl font-semibold">My Mission</h2>
            <p className="mb-8 text-center text-lg">
              To provide the most precise, intuitive, and efficient screenshot tools that enhance
              creative workflows and save time for professionals around the world.
            </p>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="rounded-lg bg-background p-6 shadow-sm">
                <h3 className="mb-3 text-lg font-medium">Precision</h3>
                <p className="text-muted-foreground">
                  I believe that pixel-perfect accuracy matters, especially for designers and
                  developers who need to capture exact UI elements.
                </p>
              </div>
              <div className="rounded-lg bg-background p-6 shadow-sm">
                <h3 className="mb-3 text-lg font-medium">Simplicity</h3>
                <p className="text-muted-foreground">
                  Power doesn't have to be complex. I focus on intuitive design that makes
                  advanced features accessible to everyone.
                </p>
              </div>
              <div className="rounded-lg bg-background p-6 shadow-sm">
                <h3 className="mb-3 text-lg font-medium">Innovation</h3>
                <p className="text-muted-foreground">
                  I continuously push the boundaries of what's possible with screenshot tools,
                  integrating the latest technologies and user feedback.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-center text-2xl font-semibold">About Me</h2>
            <div className="flex flex-col items-center">
              <div className="relative mb-6 size-40 overflow-hidden rounded-full">
                <Image
                  src="/developer-avatar.jpg"
                  alt="Winston Zhao"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <h3 className="text-xl font-medium">Winston Zhao</h3>
              <p className="mb-6 text-muted-foreground">Full-Stack Developer & Creator of Pixel Capture</p>
              <p className="mb-4 text-center">
                I'm a passionate developer with over 5 years of experience in web and browser extension
                development. When I'm not coding, you can find me fishing, hiking, reading about new technologies,
                or experimenting with photography.
              </p>
              <p className="text-center">
                Pixel Capture represents my commitment to creating tools that solve real problems for
                creative professionals. I'm constantly working on improvements and new features based on
                user feedback.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
