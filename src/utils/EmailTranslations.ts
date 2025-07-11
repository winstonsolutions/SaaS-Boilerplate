import { AllLocales, AppConfig } from '@/utils/AppConfig';

/**
 * Get email translations for a specific locale
 * @param locale The user's locale
 */
export async function getEmailTranslations(locale: string) {
  // Validate and fallback to default locale if needed
  const validLocale = AllLocales.includes(locale) ? locale : AppConfig.defaultLocale;

  // Load locale messages
  let messages;
  try {
    messages = (await import(`../locales/${validLocale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load locale messages for ${validLocale}:`, error);
    // Fallback to default locale
    messages = (await import(`../locales/${AppConfig.defaultLocale}.json`)).default;
  }

  return messages;
}

/**
 * Enhanced date formatting function that respects locale
 * @param dateString Date string to format
 * @param locale The locale to use for formatting
 */
export function formatLocalizedDate(dateString: string, locale: string = AppConfig.defaultLocale): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Extract user locale from HTTP request
 * @param req The request object
 * @param defaultLocale The default locale to use if no locale is found
 */
export function extractLocaleFromRequest(req: Request, defaultLocale = AppConfig.defaultLocale): string {
  // Try to extract from cookie
  const cookieHeader = req.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
    const localeCookie = cookies.find(cookie => cookie.startsWith('NEXT_LOCALE='));
    if (localeCookie) {
      const locale = localeCookie.split('=')[1];
      if (locale && AllLocales.includes(locale)) {
        return locale;
      }
    }
  }

  // Try to extract from accept-language header
  const acceptLanguage = req.headers.get('accept-language');
  if (acceptLanguage) {
    const preferredLangs = acceptLanguage
      .split(',')
      .map((lang) => {
        // Extract the language code without region/quality
        const match = lang.match(/^([a-z]{2})/i);
        return match && match[1] ? match[1].toLowerCase() : null;
      })
      .filter((lang): lang is string => lang !== null);

    // Find first matching locale
    for (const lang of preferredLangs) {
      if (AllLocales.includes(lang)) {
        return lang;
      }
    }
  }

  // Fallback to default locale
  return defaultLocale;
}
