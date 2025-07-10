// 创建一个简单的日志记录器
const createSimpleLogger = () => {
  // Safe logging function that avoids direct console usage
  const safeLog = (level: string, msg: string, obj?: any) => {
    // In production, we could replace this with a more sophisticated solution
    // that doesn't use console directly, or disable it entirely
    if (process.env.NODE_ENV !== 'production') {
      if (typeof msg === 'string' && obj !== undefined) {
        // eslint-disable-next-line no-console
        console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](`[${level.toUpperCase()}] ${msg}`, obj);
      } else {
        // eslint-disable-next-line no-console
        console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](`[${level.toUpperCase()}]`, msg);
      }
    }
  };

  return {
    info: (obj: any, msg?: string) => safeLog('info', msg || '', obj),
    error: (obj: any, msg?: string) => safeLog('error', msg || '', obj),
    warn: (obj: any, msg?: string) => safeLog('warn', msg || '', obj),
    debug: (obj: any, msg?: string) => safeLog('debug', msg || '', obj),
  };
};

// Use a simple logger everywhere to avoid thread-stream issues
const logger = createSimpleLogger();

// Completely disable the pino logger configuration
// const logger = isClientSide || isEdgeRuntime
//   ? createSimpleLogger()
//   : pino({
//       level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
//       transport: {
//         target: 'pino-pretty',
//         options: {
//           colorize: true,
//           translateTime: 'yyyy-mm-dd HH:MM:ss',
//           ignore: 'pid,hostname' // 更简洁的输出
//         }
//       }
//     });

// Remove Logtail integration that might be causing issues
// if (!isClientSide && !isEdgeRuntime && Env.LOGTAIL_SOURCE_TOKEN && process.env.NODE_ENV === 'production') {
//   logger.info('Logtail configured via source token');
// }

export { logger };
