'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUserData } from '@/hooks/useUserData';
import { logger } from '@/libs/Logger';

type LicenseActivationProps = {
  onActivated?: () => void;
};

export function LicenseActivation({ onActivated }: LicenseActivationProps) {
  const [licenseKey, setLicenseKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState('');
  const [purchaseError, setPurchaseError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const { isSignedIn } = useUser();
  const { refetch } = useUserData(''); // Get the refetch function from useUserData hook

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

      // Call API to activate license
      const response = await fetch('/api/license/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ licenseKey: licenseKey.trim() }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Activation failed');
      }

      // Activation successful
      setSuccess('License activated successfully!');
      setLicenseKey('');

      // Force refresh user data immediately to update UI
      refetch();

      // Call the callback if provided
      if (onActivated) {
        onActivated();
      }

      // Refresh page after a short delay to ensure all components update
      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (error) {
      logger.error({ error }, 'Failed to activate license');
      setError(error instanceof Error ? error.message : 'Failed to activate license, please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 直接处理支付流程
  const handleDirectPurchase = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isSignedIn) {
      router.push('/sign-in?redirect_url=/dashboard');
      return;
    }

    try {
      setIsPurchasing(true);
      setPurchaseError('');

      // 创建Stripe结账会话
      const response = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          successUrl: `${window.location.origin}/dashboard?payment=success`,
          cancelUrl: `${window.location.origin}/dashboard?payment=cancelled`,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '创建支付会话失败');
      }

      // 重定向到Stripe结账页面
      if (result.data.checkoutUrl) {
        window.location.href = result.data.checkoutUrl;
      }
    } catch (err) {
      console.error('支付过程出错:', err);
      setPurchaseError(err instanceof Error ? err.message : '支付过程出现错误');
    } finally {
      setIsPurchasing(false);
    }
  };

  // Format license key, add hyphens
  const formatLicenseKey = (key: string) => {
    // Remove all non-alphanumeric characters
    const cleaned = key.replace(/[^A-Z0-9]/gi, '').toUpperCase();

    // Remove the character limit to support longer license keys
    // If starts with PDFPRO, maintain format
    if (cleaned.startsWith('PDFPRO') && cleaned.length > 6) {
      let formatted = 'PDFPRO';

      // Group remaining characters in sets of 4, separated by hyphens
      const remaining = cleaned.substring(6);
      for (let i = 0; i < remaining.length; i += 4) {
        formatted += `-${remaining.substring(i, Math.min(i + 4, remaining.length))}`;
      }

      return formatted;
    } else { // Otherwise group every 4 characters, separated by hyphens
      let formatted = '';
      for (let i = 0; i < cleaned.length; i += 4) {
        if (i > 0) {
          formatted += '-';
        }
        formatted += cleaned.substring(i, Math.min(i + 4, cleaned.length));
      }
      return formatted;
    }
  };

  // Handle license key input
  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatLicenseKey(e.target.value);
    setLicenseKey(formatted);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>License Activation</CardTitle>
        <CardDescription>Enter your license key to activate PDF Pro</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleActivate}>
          <div className="mb-4 space-y-2">
            <Input
              type="text"
              value={licenseKey}
              onChange={handleKeyChange}
              placeholder="PDFPRO-XXXX-XXXX-XXXX-XXXX"
              className="font-mono"
            />
            <p className="text-xs text-gray-500">
              License key format: PDFPRO-XXXX-XXXX-XXXX-XXXX
            </p>

            {/* 移除始终显示的错误信息 */}
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

          <Button
            type="submit"
            disabled={isSubmitting || !licenseKey.trim()}
            className="w-full bg-gray-900 hover:bg-gray-800"
          >
            {isSubmitting ? 'Activating...' : 'Activate'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="border-t pt-6">
        <div className="w-full text-center text-sm text-gray-500">
          <p>
            Don't have a license?
            {' '}
            <Button
              onClick={handleDirectPurchase}
              variant="link"
              className="h-auto p-0 font-normal text-blue-600 hover:underline"
              disabled={isPurchasing}
            >
              {isPurchasing ? 'Processing...' : 'Purchase Now'}
            </Button>
            {purchaseError && (
              <span className="mt-1 block text-sm text-red-500">{purchaseError}</span>
            )}
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
