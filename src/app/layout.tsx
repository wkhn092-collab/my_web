import type { Metadata, Viewport } from 'next';
import { Frank_Ruhl_Libre, Heebo } from 'next/font/google';
import { headers } from 'next/headers';
import { publicEnv } from '@/lib/env.public';
import './globals.css';

const frank = Frank_Ruhl_Libre({
  subsets: ['hebrew', 'latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-frank',
  display: 'swap',
});

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  variable: '--font-heebo',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.siteUrl),
  title: { default: 'עומק · סטודיו לאתרים מטבריה', template: '%s · עומק' },
  description: 'אתרים לעסקים שרוצים להיראות כמו הגדולים בתחום, ולקבל פניות מלקוחות שכבר מוכנים לסגור.',
  openGraph: { type: 'website', locale: 'he_IL', siteName: 'עומק' },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#0c1626',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  // Reading the request opts every page into dynamic rendering, which the per-request CSP nonce requires.
  await headers();
  return (
    <html lang="he" dir="rtl" data-scroll-behavior="smooth" className={`${frank.variable} ${heebo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
