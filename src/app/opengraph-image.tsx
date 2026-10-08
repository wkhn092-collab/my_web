import { OG_SIZE, renderOgCard } from '@/lib/og/card';

export const alt = 'עומק · סטודיו לאתרים';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return renderOgCard({ title: 'אתרים עם עומק.', eyebrow: 'סטודיו לאתרים', tagline: 'הדמיה של האתר שלך בחינם, לפני שמחליטים.' });
}
