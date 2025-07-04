import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// 由于Clerk类型定义问题，此API暂时禁用
export async function GET(_: NextRequest) {
  return NextResponse.json(
    { success: false, error: 'This API is temporarily disabled due to Clerk API compatibility issues' },
    { status: 503 },
  );
}
