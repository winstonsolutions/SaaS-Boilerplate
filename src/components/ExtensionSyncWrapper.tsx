'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';

import { ExtensionBridge } from '@/utils/ExtensionBridge';

/**
 * 扩展同步包装组件
 * 监听Clerk用户登录/登出状态变化，并同步到扩展
 */
export function ExtensionSyncWrapper({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useUser();
  const prevSignedInRef = useRef<boolean | undefined>(undefined);

  useEffect(() => {
    // 检查登录状态是否发生变化
    if (prevSignedInRef.current !== undefined && prevSignedInRef.current !== isSignedIn) {
      if (!isSignedIn) {
        // 用户登出，通知扩展
        ExtensionBridge.notifyLogout();
      }
    }

    // 更新上次的登录状态
    prevSignedInRef.current = isSignedIn;
  }, [isSignedIn]);

  return <>{children}</>;
}
