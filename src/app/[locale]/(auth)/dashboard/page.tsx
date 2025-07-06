'use client';

import { useUser } from '@clerk/nextjs';
import { addDays } from 'date-fns';
import { Check, FileDown, MessageCircle, Settings } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';

import { DevUserInfo } from '@/features/dashboard/DevUserInfo';
import { TitleBar } from '@/features/dashboard/TitleBar';

// 内联AccountStatus组件
function AccountStatus() {
  const { user, isLoaded } = useUser();
  const params = useParams();
  const locale = params.locale as string;
  const [trialStartDate, setTrialStartDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 从API获取用户试用信息
  useEffect(() => {
    async function fetchUserTrialInfo() {
      if (!user || !isLoaded) {
        return;
      }

      try {
        // 使用API端点获取用户试用信息
        const response = await fetch(`/${locale}/api/user/trial`);

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        // // 开发环境下记录API响应数据
        // if (process.env.NODE_ENV === 'development') {
        //   console.log('===== Trial API Response =====');
        //   console.log('User:', user.id);
        //   console.log('Response data:', data);
        //   console.log('trialStartedAt:', data.trialStartedAt);
        //   console.log('user data:', data.user);
        //   console.log('user.publicMetadata:', user.publicMetadata);
        //   console.log('user email', user.primaryEmailAddress?.emailAddress);
        //   console.log('user email', data.user.email);
        //   console.log('===========================');
        // }

        // 开发环境中的测试参数: 添加 ?expired=true 到URL可以模拟试用过期
        const urlParams = new URLSearchParams(window.location.search);
        const simulateExpired = urlParams.get('expired') === 'true';

        if (simulateExpired && process.env.NODE_ENV === 'development') {
          // 模拟过期的试用 - 设置为7天前
          const expiredDate = new Date();
          expiredDate.setDate(expiredDate.getDate() - 7);
          setTrialStartDate(expiredDate);
        } else if (data.trialStartedAt) {
          setTrialStartDate(new Date(data.trialStartedAt));
        } else {
          // 如果没有找到用户或试用日期，返回null
          setTrialStartDate(null);
        }
      } catch (error) {
        // 错误处理
        console.error('Error fetching trial info:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (isLoaded && user) {
      fetchUserTrialInfo();
    }
  }, [user, isLoaded, locale]);

  // 计算试用期结束日期和剩余时间
  const trialEndDate = trialStartDate ? addDays(trialStartDate, 7) : null;
  const today = new Date();

  // 确保日期计算正确
  const calculateTimeRemaining = (endDate: Date | null, currentDate: Date) => {
    if (!endDate) {
      return { days: 0, hours: 0, minutes: 0 };
    }

    const diffMs = Math.max(0, endDate.getTime() - currentDate.getTime());
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes };
  };

  const timeRemaining = calculateTimeRemaining(trialEndDate, today);
  const daysRemaining = timeRemaining.days;
  const hoursRemaining = timeRemaining.hours;
  const minutesRemaining = timeRemaining.minutes;

  // 确定用户状态
  let status = 'FREE';
  let isTrialExpired = false;

  if (trialStartDate) {
    if (daysRemaining > 0 || (daysRemaining === 0 && (hoursRemaining > 0 || minutesRemaining > 0))) {
      status = 'Pro Trial Active';
    } else {
      isTrialExpired = true;
      status = 'FREE';
    }
  } else if (user?.publicMetadata?.subscriptionStatus === 'active') {
    status = 'PRO';
  }

  // 计算进度条 - 全新逻辑
  // 总试用时间为7天（以毫秒为单位）
  const TRIAL_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

  // 如果有试用开始日期，计算已经过去的时间
  let elapsedMs = 0;
  let remainingMs = 0;

  if (trialStartDate) {
    // 已经过去的时间 = 当前时间 - 试用开始时间
    elapsedMs = Math.min(TRIAL_DURATION_MS, today.getTime() - trialStartDate.getTime());
    // 剩余时间 = 总时间 - 已过去时间
    remainingMs = Math.max(0, TRIAL_DURATION_MS - elapsedMs);
  }

  // 进度百分比 = 剩余时间 / 总时间 * 100
  const progressPercentage = trialStartDate ? Math.min(100, (remainingMs / TRIAL_DURATION_MS) * 100) : 0;

  if (!isLoaded || isLoading) {
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

      {/* 试用过期消息 */}
      {isTrialExpired && (
        <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <p className="text-blue-800">Your trial has expired. Purchase a license to continue using Pro features.</p>
        </div>
      )}

      {/* 试用进行中显示进度条 */}
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

          {/* 全新进度条设计 */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            {/* 剩余时间 */}
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500 ease-in-out"
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

export default function DashboardPage() {
  const t = useTranslations('DashboardIndex');

  return (
    <>
      <TitleBar
        title={t('title_bar')}
        description={t('title_bar_description')}
      />

      <DevUserInfo />

      <div className="space-y-8">
        <AccountStatus />
        <GetPro />
        <LicenseForm />
      </div>
    </>
  );
}
