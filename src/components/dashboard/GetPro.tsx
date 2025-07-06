import { Check } from 'lucide-react';
import React from 'react';

export default function GetPro() {
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
