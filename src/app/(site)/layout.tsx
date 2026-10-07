import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { draftMode, headers } from 'next/headers';
import { VisualEditing } from 'next-sanity/visual-editing';
import { LeadDrawer } from '@/components/lead/LeadDrawer';
import { CustomCursor } from '@/components/motion/CustomCursor';
import { Intro } from '@/components/motion/Intro';
import { SmoothScroll } from '@/components/motion/SmoothScroll';
import { Analytics } from '@/components/site/Analytics';
import { AnnouncementBar } from '@/components/site/AnnouncementBar';
import { CookieBanner } from '@/components/site/CookieBanner';
import { Footer } from '@/components/site/Footer';
import { Header } from '@/components/site/Header';
import { StickyCta } from '@/components/site/StickyCta';
import { WhatsAppFab } from '@/components/site/WhatsAppFab';
import { getSiteContent } from '@/lib/content/site-content';
import { toWhatsAppNumber } from '@/lib/domain/phone';
import { formatReplyWindow, getReplyWindow } from '@/lib/domain/reply-window';

export default async function SiteLayout({ children }: LayoutProps<'/'>) {
  const [content, messages, t, requestHeaders, draft] = await Promise.all([
    getSiteContent(),
    getMessages(),
    getTranslations('common'),
    headers(),
    draftMode(),
  ]);
  const nonce = requestHeaders.get('x-nonce') ?? undefined;
  const replyWindow = formatReplyWindow(getReplyWindow(new Date(), content.hours));
  const whatsappNumber = toWhatsAppNumber(content.settings.whatsappE164);

  return (
    <NextIntlClientProvider messages={messages}>
      <Intro brand={content.settings.brandName} />
      <a href="#main" className="sr-only-focusable fixed right-3 top-3 z-[100] rounded-lg bg-pearl px-4 py-2 text-abyss">
        {t('skipToContent')}
      </a>
      <AnnouncementBar announcement={content.announcement} />
      <Header />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer content={content} />
      <StickyCta replyWindow={replyWindow} whatsappNumber={whatsappNumber} />
      <WhatsAppFab whatsappNumber={whatsappNumber} />
      <LeadDrawer whatsappNumber={whatsappNumber} nonce={nonce} />
      <CookieBanner />
      <div className="grain" aria-hidden="true" />
      <SmoothScroll />
      <CustomCursor />
      <Analytics nonce={nonce} />
      {draft.isEnabled && <VisualEditing />}
    </NextIntlClientProvider>
  );
}
