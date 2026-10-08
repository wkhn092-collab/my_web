import type { PortableTextBlock } from '@portabletext/react';

/**
 * Drafts from docs/copy-deck.md. Tokens in {curly} braces are filled at render time from siteSettings
 * (see fillLegalTokens). The final wording lives in Sanity and should be reviewed by a lawyer.
 */
export type LegalDraftSection = { heading?: string; paragraphs?: string[]; bullets?: string[] };
export type LegalDraft = { slug: string; title: string; updatedAt: string; sections: LegalDraftSection[] };

export const LEGAL_DRAFTS: LegalDraft[] = [
  {
    slug: 'accessibility',
    title: 'הצהרת נגישות',
    updatedAt: '2026-10-07',
    sections: [
      {
        paragraphs: [
          'האתר נבנה כך שיהיה נגיש לכל אחד ואחת, לפי תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע"ג-2013, ולפי התקן הישראלי ת"י 5568, שמבוסס על הנחיות WCAG 2.0 ברמה AA.',
        ],
      },
      {
        heading: 'מה עשינו באתר',
        bullets: [
          'ניווט מלא במקלדת, עם סימון ברור של המיקום בעמוד.',
          'תמיכה בקוראי מסך: כותרות מסודרות, תיאור לכל תמונה ותוויות לכל שדה.',
          'ניגודיות צבעים לפי התקן.',
          'הגדלת טקסט עד 200% בלי שהעמוד יישבר.',
          'כיבוד הגדרת "הפחתת תנועה" של המכשיר, וכפתור להשהיית אנימציות.',
          'הודעות שגיאה בטפסים, שמוקראות גם בקורא מסך.',
        ],
      },
      {
        heading: 'מה עוד לא נגיש',
        paragraphs: ['לא ידוע לנו על רכיב לא נגיש. אם נתקלת בבעיה, נשמח לשמוע.'],
      },
      {
        heading: 'רכז נגישות',
        paragraphs: ['{coordinatorName} · טלפון: {coordinatorPhone} · מייל: {coordinatorEmail}', '{hours}'],
      },
    ],
  },
  {
    slug: 'privacy',
    title: 'מדיניות פרטיות',
    updatedAt: '2026-10-08',
    sections: [
      { paragraphs: ['האתר מופעל על ידי {legalName}, {businessId}, {city}.'] },
      {
        heading: 'איזה מידע נאסף',
        bullets: [
          'בטופס הפנייה: שם, טלפון, סוג האתר המבוקש, מה הכי חשוב לך שהאתר יעשה, ואם בחרת: תוספות שמעניינות אותך, הודעה ומייל.',
          'מדידה, רק אם אישרת עוגיות: נתוני שימוש באתר דרך Google Analytics ו-Microsoft Clarity.',
          'אבטחה: מזהה מגובב (hash) של כתובת ה-IP, כדי למנוע ספאם. כתובת ה-IP עצמה לא נשמרת.',
        ],
      },
      {
        heading: 'למה',
        paragraphs: ['כדי לחזור אליך ולהכין הצעת מחיר, כדי לשפר את האתר (רק בהסכמה), וכדי להגן על הטופס.'],
      },
      {
        heading: 'איפה המידע נשמר ומי מקבל אותו',
        paragraphs: [
          'הפניות נשמרות במערכת הניהול Sanity, במאגר סגור. ספקים שמעבדים מידע עבורנו: Vercel (אחסון), Sanity (שמירה), Resend (שליחת מיילים), Meta (הודעת וואטסאפ אליי על פנייה חדשה, עם השם, סוג האתר והטלפון בלבד), Cloudflare (הגנה מבוטים), Upstash (הגבלת שליחות), ו-Google ו-Microsoft (מדידה, בהסכמה בלבד). כשממשיכים לוואטסאפ, ההודעה נשלחת דרך WhatsApp ובאחריותו. המידע לא נמכר ולא מועבר לשיווק.',
        ],
      },
      { heading: 'כמה זמן נשמר', paragraphs: ['פנייה שלא הבשילה לעבודה נמחקת אחרי 12 חודשים.'] },
      {
        heading: 'הזכויות שלך',
        paragraphs: ['לעיין במידע, לתקן אותו או לבקש את מחיקתו: {email} או {phone}.'],
      },
      {
        heading: 'אבטחה',
        paragraphs: ['החיבור מוצפן (HTTPS), הגישה למידע מוגבלת, והסודות לא נחשפים לדפדפן.'],
      },
    ],
  },
  {
    slug: 'cookies',
    title: 'מדיניות עוגיות',
    updatedAt: '2026-10-07',
    sections: [
      {
        heading: 'הכרחיות',
        paragraphs: ['שמירת הבחירה שלך לגבי עוגיות, ואבטחת הטופס (Cloudflare Turnstile). לא דורשות הסכמה.'],
      },
      { heading: 'מדידה', paragraphs: ['Google Analytics ו-Microsoft Clarity. נטענות רק אחרי אישור.'] },
      {
        heading: 'שמירה מקומית בדפדפן',
        paragraphs: [
          'האתר זוכר פרויקטים שצפית בהם וסינון אחרון, כדי שאפשר יהיה להמשיך מאיפה שעצרת. נשמרים מזהים בלבד, בלי פרטים אישיים.',
        ],
      },
      { paragraphs: ['אפשר לשנות את הבחירה בכל רגע, בקישור "הגדרות עוגיות" בפוטר.'] },
    ],
  },
  {
    slug: 'terms',
    title: 'תנאי שימוש',
    updatedAt: '2026-10-07',
    sections: [
      {
        paragraphs: [
          'השימוש באתר כפוף לתנאים האלה. התוכן באתר, העיצוב והקוד שייכים ל{legalName}, ואין להעתיק אותם בלי אישור.',
          'פרויקטי הקונספט שבאתר הם הדגמות. הם לא עסקים אמיתיים, והפרטים המופיעים בהם, כמו שמות, מחירים ושעות, הם לצורך הדגמה בלבד.',
          'פנייה דרך האתר לא יוצרת התקשרות. התקשרות נוצרת רק בהצעת מחיר חתומה.',
          'הדין החל הוא הדין הישראלי.',
        ],
      },
    ],
  },
];

let keyCounter = 0;
const key = () => `k${(keyCounter++).toString(36)}`;

function block(text: string, style: 'normal' | 'h2' = 'normal', listItem?: 'bullet'): PortableTextBlock {
  return {
    _type: 'block',
    _key: key(),
    style,
    markDefs: [],
    ...(listItem ? { listItem, level: 1 } : {}),
    children: [{ _type: 'span', _key: key(), text, marks: [] }],
  } as PortableTextBlock;
}

export function draftToPortableText(draft: LegalDraft): PortableTextBlock[] {
  keyCounter = 0;
  return draft.sections.flatMap((section) => [
    ...(section.heading ? [block(section.heading, 'h2')] : []),
    ...(section.paragraphs ?? []).map((p) => block(p)),
    ...(section.bullets ?? []).map((b) => block(b, 'normal', 'bullet')),
  ]);
}
