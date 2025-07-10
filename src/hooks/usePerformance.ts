import { useEffect, useRef } from 'react';

/**
 * 性能监控Hook - 用于监控组件渲染时间
 */
export function usePerformance(componentName: string, enabled = process.env.NODE_ENV === 'development') {
  const startTimeRef = useRef<number>(0);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (!mountedRef.current) {
      // 首次挂载
      startTimeRef.current = performance.now();
      mountedRef.current = true;
    }

    return () => {
      if (enabled && startTimeRef.current) {
        const endTime = performance.now();
        const duration = endTime - startTimeRef.current;

        // 只在开发环境下输出性能信息
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.log(`🚀 ${componentName} render time: ${duration.toFixed(2)}ms`);
        }
      }
    };
  });

  // 用于标记特定操作的开始和结束
  const markStart = (operationName: string) => {
    if (enabled) {
      performance.mark(`${componentName}-${operationName}-start`);
    }
  };

  const markEnd = (operationName: string) => {
    if (enabled) {
      performance.mark(`${componentName}-${operationName}-end`);
      try {
        performance.measure(
          `${componentName}-${operationName}`,
          `${componentName}-${operationName}-start`,
          `${componentName}-${operationName}-end`,
        );

        const measure = performance.getEntriesByName(`${componentName}-${operationName}`)[0];
        if (measure && process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.log(`📊 ${componentName} ${operationName}: ${measure.duration.toFixed(2)}ms`);
        }
      } catch (error) {
        console.warn(`Failed to measure ${operationName}:`, error);
      }
    }
  };

  return { markStart, markEnd };
}
