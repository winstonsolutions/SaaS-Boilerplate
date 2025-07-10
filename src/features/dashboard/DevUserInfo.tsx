'use client';

import { useUser } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// 简化版本的DevUserInfo组件，只显示基本信息
export const DevUserInfo = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const params = useParams();
  const locale = params.locale as string;
  const [expanded, setExpanded] = useState(false);
  const [dbUserInfo, setDbUserInfo] = useState<{
    trialStartedAt: string | null;
    user: {
      id: string;
      email: string;
      trial_started_at: string | null;
      [key: string]: any;
    } | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 延迟加载用户数据，减少初始渲染时间
  useEffect(() => {
    let isMounted = true;

    // 只有在展开面板时才加载数据库用户信息
    if (isSignedIn && expanded) {
      setIsLoading(true);

      setTimeout(() => {
        fetch(`/${locale}/api/user/trial`)
          .then(res => res.json())
          .then((data) => {
            if (isMounted) {
              setDbUserInfo(data);
            }
          })
          .catch((err) => {
            console.error('Failed to fetch user data:', err);
          })
          .finally(() => {
            if (isMounted) {
              setIsLoading(false);
            }
          });
      }, 100);
    }

    return () => {
      isMounted = false;
    };
  }, [isSignedIn, locale, expanded]);

  // 只在开发环境中显示
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!isLoaded) {
    return (
      <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <div className="font-medium text-yellow-800">Dev User Info</div>
        <div className="text-sm text-yellow-700">Loading user data...</div>
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
      <button
        className="flex w-full cursor-pointer items-center justify-between font-medium text-yellow-800"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        type="button"
      >
        <span>Dev User Info (开发模式)</span>
        <span>{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="mt-2 space-y-2 text-sm text-yellow-700">
          {isSignedIn
            ? (
                <>
                  <div>
                    <strong>ID:</strong>
                    {' '}
                    {user.id}
                  </div>
                  <div>
                    <strong>Email:</strong>
                    {' '}
                    {user.primaryEmailAddress?.emailAddress}
                  </div>
                  <div>
                    <strong>Trial Started:</strong>
                    {' '}
                    {isLoading
                      ? (
                          <span className="inline-block h-4 w-24 animate-pulse bg-yellow-100"></span>
                        )
                      : dbUserInfo?.user?.trial_started_at
                        ? (
                            new Date(dbUserInfo.user.trial_started_at).toLocaleString()
                          )
                        : (
                            'N/A'
                          )}
                  </div>
                  {dbUserInfo?.user && !isLoading && (
                    <div>
                      <strong>Database User:</strong>
                      <pre className="mt-1 max-h-40 overflow-auto rounded bg-yellow-100 p-2 text-xs">
                        {JSON.stringify(dbUserInfo.user, null, 2)}
                      </pre>
                    </div>
                  )}
                </>
              )
            : (
                <div>用户未登录</div>
              )}
        </div>
      )}
    </div>
  );
};
