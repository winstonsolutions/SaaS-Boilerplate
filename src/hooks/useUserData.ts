import { useCallback, useEffect, useState } from 'react';

import type { UserSubscriptionStatus } from '@/types/Subscription';

type UseUserDataResult = {
  userStatus: UserSubscriptionStatus | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
};

// 简单的内存缓存
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

// 缓存助手函数
function getCachedData(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCachedData(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * 用户数据获取Hook - 支持缓存和初始数据
 */
export function useUserData(
  locale: string,
  initialData?: UserSubscriptionStatus | null,
): UseUserDataResult {
  const [userStatus, setUserStatus] = useState<UserSubscriptionStatus | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useCallback(async (skipCache = false) => {
    const cacheKey = `user-status-${locale}`;

    // 检查缓存
    if (!skipCache) {
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        setUserStatus(cachedData);
        setIsLoading(false);
        return;
      }
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/${locale}/api/user/status`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        setUserStatus(data.data);
        setCachedData(cacheKey, data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch user status');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching user data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [locale]);

  const refetch = useCallback(() => {
    fetchUserData(true);
  }, [fetchUserData]);

  useEffect(() => {
    // 如果有初始数据，则不需要立即获取
    if (initialData) {
      return;
    }

    fetchUserData();
  }, [fetchUserData, initialData]);

  return {
    userStatus,
    isLoading,
    error,
    refetch,
  };
}
