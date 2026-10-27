import { OG_SIZE, renderOgCard } from '@/lib/og/card';

export const alt = 'עומק · סטודיו לאתרים';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return renderOgCard({
    title: 'העסק שלך חזק. האתר עדיין לא.',
    eyebrow: 'סטודיו לאתרים',
    tagline: 'הדמיה של העמוד הראשי שלך בחינם. ממשיכים רק אם היא מדויקת.',
  });
}
