import 'server-only';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { toVisualOrder } from './visual-order';

export const OG_SIZE = { width: 1200, height: 630 };

const fontsDir = join(process.cwd(), 'src/assets/fonts');
const fonts = Promise.all([readFile(join(fontsDir, 'FrankRuhlLibre-Regular.ttf')), readFile(join(fontsDir, 'Heebo-Regular.ttf'))]);

const LOCAL_IMAGE = /^\/[a-z0-9/_-]+\.(jpe?g|png)$/i;
const SANITY_IMAGE = /^https:\/\/cdn\.sanity\.io\/images\//;

/** Local covers are inlined from /public; Sanity covers are requested already cropped to the 4:3 frame. Anything else is ignored. */
async function backgroundSrc(src: string | undefined): Promise<string | null> {
  if (!src) return null;
  if (LOCAL_IMAGE.test(src) && !src.includes('..')) {
    const data = await readFile(join(process.cwd(), 'public', src));
    return `data:image/${src.endsWith('.png') ? 'png' : 'jpeg'};base64,${data.toString('base64')}`;
  }
  if (SANITY_IMAGE.test(src)) {
    const url = new URL(src);
    url.search = new URLSearchParams({ w: '1120', h: '840', fit: 'crop', crop: 'top', fm: 'jpg', q: '80' }).toString();
    return url.toString();
  }
  return null;
}

/** Shrinks long single-line titles instead of wrapping (wrapping would reverse the Hebrew line order). */
function titleSize(title: string, narrow: boolean): number {
  if (narrow) return title.length <= 8 ? 84 : title.length <= 14 ? 64 : 48;
  if (title.length <= 14) return 96;
  if (title.length <= 22) return 76;
  return 58;
}

type Card = { title: string; eyebrow?: string; tagline?: string; badge?: string; image?: string };

export async function renderOgCard({ title, eyebrow, tagline, badge, image }: Card): Promise<ImageResponse> {
  const [frank, heebo] = await fonts;
  const bg = await backgroundSrc(image);

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: '#0c1626', fontFamily: 'Heebo', color: '#efe9de' }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 720,
            height: 630,
            display: 'flex',
            backgroundImage: 'radial-gradient(circle closest-side, rgba(45,111,120,0.55) 0%, rgba(12,22,38,0) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: 640,
            height: 630,
            display: 'flex',
            backgroundImage: 'radial-gradient(circle closest-side, rgba(107,76,138,0.5) 0%, rgba(12,22,38,0) 100%)',
          }}
        />

        {bg && (
          <div
            style={{
              position: 'absolute',
              left: 56,
              top: 105,
              width: 560,
              height: 420,
              display: 'flex',
              overflow: 'hidden',
              borderRadius: 24,
              border: '1px solid rgba(239,233,222,0.25)',
              boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img> only */}
            <img src={bg} alt="" width={560} height={420} style={{ objectFit: 'cover', objectPosition: 'top' }} />
          </div>
        )}

        <div
          style={{
            position: 'absolute',
            top: 52,
            bottom: 56,
            right: 64,
            left: bg ? 664 : 64,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontFamily: 'Frank Ruhl Libre', fontSize: 44 }}>{toVisualOrder('עומק')}</div>
            <div style={{ width: 14, height: 14, borderRadius: 7, background: '#c9a66b' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            {badge && (
              <div
                style={{
                  display: 'flex',
                  padding: '6px 18px',
                  marginBottom: 22,
                  borderRadius: 999,
                  border: '1px solid rgba(239,233,222,0.45)',
                  fontSize: 24,
                }}
              >
                {toVisualOrder(badge)}
              </div>
            )}
            {eyebrow && <div style={{ fontSize: 28, color: '#c9a66b' }}>{toVisualOrder(eyebrow)}</div>}
            <div style={{ fontFamily: 'Frank Ruhl Libre', fontSize: titleSize(title, Boolean(bg)), lineHeight: 1.05, marginTop: 10 }}>
              {toVisualOrder(title)}
            </div>
            {tagline && <div style={{ fontSize: 30, marginTop: 16, color: 'rgba(239,233,222,0.82)' }}>{toVisualOrder(tagline)}</div>}
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: 'Frank Ruhl Libre', data: frank, style: 'normal', weight: 400 },
        { name: 'Heebo', data: heebo, style: 'normal', weight: 400 },
      ],
    },
  );
}
