import type { PortableTextBlock } from '@portabletext/react';
import type { ReactNode } from 'react';
import { BidiText } from '@/components/BidiText';

type Span = { _key?: string; _type: string; text?: string; marks?: string[] };
type Block = { _key?: string; _type: string; style?: string; listItem?: string; children?: Span[] };

/**
 * Renders the legal Portable Text subset (h2, normal, bullet, strong) as plain text only, so tokens can be filled
 * and numbers/emails isolated with <bdi>. Unknown block types are skipped rather than rendered.
 */
export function LegalBody({ blocks, tokens }: { blocks: PortableTextBlock[]; tokens: Record<string, string> }) {
  const fill = (text: string) => text.replace(/\{(\w+)\}/g, (match, key: string) => tokens[key] ?? match);

  const spans = (block: Block) =>
    (block.children ?? [])
      .filter((s) => s._type === 'span' && typeof s.text === 'string')
      .map((s, i) => {
        const content = <BidiText text={fill(s.text!)} />;
        return s.marks?.includes('strong') ? <strong key={s._key ?? i}>{content}</strong> : <span key={s._key ?? i}>{content}</span>;
      });

  const out: ReactNode[] = [];
  let list: ReactNode[] = [];
  const flush = () => {
    if (list.length) out.push(<ul key={`ul-${out.length}`} className="list-disc space-y-1 ps-6 marker:text-gold">{list}</ul>);
    list = [];
  };

  (blocks as Block[]).forEach((block, i) => {
    if (block._type !== 'block') return;
    const key = block._key ?? String(i);
    if (block.listItem === 'bullet') {
      list.push(<li key={key}>{spans(block)}</li>);
      return;
    }
    flush();
    if (block.style === 'h2') out.push(<h2 key={key} className="mt-12 text-3xl font-light text-pearl">{spans(block)}</h2>);
    else out.push(<p key={key}>{spans(block)}</p>);
  });
  flush();

  return <div className="space-y-4 text-lg">{out}</div>;
}
