import type { ReplyHours } from '@/lib/domain/reply-window';
import type { AboutPage, Addon, Faq, HomePage, Niche, Project, ProjectImage, Service, SiteSettings, Testimonial } from '@/lib/content/types';

/**
 * Approved copy from docs/copy-deck.md. Used by `npm run seed` to fill Sanity, and as the local fallback
 * when no Sanity project is configured (development only; deployed environments require Sanity).
 */

export const SEED_SETTINGS: SiteSettings = {
  brandName: 'עומק',
  city: 'טבריה',
  remoteNote: 'עבודה מרחוק בכל הארץ',
  phoneE164: '+972503967230',
  whatsappE164: '+972503967230',
  email: 'wkhn091@gmail.com',
  accessibilityCoordinator: { name: 'אבישי', phoneE164: '+972503967230', email: 'wkhn091@gmail.com' },
};

const WEEKDAY = [
  { from: '14:00', to: '16:00' },
  { from: '19:00', to: '21:00' },
];

export const SEED_HOURS: ReplyHours = {
  days: [WEEKDAY, WEEKDAY, WEEKDAY, WEEKDAY, WEEKDAY, [], []],
  closedDates: [],
  cutoffMinutes: 20,
};

export const SEED_HOME: HomePage = {
  hero: {
    title: 'אתרים עם עומק.',
    lead: 'אתרים לעסקים שרוצים להיראות כמו הגדולים בתחום, ולקבל פניות מלקוחות שכבר מוכנים לסגור.',
    reassurance: 'הדמיה של האתר שלך בחינם, לפני שמחליטים.',
  },
  works: {
    title: 'עבודות שאפשר להיכנס אליהן',
    intro:
      'הסטודיו חדש, ולכן אני מראה בדיוק מה בניתי. אלה פרויקטי קונספט: בניתי אותם כדי להראות מה אפשר לעשות בכל תחום. ציונים יופיעו כאן רק אחרי מדידה, עם התאריך והמקור.',
  },
  depth: {
    title: 'מה שרואים, ומה שמתחת',
    layers: [
      {
        title: 'על פני המים: מה שהלקוח רואה',
        body: 'עיצוב שנבנה לעסק שלך ולא נלקח מתבנית. מתחילים מהטלפון, כי שם רוב האנשים פוגשים את האתר בפעם הראשונה, ורק אחר כך עוברים למחשב.',
      },
      {
        title: 'מתחת לפני השטח: למה הלקוח פונה',
        body: 'לפני שכותבים מילה, בודקים את המתחרים שלך ואת מה שהלקוח שלך רוצה וחושש ממנו. מזה נבנים הכותרות, הסדר והכפתורים. כל מקטע באתר עונה על שאלה אחת של הלקוח.',
      },
      {
        title: 'בעומק: מה שלא רואים ומרגישים',
        body: 'טעינה מהירה, נגישות לפי התקן הישראלי (ת"י 5568) שבנויה בקוד עצמו ולא בתוסף, אבטחה, ומדידה של מה שקורה באתר אחרי שהוא עולה.',
      },
    ],
  },
  services: { title: 'מה אפשר לבנות יחד', note: 'המחיר נקבע בהצעה כתובה אחרי שיחת היכרות חינם.' },
  about: {
    text: 'אני אבישי. אני בונה כל אתר בעצמי, מהשיחה הראשונה ועד העלייה לאוויר, כך שאין באמצע מנהלי פרויקטים או טלפון שמתגלגל.',
  },
  faq: { title: 'שאלות שעולות כמעט בכל שיחה' },
  closing: { title: 'מספרים לי על העסק, ומשם ממשיכים', privacyNote: 'הפרטים נשמרים רק אצלי ולא מועברים לאף אחד.' },
};

export const SEED_ABOUT: AboutPage = {
  title: 'אני אבישי, ואני בונה אתרים מטבריה.',
  paragraphs: [
    'אני עובד לבד, ובונה כל אתר בעצמי: מהשיחה הראשונה, דרך הטקסטים והעיצוב, ועד הקוד והעלייה לאוויר. כשמשהו לא ברור, מדברים איתי ישירות, לא עם נציג.',
    'מה שחשוב לי הוא שהאתר יעבוד בשביל העסק: שייטען מהר, שיהיה נגיש לכולם, ושמי שנכנס אליו יבין תוך כמה שניות מה מקבלים ואיך פונים.',
  ],
  processTitle: 'איך אני עובד',
  process:
    'כל אתר מתחיל בשיחה: מה העסק מוכר, למי, ומה מפריע ללקוחות לפנות היום. אחר כך אני בודק את המתחרים, כותב את הטקסטים ומעצב. בונים רק אחרי שאישרת את התוכנית. אחרי שהאתר עולה, מודדים מה עובד ומשפרים.',
};

