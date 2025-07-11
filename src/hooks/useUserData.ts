import { useCallback, useEffect, useState } from 'react';

import type { UserSubscriptionStatus } from '@/types/Subscription';
import { ExtensionBridge } from '@/utils/ExtensionBridge';

// API 基础 URL 配置
const API_BASE_URL = typeof window !== 'undefined' ? window.location.origin : '';

type UseUserDataResult = {
  userStatus: UserSubscriptionStatus | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
};

// 简单的内存缓存
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60 * 1000; // Reduce to 1 minute from 5 minutes to ensure fresher data

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

// Clear specific cache entry
function clearCachedData(key: string) {
  cache.delete(key);
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
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);

  // 添加扩展通信逻辑
  const syncToExtension = useCallback((userStatus: UserSubscriptionStatus) => {
    if (userStatus) {
      // 根据实际的数据结构正确判断
      const isPro = userStatus.accountStatus === 'pro'; // 真正的付费用户
      const isInTrial = userStatus.accountStatus === 'trial'; // 试用用户

      // 同步到扩展
      ExtensionBridge.notifyLogin(isPro, isInTrial);
    }
  }, []);

  const fetchUserData = useCallback(async (skipCache = false) => {
    const cacheKey = `user-status-${locale}`;

    // 防止重复请求
    if (isRequestInProgress) {
      return;
    }

    // 检查缓存
    if (!skipCache) {
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        setUserStatus(cachedData);
        setIsLoading(false);
        return;
      }
    } else {
      // Clear cache when explicitly requesting fresh data
      clearCachedData(cacheKey);
    }

    try {
      setIsRequestInProgress(true);
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/user/status`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        setUserStatus(data.data);
        setCachedData(cacheKey, data.data);

        // 新增：同步到扩展
        syncToExtension(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch user status');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching user data:', err);
    } finally {
      setIsLoading(false);
      setIsRequestInProgress(false);
    }
  }, [locale, syncToExtension, isRequestInProgress]);

  const refetch = useCallback(() => {
    fetchUserData(true); // Always skip cache when manually refetching
  }, [fetchUserData]);

  useEffect(() => {
    // 如果有初始数据，则不需要立即获取
    if (initialData) {
      // 即使有初始数据，也要同步到扩展
      syncToExtension(initialData);
      return;
    }

    fetchUserData();
  }, [fetchUserData, initialData, syncToExtension]);

  return {
    userStatus,
    isLoading,
    error,
    refetch,
  };
}
