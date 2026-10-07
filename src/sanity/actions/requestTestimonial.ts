import type { DocumentActionComponent } from 'sanity';
import { testimonialRequestUrl } from '../../lib/domain/testimonial-request';

type LeadDoc = { status?: string; name?: string; phone?: string };

/** Opens WhatsApp with the request ready; Avishi presses "send" himself. Only for leads marked "won". */
export const requestTestimonialAction: DocumentActionComponent = ({ draft, published, onComplete }) => {
  const doc = (draft ?? published) as LeadDoc | null;
  const url = doc?.status === 'won' ? testimonialRequestUrl(doc.name ?? '', doc.phone) : null;
  return {
    label: 'בקשת המלצה בוואטסאפ',
    title: url ? 'פותח וואטסאפ עם נוסח מוכן. השליחה נשארת אצלך.' : 'זמין רק לפנייה בסטטוס "נסגר" עם טלפון תקין',
    disabled: !url,
    onHandle: () => {
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
      onComplete();
    },
  };
};
