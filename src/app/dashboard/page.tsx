// 直接在页面中实现组件，避免导入问题
import { useUser } from '@clerk/nextjs';
import { addDays, differenceInDays } from 'date-fns';
import { Check, FileDown, MessageCircle, Settings } from 'lucide-react';
import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Dashboard | Pixel Capture',
  description: 'Manage your Pixel Capture subscription and account settings',
};

// 内联AccountStatus组件
function AccountStatus() {
  const { user, isLoaded } = useUser();

  // Calculate trial status
  const trialStarted = user?.publicMetadata?.trial_started_at
    ? new Date(user.publicMetadata.trial_started_at as string)
    : null;

  const trialEndDate = trialStarted ? addDays(trialStarted, 7) : null;
  const today = new Date();
  const daysRemaining = trialEndDate ? differenceInDays(trialEndDate, today) : 0;
  const hoursRemaining = trialEndDate ? Math.floor((trialEndDate.getTime() - today.getTime()) / (1000 * 60 * 60) % 24) : 0;
  const minutesRemaining = trialEndDate ? Math.floor((trialEndDate.getTime() - today.getTime()) / (1000 * 60) % 60) : 0;

  // Determine status
  let status = 'FREE';
  if (trialStarted && daysRemaining >= 0) {
    status = 'Pro Trial Active';
  } else if (user?.publicMetadata?.subscriptionStatus === 'active') {
    status = 'PRO';
  }

  // Calculate progress percentage for the trial
  const progressPercentage = trialStarted
    ? Math.max(0, Math.min(100, 100 - (daysRemaining * 24 * 60 + hoursRemaining * 60 + minutesRemaining) / (7 * 24 * 60) * 100))
    : 100;

  if (!isLoaded) {
    return <div className="h-40 animate-pulse rounded-lg bg-gray-200"></div>;
  }

  return (
    <section className="rounded-lg bg-white p-6 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Account Status</h2>
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${
          status === 'PRO'
            ? 'bg-green-100 text-green-800'
            : status === 'Pro Trial Active'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
        }`}
        >
          {status}
        </span>
      </div>

      {status === 'Pro Trial Active' && (
        <div className="mb-6">
          <div className="mb-1 flex justify-between text-sm">
            <span>Trial time remaining</span>
            <span>
              {daysRemaining}
              d
              {' '}
              {hoursRemaining}
              h
              {' '}
              {minutesRemaining}
              m remaining
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-blue-600"
              style={{ width: `${progressPercentage}%` }}
            >
            </div>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Try all Pro features for 7 days
          </div>
        </div>
      )}

      <h3 className="mb-4 font-medium">Pro Features</h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4 transition-colors hover:bg-gray-50">
          <div className="mb-2 flex items-center">
            <FileDown className="mr-2 size-5 text-blue-600" />
            <h4 className="font-medium">PDF Download</h4>
          </div>
          <p className="text-sm text-gray-600">Export your captures as PDF</p>
        </div>

        <div className="rounded-lg border p-4 transition-colors hover:bg-gray-50">
          <div className="mb-2 flex items-center">
            <Settings className="mr-2 size-5 text-blue-600" />
            <h4 className="font-medium">Advanced Settings</h4>
          </div>
          <p className="text-sm text-gray-600">Countdown Timer Enabled</p>
        </div>

        <div className="rounded-lg border p-4 transition-colors hover:bg-gray-50">
          <div className="mb-2 flex items-center">
            <MessageCircle className="mr-2 size-5 text-blue-600" />
            <h4 className="font-medium">Priority Support</h4>
          </div>
          <p className="text-sm text-gray-600">Get faster responses</p>
        </div>
      </div>
    </section>
  );
}

// 内联GetPro组件
function GetPro() {
  const handleSubscribe = () => {
    // Redirect to Stripe checkout
    window.location.href = 'https://buy.stripe.com/test_9B6bIU2Gy0bRdRJd1Y43S02';
  };

  return (
    <section className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-6 text-xl font-semibold">Get Pro</h2>

      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-3xl font-bold">
            $1.99
            <span className="text-sm font-normal text-gray-500">/month</span>
          </div>
          <div className="mt-1 text-sm text-gray-500">One-time payment</div>
        </div>
        <button
          type="button"
          onClick={handleSubscribe}
          className="mt-4 w-full rounded-md bg-blue-600 px-6 py-2 text-center font-medium text-white transition-colors hover:bg-blue-700 md:mt-0 md:w-auto"
        >
          Buy Now
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center">
          <span className="shrink-0 rounded-full bg-green-100 p-1">
            <Check className="size-4 text-green-600" />
          </span>
          <span className="ml-2 text-gray-700">Lifetime access to all features</span>
        </div>

        <div className="flex items-center">
          <span className="shrink-0 rounded-full bg-green-100 p-1">
            <Check className="size-4 text-green-600" />
          </span>
          <span className="ml-2 text-gray-700">Future updates included</span>
        </div>

        <div className="flex items-center">
          <span className="shrink-0 rounded-full bg-green-100 p-1">
            <Check className="size-4 text-green-600" />
          </span>
          <span className="ml-2 text-gray-700">Priority support</span>
        </div>
      </div>
    </section>
  );
}

// 内联LicenseForm组件
function LicenseForm() {
  const [licenseKey, setLicenseKey] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!licenseKey.trim()) {
      setError('Please enter a license key');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo purposes, we're just showing a success message
      setSuccess('License activated successfully!');
      setLicenseKey('');
    } catch {
      setError('Failed to activate license. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-semibold">Have a License?</h2>

      <form onSubmit={handleActivate}>
        <div className="mb-4">
          <input
            type="text"
            value={licenseKey}
            onChange={e => setLicenseKey(e.target.value)}
            placeholder="Enter license key"
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-500">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 text-sm text-green-500">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full rounded-md bg-gray-900 px-4 py-2 text-white transition-colors hover:bg-gray-800 ${
            isSubmitting ? 'cursor-not-allowed opacity-70' : ''
          }`}
        >
          {isSubmitting ? 'Activating...' : 'Activate'}
        </button>
      </form>
    </section>
  );
}

// 内联Dashboard组件
function Dashboard() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-2xl font-bold">Dashboard</h1>

      <div className="space-y-8">
        <AccountStatus />
        <GetPro />
        <LicenseForm />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <Dashboard />
    </div>
  );
}