export const SEED_SERVICES: Service[] = [
  {
    id: 'service-landing',
    title: 'דף נחיתה',
    summary: 'עמוד אחד שמוביל לפעולה אחת: קמפיין, השקה או שירות מסוים.',
    includes: 'עיצוב מותאם, כתיבת הטקסטים, טופס או וואטסאפ, נגישות ומדידה.',
    siteType: 'landing',
    ctaLabel: 'לשיחה על דף נחיתה',
  },
  {
    id: 'service-brand',
    title: 'אתר תדמית',
    summary: 'כמה עמודים שמציגים את העסק ומביאים פניות.',
    includes: 'כל מה שבדף נחיתה, ובנוסף מערכת ניהול בעברית לעדכון לבד, מבנה שמתאים לגוגל, והצהרת נגישות.',
    siteType: 'brand',
    ctaLabel: 'לשיחה על אתר תדמית',
  },
  {
    id: 'service-premium',
    title: 'אתר פרימיום עם תלת-ממד',
    summary:
      'לעסק שרוצה שהאתר יהיה חוויה שמספרים עליה: סצנה תלת-ממדית או מוצר שאפשר לסובב. רק כשזה עוזר למכור, ואם לא, אגיד לך.',
    includes: 'כל מה שבאתר תדמית, ובנוסף שכבת תלת-ממד עם גרסה קלה לטלפונים חלשים.',
    siteType: 'premium3d',
    ctaLabel: 'לשיחה על אתר פרימיום',
  },
];

export const SEED_NICHES: Niche[] = [
  { slug: 'food', title: 'אוכל' },
  { slug: 'law', title: 'משפט' },
  { slug: 'commerce', title: 'מסחר' },
  { slug: 'services', title: 'שירותים' },
  { slug: 'spaces', title: 'חללים' },
];

const niche = (slug: string) => SEED_NICHES.find((n) => n.slug === slug)!;

/**
 * Real screenshots of each build's first screen (1280×960, captured 8.10.2026). Used whenever a project has no
 * cover of its own, including projects that come from Sanity.
 */
export const LOCAL_COVERS: Record<string, ProjectImage> = Object.fromEntries(
  (
    [
      ['lalibakery', 'LALIBAKERY'],
      ['spacehub', 'SpaceHub'],
      ['tene-mashkaot', 'תנא משקאות'],
      ['luxi', 'לוקסי'],
      ['law-office', 'משרד עורכי דין'],
      ['renovation', 'שיפוצים ואיטום'],
    ] as const
  ).map(([slug, title]) => [slug, { url: `/projects/${slug}.jpg`, alt: `המסך הראשון באתר ${title}`, width: 1280, height: 960 }]),
);

export const SEED_PROJECTS: Project[] = [
  {
    id: 'project-lalibakery',
    slug: 'lalibakery',
    title: 'LALIBAKERY',
    niche: niche('food'),
    siteType: 'store',
    tier: 3,
    isConcept: true,
    liveUrl: 'https://lalibakery-v4-5-h226.vercel.app/',
    summary: 'עוגות בעיצוב אישי: בונה עוגה צעד אחר צעד, Hero בתלת-ממד, וחנות עם סינון לפי אירוע.',
    metrics: [],
  },
  {
    id: 'project-spacehub',
    slug: 'spacehub',
    title: 'SpaceHub',
    niche: niche('spaces'),
    siteType: 'premium3d',
    tier: 3,
    isConcept: true,
    summary: 'הזמנת חדרים לפי שעה: מפת קומה תלת-ממדית שמראה מה פנוי עכשיו, ותשלום מקוון.',
    metrics: [],
  },
  {
    id: 'project-tene',
    slug: 'tene-mashkaot',
    title: 'תנא משקאות',
    niche: niche('commerce'),
    siteType: 'store',
    tier: 3,
    isConcept: true,
    liveUrl: 'https://tene-mashkaot.vercel.app/',
    summary: 'חנות משקאות ומארזי מתנה: "מה מוזגים היום?" שעוזר לבחור בקבוק, מארזים לאירועים, ומשלוח חינם בעיר.',
    metrics: [],
  },
  {
    id: 'project-luxi',
    slug: 'luxi',
    title: 'לוקסי',
    niche: niche('services'),
    siteType: 'brand',
    tier: 2,
    isConcept: true,
    liveUrl: 'https://www.my-test-bot-123.online/',
    summary: 'מספרה בתיאום מראש: בוחרים טיפול ושעה, ואם השבוע מלא נכנסים לרשימת המתנה ומקבלים הודעה כשמתפנה תור.',
    metrics: [],
  },
  {
    id: 'project-law',
    slug: 'law-office',
    title: 'משרד עורכי דין',
    niche: niche('law'),
    siteType: 'brand',
    tier: 2,
    isConcept: true,
    summary: 'אשף קצר שמכוון את הפונה לתחום המשפטי הנכון, ומשם לשיחה בוואטסאפ.',
    metrics: [],
  },
  {
    id: 'project-renovation',
    slug: 'renovation',
    title: 'שיפוצים ואיטום',
    niche: niche('services'),
    siteType: 'brand',
    tier: 2,
    isConcept: true,
    summary: 'אשף להצעת מחיר, תמונות לפני ואחרי, ותהליך עבודה שקוף משלב לשלב.',
    metrics: [],
  },
];

