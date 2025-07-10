'use client';

import { useState } from 'react';

export function SimpleEmailTest() {
  const [result, setResult] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);

  // 只在开发环境下显示
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Client-side safe logging function
  const log = (message: string, data?: any) => {
    const logMessage = data ? `${message} ${JSON.stringify(data, null, 2)}` : message;
    setLogs(prev => [...prev, logMessage]);
    // Do not log to console - removed to fix ESLint error
  };

  const testAPI = async () => {
    setResult('测试中...');
    setLogs([]);

    try {
      // 1. 测试配置信息
      log('==== 测试邮件配置 ====');
      const configResponse = await fetch('/api/debug-email', { method: 'GET' });
      const configText = await configResponse.text();
      log('配置响应:', configText);

      // 2. 测试直接发送
      log('==== 测试直接发送 ====');
      const sendResponse = await fetch('/api/debug-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const sendText = await sendResponse.text();
      log('发送响应:', sendText);

      // 3. 测试原有API
      log('==== 测试原有API ====');
      const oldResponse = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'andyredjohn@gmail.com' }),
      });

      const oldText = await oldResponse.text();
      log('原有API响应:', oldText);

      setResult(`配置信息:\n${configText}\n\n直接发送:\n${sendText}\n\n原有API:\n${oldText}`);
    } catch (error) {
      setResult(`错误: ${error}`);
      log('测试失败:', error);
    }
  };

  return (
    <div className="mb-4 rounded border border-yellow-300 bg-yellow-100 p-4">
      <h3 className="font-bold text-yellow-800">邮件发送调试测试</h3>
      <p className="mb-2 text-sm text-yellow-700">
        发件人: PDF Pro &lt;noreply@winstontech.me&gt; → andyredjohn@gmail.com
      </p>
      <button
        onClick={testAPI}
        type="button"
        className="mt-2 rounded bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700"
      >
        测试邮件发送
      </button>
      {result && (
        <pre className="mt-2 max-h-40 overflow-auto rounded border bg-white p-2 text-xs">
          {result}
        </pre>
      )}
      {logs.length > 0 && (
        <div className="mt-2 max-h-40 overflow-auto rounded border bg-gray-50 p-2 text-xs">
          <div className="mb-1 font-bold">日志:</div>
          {logs.map((logEntry, i) => (
            <div key={`log-entry-${logEntry.substring(0, 10)}-${i}`} className="whitespace-pre-wrap text-gray-700">{logEntry}</div>
          ))}
        </div>
      )}
    </div>
  );
}
