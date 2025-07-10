'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function EmailTestPanel() {
  const [email, setEmail] = useState('andyredjohn@gmail.com');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  // 只在开发环境下显示
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Client-side safe logging function
  const log = (message: string, data?: any) => {
    const logMessage = data ? `${message} ${JSON.stringify(data)}` : message;
    setLogs(prev => [...prev, logMessage]);
    // Do not log to console - removed to fix ESLint error
  };

  const handleTestEmail = async () => {
    if (!email) {
      setResult({ success: false, error: 'Please enter an email address' });
      return;
    }

    setIsLoading(true);
    setResult(null);
    setLogs([]);

    try {
      log('发送测试邮件请求到:', '/api/test-email');
      log('请求数据:', { email });

      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      log('响应状态:', response.status);
      log('响应头:', response.headers);

      // 检查响应类型
      const contentType = response.headers.get('content-type');
      log('Content-Type:', contentType);

      if (!response.ok) {
        // 如果响应不成功，尝试获取错误信息
        const errorText = await response.text();
        log('响应错误:', errorText);
        setResult({
          success: false,
          error: `HTTP ${response.status}: ${errorText.substring(0, 200)}`,
        });
        return;
      }

      // 检查是否是JSON响应
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        log('响应数据:', data);
        setResult(data);
      } else {
        // 不是JSON响应，获取文本内容
        const text = await response.text();
        log('非JSON响应:', text.substring(0, 200));
        setResult({
          success: false,
          error: `Expected JSON response but got: ${contentType}. Response: ${text.substring(0, 100)}...`,
        });
      }
    } catch (error) {
      log('请求异常:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-800">Email Test Panel (Dev Only)</CardTitle>
        <CardDescription className="text-orange-700">
          Test email sending functionality in development mode.
          Current environment:
          {' '}
          {process.env.NODE_ENV || 'unknown'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter test email address"
              value={email}
              readOnly
              className="flex-1 bg-gray-50"
              onChange={e => setEmail(e.target.value)}
            />
            <Button
              onClick={handleTestEmail}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? 'Sending...' : 'Send Test Email'}
            </Button>
          </div>

          {result && (
            <div className={`rounded-md p-3 text-sm ${
              result.success
                ? 'border border-green-200 bg-green-100 text-green-800'
                : 'border border-red-200 bg-red-100 text-red-800'
            }`}
            >
              {result.success
                ? (
                    <div>
                      <strong>✅ Success:</strong>
                      {' '}
                      {result.message || 'Test email sent successfully!'}
                    </div>
                  )
                : (
                    <div>
                      <strong>❌ Error:</strong>
                      <div className="mt-1 rounded border bg-red-50 p-2 text-xs">
                        {result.error || 'Failed to send test email'}
                      </div>
                    </div>
                  )}
            </div>
          )}

          {logs.length > 0 && (
            <div className="mt-2 max-h-40 overflow-auto rounded border bg-gray-100 p-2 text-xs">
              <div className="mb-1 font-bold">Logs:</div>
              {logs.map((logEntry, i) => (
                <div key={`log-entry-${logEntry.substring(0, 10)}-${i}`} className="whitespace-pre-wrap">{logEntry}</div>
              ))}
            </div>
          )}

          <div className="text-xs text-orange-600">
            💡 Tip: Check the browser console (F12) for detailed logs
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
