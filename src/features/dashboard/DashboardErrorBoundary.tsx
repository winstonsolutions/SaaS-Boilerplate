'use client';

import React from 'react';

type DashboardErrorBoundaryProps = {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
};

type DashboardErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

// 默认错误展示组件
const DefaultErrorFallback = ({ error, reset }: { error: Error; reset: () => void }) => (
  <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-6">
    <h3 className="mb-2 text-lg font-semibold text-red-800">Dashboard Error</h3>
    <p className="mb-4 text-sm text-red-700">
      {error.message || 'Something went wrong while loading the dashboard.'}
    </p>
    <button
      type="button"
      onClick={reset}
      className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
    >
      Try again
    </button>
  </div>
);

export class DashboardErrorBoundary extends React.Component<
  DashboardErrorBoundaryProps,
  DashboardErrorBoundaryState
> {
  constructor(props: DashboardErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): DashboardErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard Error Boundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const ErrorFallback = this.props.fallback || DefaultErrorFallback;
      return <ErrorFallback error={this.state.error} reset={this.handleReset} />;
    }

    return this.props.children;
  }
}
