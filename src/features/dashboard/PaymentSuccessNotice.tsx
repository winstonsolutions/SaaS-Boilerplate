import { CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
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

  const handleClose = () => {
    // 清除URL参数并刷新页面
    router.replace('/dashboard');
  };

  return (
    <Card className="border-green-100 shadow-md">
      <CardHeader className="flex flex-row items-center gap-3 border-b border-green-100 bg-green-50">
        <CheckCircle className="size-6 text-green-600" />
        <CardTitle className="text-green-800">支付成功！</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <p className="text-gray-700">
            感谢您订阅 PDF Pro！您的支付已成功处理。
          </p>

          <div className="rounded-md border border-blue-100 bg-blue-50 p-4">
            <p className="mb-2 font-medium text-blue-800">下一步操作</p>
            <ul className="list-inside list-disc space-y-1 text-gray-700">
              <li>您的许可证密钥已发送到您的邮箱</li>
              <li>请检查您的邮箱，包括垃圾邮件文件夹</li>
              <li>收到许可证密钥后，请在下方的激活框中输入激活</li>
            </ul>
          </div>

          <p className="text-sm text-gray-600">
            如果您在10分钟内没有收到邮件，或遇到任何问题，请联系我们的支持团队。
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end border-t bg-gray-50">
        <Button
          variant="outline"
          onClick={handleClose}
        >
          关闭通知
        </Button>
      </CardFooter>
    </Card>
  );
}
