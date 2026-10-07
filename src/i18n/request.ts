import { getRequestConfig } from 'next-intl/server';

/** Single locale, no URL prefix. Adding /ar or /en later means adding locales here and a [locale] segment. */
export const LOCALE = 'he';

export default getRequestConfig(async () => ({
  locale: LOCALE,
  timeZone: 'Asia/Jerusalem',
  messages: (await import(`../../messages/${LOCALE}.json`)).default,
}));
