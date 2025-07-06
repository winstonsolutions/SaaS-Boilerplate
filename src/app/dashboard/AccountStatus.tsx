import { useUser } from '@clerk/nextjs';
import { addDays, differenceInDays } from 'date-fns';
import { FileDown, MessageCircle, Settings } from 'lucide-react';
import React from 'react';

export default function AccountStatus() {
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
