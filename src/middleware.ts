import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import type {
  NextFetchEvent,
  NextRequest,
} from 'next/server';
import {
  NextResponse,
} from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { AllLocales, AppConfig } from './utils/AppConfig';

const intlMiddleware = createMiddleware({
  locales: AllLocales,
  localePrefix: AppConfig.localePrefix,
  defaultLocale: AppConfig.defaultLocale,
});

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/:locale/dashboard(.*)',
  '/onboarding(.*)',
  '/:locale/onboarding(.*)',
  // 排除webhook、同步用户API、测试API、cron API和联系表单API路径
  '/((?!api/webhooks|api/sync-users|api/test-email|api/debug-email|api/cron|api/contact).*)api(.*)',
  '/:locale/((?!api/webhooks|api/sync-users|api/test-email|api/debug-email|api/cron|api/contact).*)api(.*)',
]);

// 此middleware确保只有已登录用户可以访问应用
// 但排除了webhook路径和公共路径
export default function middleware(
  request: NextRequest,
  event: NextFetchEvent,
) {
  // 排除webhook路径、同步用户API、测试API、cron API和联系表单API
  if (
    request.nextUrl.pathname.includes('/api/webhooks')
    || request.nextUrl.pathname.includes('/api/sync-users')
    || request.nextUrl.pathname.includes('/api/test-email')
    || request.nextUrl.pathname.includes('/api/debug-email')
    || request.nextUrl.pathname.includes('/api/cron')
    || request.nextUrl.pathname.includes('/api/contact')
  ) {
    return NextResponse.next();
  }

  if (
    request.nextUrl.pathname.includes('/sign-in')
    || request.nextUrl.pathname.includes('/sign-up')
    || isProtectedRoute(request)
  ) {
    return clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) {
        const locale
          = req.nextUrl.pathname.match(/(\/.*)\/dashboard/)?.at(1) ?? '';

        const signInUrl = new URL(`${locale}/sign-in`, req.url);

        await auth.protect({
          // `unauthenticatedUrl` is needed to avoid error: "Unable to find `next-intl` locale because the middleware didn't run on this request"
          unauthenticatedUrl: signInUrl.toString(),
        });
      }

      return intlMiddleware(req);
    })(request, event);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next|monitoring).*)', '/', '/(api|trpc)(.*)'],
};
