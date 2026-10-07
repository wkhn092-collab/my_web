'use client';

import Script from 'next/script';
import { publicEnv } from '@/lib/env.public';
import { useVisitor, useVisitorHydrated } from '@/lib/store/visitor';

/** GA4 and Clarity load only after explicit consent, with the request nonce. */
export function Analytics({ nonce }: { nonce?: string }) {
  const hydrated = useVisitorHydrated();
  const consent = useVisitor((s) => s.consent);
  if (!hydrated || consent !== 'granted') return null;

  const { ga4Id, clarityId } = publicEnv;
  return (
    <>
      {ga4Id && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} strategy="afterInteractive" nonce={nonce} />
          <Script id="ga4-init" strategy="afterInteractive" nonce={nonce}>
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${ga4Id}',{anonymize_ip:true});`}
          </Script>
        </>
      )}
      {clarityId && (
        <Script id="clarity-init" strategy="afterInteractive" nonce={nonce}>
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;t.nonce="${nonce ?? ''}";y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarityId}");`}
        </Script>
      )}
    </>
  );
}
