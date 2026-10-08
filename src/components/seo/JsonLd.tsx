import { serializeJsonLd } from '@/lib/seo/structured-data';

/** Structured data for search engines. Data, not code: the browser never runs it, and `<` is escaped. */
export function JsonLd({ data, nonce }: { data: Record<string, unknown> | Record<string, unknown>[]; nonce?: string }) {
  return <script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
