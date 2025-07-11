'use client';

import { useTranslations } from 'next-intl';
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

type LicenseActivationProps = {
  onActivated?: () => void;
};

export function LicenseActivation({ onActivated }: LicenseActivationProps) {
  const [licenseKey, setLicenseKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const t = useTranslations('LicenseActivation');

  // 处理许可证密钥输入变化
  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 清除任何错误和成功消息
    setError(null);
    setSuccess(null);

    // 大写并自动格式化输入 (可选)
    let key = e.target.value.toUpperCase();

    // 简化的自动格式化：仅移除所有非字母数字字符，不尝试自动添加破折号
    key = key.replace(/[^A-Z0-9-]/g, '');

    // 防止多个连续的破折号
    key = key.replace(/-{2,}/g, '-');

    // 更新状态 (移除长度限制以允许输入完整的许可证密钥)
    setLicenseKey(key);
  };

  // 激活许可证
  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();

    // 重置状态
    setError(null);
    setSuccess(null);

    // 验证输入
    if (!licenseKey || licenseKey.trim() === '') {
      setError('Please enter a license key');
      return;
    }

    // 验证许可证格式
    // if (!LICENSE_KEY_PATTERN.test(licenseKey)) {
    //   setError('Invalid license key format. Please use the format: PDFPRO-XXXX-XXXX-XXXX-XXXX');
    //   return;
    // }

    try {
      setIsSubmitting(true);

      // 调用API激活许可证
      const response = await fetch('/api/license/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          licenseKey,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        if (result.success) {
          setSuccess('License activated successfully! Your account has been upgraded to Pro.');

          // 刷新用户状态数据
          if (onActivated) {
            onActivated();
          }
        } else {
          setError(result.message || 'Failed to activate license');
        }
      } else {
        setError(result.message || 'Failed to activate license. Please try again later.');
      }
    } catch (err) {
      console.error('License activation error:', err);
      setError('An error occurred while activating your license. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理直接购买流程
  const handleDirectPurchase = async () => {
    try {
      setPurchaseError(null);
      setIsPurchasing(true);

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
        throw new Error(result.error || 'Failed to create checkout session');
      }

      // 重定向到Stripe结账页面
      if (result.data.checkoutUrl) {
        window.location.href = result.data.checkoutUrl;
      }
    } catch (err) {
      console.error('Purchase flow error:', err);
      setPurchaseError(err instanceof Error ? err.message : 'An error occurred during the purchase process');
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleActivate}>
          <div className="mb-4 space-y-2">
            <Input
              type="text"
              value={licenseKey}
              onChange={handleKeyChange}
              placeholder={t('placeholder')}
              className="w-full font-mono"
              style={{ width: '100%', minWidth: '300px' }}
            />
            <p className="text-xs text-gray-500">
              {t('key_format')}
            </p>
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
            {isSubmitting ? t('activating') : t('activate_button')}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="border-t pt-6">
        <div className="w-full text-center text-sm text-gray-500">
          <p>
            {t('no_license')}
            {' '}
            <Button
              onClick={handleDirectPurchase}
              variant="link"
              className="h-auto p-0 font-normal text-blue-600 hover:underline"
              disabled={isPurchasing}
            >
              {isPurchasing ? t('processing') : t('purchase_now')}
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
