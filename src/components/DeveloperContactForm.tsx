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
    <div className="grid gap-8 md:grid-cols-2">
      <Card className="p-8">
        <h3 className="mb-6 text-xl font-semibold">{t('contact_form_title')}</h3>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="name">{t('form_name_label')}</Label>
            <Input
              id="name"
              placeholder={t('form_name_placeholder')}
              value={formState.name}
              onChange={handleChange}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="email">{t('form_email_label')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('form_email_placeholder')}
              value={formState.email}
              onChange={handleChange}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>
          <div>
            <Label htmlFor="subject">{t('form_subject_label')}</Label>
            <Input
              id="subject"
              placeholder={t('form_subject_placeholder')}
              value={formState.subject}
              onChange={handleChange}
              className={errors.subject ? 'border-red-500' : ''}
            />
            {errors.subject && <p className="mt-1 text-sm text-red-500">{errors.subject}</p>}
          </div>
          <div>
            <Label htmlFor="message">{t('form_message_label')}</Label>
            <Textarea
              id="message"
              placeholder={t('form_message_placeholder')}
              className={`h-32 ${errors.message ? 'border-red-500' : ''}`}
              value={formState.message}
              onChange={handleChange}
            />
            {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message}</p>}
          </div>

          {/* 表单提交状态反馈 */}
          {submitStatus === 'success' && (
            <div className="rounded border border-green-200 bg-green-50 px-4 py-3 text-green-700">
              {t('form_submit_success')}
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {t('form_submit_error')}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('form_submitting') : t('form_submit_button')}
          </Button>
        </form>
      </Card>

      <div className="space-y-6">
        <Card className="p-8">
          <h3 className="mb-4 text-xl font-semibold">{t('contact_info_title')}</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-medium">{t('contact_email_label')}</h4>
              <p className="text-muted-foreground">winstonzhaotech@gmail.com</p>
            </div>
            <div>
              <h4 className="text-lg font-medium">{t('contact_response_label')}</h4>
              <p className="text-muted-foreground">{t('contact_response_time')}</p>
            </div>
            <div>
              <h4 className="text-lg font-medium">{t('contact_location_label')}</h4>
              <p className="text-muted-foreground">{t('contact_location')}</p>
            </div>
          </div>
        </Card>

        <Card className="p-8">
          <h3 className="mb-4 text-xl font-semibold">{t('social_title')}</h3>
          <p className="mb-4 text-muted-foreground">
            {t('social_description')}
          </p>
          <div className="flex space-x-4">
            <a
              href="https://www.linkedin.com/in/winstontech"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-[#0A66C2] px-4 py-2 text-white transition-colors hover:bg-[#0A66C2]/90"
            >
              <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
              </svg>
              LinkedIn
            </a>
            <a
              href="https://github.com/winstonzhaotech"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-white transition-colors hover:bg-gray-700"
            >
              <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              GitHub
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
