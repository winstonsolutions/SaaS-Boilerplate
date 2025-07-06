import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import { Footer } from '@/templates/Footer';
import { Navbar } from '@/templates/Navbar';

export default async function CenteredLayout(props: { children: React.ReactNode }) {
  const { userId } = await auth();

  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-purple-50 to-purple-100 py-16">
        <div className="w-full max-w-md px-4">
          {props.children}
        </div>
      </div>
      <Footer />
    </div>
  );
}
