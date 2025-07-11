import { CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function PaymentSuccessNotice() {
  const router = useRouter();
  const t = useTranslations('CheckoutConfirmation');

  const handleClose = () => {
    // 清除URL参数并刷新页面
    router.replace('/dashboard');
  };

  return (
    <Card className="border-green-100 shadow-md">
      <CardHeader className="flex flex-row items-center gap-3 border-b border-green-100 bg-green-50">
        <CheckCircle className="size-6 text-green-600" />
        <CardTitle className="text-green-800">{t('message_state_title')}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <p className="text-gray-700">
            {t('message_state_description')}
          </p>

          <div className="rounded-md border border-blue-100 bg-blue-50 p-4">
            <p className="mb-2 font-medium text-blue-800">{t('next_steps')}</p>
            <ul className="list-inside list-disc space-y-1 text-gray-700">
              <li>{t('license_key_sent')}</li>
              <li>{t('check_inbox')}</li>
              <li>{t('activate_license')}</li>
            </ul>
          </div>

          <p className="text-sm text-gray-600">
            {t('support_message')}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end border-t bg-gray-50">
        <Button
          variant="outline"
          onClick={handleClose}
        >
          {t('message_state_button')}
        </Button>
      </CardFooter>
    </Card>
  );
}