export const SEED_FAQS: Faq[] = [
  {
    id: 'faq-cost',
    question: 'כמה עולה אתר?',
    answer:
      'זה תלוי במה שהעסק צריך: דף אחד, אתר שלם או תלת-ממד. אחרי שיחת היכרות בחינם מקבלים הצעת מחיר כתובה, עם מה שכלול ומה שלא כלול.',
  },
  {
    id: 'faq-ownership',
    question: 'אתה עובד לבד. מה קורה אם תיעלם?',
    answer:
      'האתר, הקוד והתוכן שייכים לך. הם יושבים בחשבונות על שמך, באחסון ובמערכת הניהול, כך שכל מפתח אחר יכול להמשיך מאיפה שעצרנו.',
  },
  {
    id: 'faq-after-launch',
    question: 'מה קורה אחרי שהאתר עולה?',
    answer:
      'האתר עובר אליך, עם מערכת ניהול לעדכונים שוטפים. אם יש באתר תקלה או קריסה שנובעת מהבנייה, אני מתקן אותה. התנאים המדויקים כתובים בהצעת המחיר.',
  },
  {
    id: 'faq-self-edit',
    question: 'אפשר לעדכן את האתר לבד?',
    answer:
      'כן. מקבלים מערכת ניהול בעברית, עם הסבר ליד כל שדה. אפשר לשנות בה טקסטים, תמונות, שעות פעילות ופרויקטים, בלי לגעת בקוד ובלי לשבור את העיצוב.',
  },
  {
    id: 'faq-wix',
    question: 'למה לא Wix או וורדפרס?',
    answer:
      'לפעמים הם מספיקים, ואם זה המצב אגיד לך את זה בשיחה. כשהאתר אמור להביא לקוחות, כדאי שיהיו בו שליטה מלאה, טעינה מהירה, נגישות שבנויה בקוד, ובלי תלות בתוספים.',
  },
  {
    id: 'faq-3d',
    question: 'צריך תלת-ממד?',
    answer:
      'ברוב העסקים לא. תלת-ממד מתאים כשהוא עוזר ללקוח להבין משהו שתמונה לא מראה, כמו מוצר שרוצים לסובב או חלל שרוצים להכיר. אם הוא לא עוזר למכור, לא נכניס אותו.',
  },
  {
    id: 'faq-accessibility',
    question: 'נגישות זו חובה?',
    answer:
      'לרוב העסקים שנותנים שירות לציבור יש חובה לפי תקנות הנגישות. ווידג׳ט נגישות לבד לא מספיק. אני בונה את הנגישות בקוד עצמו, ומכין הצהרת נגישות.',
  },
  {
    id: 'faq-remote',
    question: 'אתה עובד רק באזור טבריה?',
    answer: 'לא. אני עובד מרחוק מול עסקים בכל הארץ, בטלפון, בוואטסאפ או בשיחת וידאו.',
  },
];

/**
 * Paid extras Avishi offers (PROJECT_BRIEF, script 2 module A). Copywriting is not here because the services
 * already include the texts; 3D motion and logo design were dropped at Avishi's request.
 */
export const SEED_ADDONS: Addon[] = [
  {
    slug: 'maintenance',
    title: 'תחזוקה ועדכונים',
    benefit: 'עדכוני תוכן ותיקונים קטנים לאורך הזמן, בלי שתצטרך לפתוח את מערכת הניהול.',
    siteTypes: ['landing', 'brand', 'premium3d', 'unsure'],
  },
  {
    slug: 'booking',
    title: 'מערכת תורים או הזמנות',
    benefit: 'לקוחות קובעים תור או מזמינים ישר מהאתר, גם כשאתה לא זמין לענות.',
    siteTypes: ['landing', 'brand', 'premium3d', 'unsure'],
  },
];

/** Empty until a real client gives a testimonial with written consent. Never fill with examples. */
export const SEED_TESTIMONIALS: Testimonial[] = [];
