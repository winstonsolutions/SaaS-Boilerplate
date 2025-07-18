'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function DeveloperContactForm() {
  const t = useTranslations('Developer');

  // 表单状态
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  // 表单提交状态
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // 表单验证错误
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  }>({});

  // 处理表单输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormState(prev => ({ ...prev, [id]: value }));

    // 清除该字段的错误（如果有）
    if (errors[id as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [id]: undefined }));
    }
  };

  // 验证表单
  const validateForm = () => {
    const newErrors: typeof errors = {};
    let isValid = true;

    // 验证必填字段
    if (!formState.name.trim()) {
      newErrors.name = t('form_validation_required');
      isValid = false;
    }

    if (!formState.email.trim()) {
      newErrors.email = t('form_validation_required');
      isValid = false;
    } else {
      // 简单的邮箱格式验证
      const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/;
      if (!emailRegex.test(formState.email)) {
        newErrors.email = t('form_validation_email');
        isValid = false;
      }
    }

    if (!formState.subject.trim()) {
      newErrors.subject = t('form_validation_required');
      isValid = false;
    }

    if (!formState.message.trim()) {
      newErrors.message = t('form_validation_required');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 重置状态
    setSubmitStatus('idle');

    // 验证表单
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // 成功提交
      setSubmitStatus('success');

      // 重置表单
      setFormState({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      console.error('Error sending contact form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <Card className="overflow-hidden border-0 shadow-lg transition-all hover:shadow-xl">
        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-4">
          <h3 className="mb-2 text-center text-2xl font-bold">{t('contact_form_title')}</h3>
          <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-indigo-500"></div>
        </div>
        <div className="p-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="transition-all duration-300 hover:translate-y-[-2px]">
              <Label htmlFor="name" className="mb-1.5 block text-sm font-medium">{t('form_name_label')}</Label>
              <Input
                id="name"
                placeholder={t('form_name_placeholder')}
                value={formState.name}
                onChange={handleChange}
                className={`rounded-md border-gray-300 transition-all duration-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && <p className="mt-1.5 text-sm font-medium text-red-500">{errors.name}</p>}
            </div>
            <div className="transition-all duration-300 hover:translate-y-[-2px]">
              <Label htmlFor="email" className="mb-1.5 block text-sm font-medium">{t('form_email_label')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('form_email_placeholder')}
                value={formState.email}
                onChange={handleChange}
                className={`rounded-md border-gray-300 transition-all duration-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && <p className="mt-1.5 text-sm font-medium text-red-500">{errors.email}</p>}
            </div>
            <div className="transition-all duration-300 hover:translate-y-[-2px]">
              <Label htmlFor="subject" className="mb-1.5 block text-sm font-medium">{t('form_subject_label')}</Label>
              <Input
                id="subject"
                placeholder={t('form_subject_placeholder')}
                value={formState.subject}
                onChange={handleChange}
                className={`rounded-md border-gray-300 transition-all duration-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${errors.subject ? 'border-red-500' : ''}`}
              />
              {errors.subject && <p className="mt-1.5 text-sm font-medium text-red-500">{errors.subject}</p>}
            </div>
            <div className="transition-all duration-300 hover:translate-y-[-2px]">
              <Label htmlFor="message" className="mb-1.5 block text-sm font-medium">{t('form_message_label')}</Label>
              <Textarea
                id="message"
                placeholder={t('form_message_placeholder')}
                className={`h-28 rounded-md border-gray-300 transition-all duration-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${errors.message ? 'border-red-500' : ''}`}
                value={formState.message}
                onChange={handleChange}
              />
              {errors.message && <p className="mt-1.5 text-sm font-medium text-red-500">{errors.message}</p>}
            </div>

            {/* 表单提交状态反馈 */}
            {submitStatus === 'success' && (
              <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-green-700 shadow-sm">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 size-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {t('form_submit_success')}
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700 shadow-sm">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 size-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {t('form_submit_error')}
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 py-2.5 font-medium text-white transition-all duration-300 hover:scale-[1.02] hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? (
                    <span className="flex items-center justify-center">
                      <svg className="-ml-1 mr-2 size-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('form_submitting')}
                    </span>
                  )
                : t('form_submit_button')}
            </Button>
          </form>
        </div>
      </Card>

      <div className="space-y-8">
        <Card className="h-full overflow-hidden border-0 shadow-lg transition-all hover:shadow-xl">
          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-4">
            <h3 className="mb-2 text-center text-2xl font-bold">{t('contact_info_title')}</h3>
            <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-indigo-500"></div>
          </div>
          <div className="space-y-8 p-8">
            <div className="flex items-start">
              <div className="shrink-0 rounded-full bg-indigo-100 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="size-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-5">
                <h4 className="text-lg font-semibold text-gray-900">{t('contact_email_label')}</h4>
                <p className="text-md mt-2 text-gray-600">winstonzhaotech@gmail.com</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="shrink-0 rounded-full bg-indigo-100 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="size-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5">
                <h4 className="text-lg font-semibold text-gray-900">{t('contact_response_label')}</h4>
                <p className="text-md mt-2 text-gray-600">{t('contact_response_time')}</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="shrink-0 rounded-full bg-indigo-100 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="size-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-5">
                <h4 className="text-lg font-semibold text-gray-900">{t('contact_location_label')}</h4>
                <p className="text-md mt-2 text-gray-600">{t('contact_location')}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
