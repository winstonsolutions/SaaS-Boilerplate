import React, { useState } from 'react';

export default function LicenseForm() {
  const [licenseKey, setLicenseKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

      // Here you would implement the license activation logic
      // Example: const response = await fetch('/api/activate-license', { method: 'POST', body: JSON.stringify({ licenseKey }) });

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
