'use client';

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';

export const DevUserInfo = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const [expanded, setExpanded] = useState(false);

  // Only show in development environment
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!isLoaded || !isSignedIn) {
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
            <strong>Full Name:</strong>
            {' '}
            {user.fullName}
          </div>
          <div>
            <strong>Username:</strong>
            {' '}
            {user.username}
          </div>
          <div>
            <strong>Created:</strong>
            {' '}
            {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}
          </div>
          <div>
            <strong>Updated:</strong>
            {' '}
            {user.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'N/A'}
          </div>
          <div>
            <strong>Trial Started:</strong>
            {' '}
            {user.publicMetadata?.trial_started_at
              ? new Date(user.publicMetadata.trial_started_at as string).toLocaleString()
              : 'N/A'}
          </div>
          {user.publicMetadata && (
            <div>
              <strong>Public Metadata:</strong>
              <pre className="mt-1 max-h-40 overflow-auto rounded bg-yellow-100 p-2 text-xs">
                {JSON.stringify(user.publicMetadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
