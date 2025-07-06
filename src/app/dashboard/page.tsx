import type { Metadata } from 'next';
import React from 'react';

import AccountStatus from './AccountStatus';
import GetPro from './GetPro';
import LicenseForm from './LicenseForm';

export const metadata: Metadata = {
  title: 'Dashboard | Pixel Capture',
  description: 'Manage your Pixel Capture subscription and account settings',
};

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="mb-8 text-2xl font-bold">Dashboard</h1>

        <div className="space-y-8">
          <AccountStatus />
          <GetPro />
          <LicenseForm />
        </div>
      </div>
    </div>
  );
}
