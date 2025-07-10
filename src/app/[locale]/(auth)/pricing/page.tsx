'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * 重定向页面 - 将/pricing请求重定向到首页的#pricing锚点
 */
export default function PricingRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // 重定向到首页的#pricing锚点
    router.push('/#pricing');

    // 也可以使用window.location以确保锚点正常工作
    // window.location.href = '/#pricing';
  }, [router]);

  // 返回一个空的加载状态，重定向发生前短暂显示
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-r-2 border-t-2 border-blue-500"></div>
        <p className="text-gray-500">重定向中...</p>
      </div>
    </div>
  );
}
