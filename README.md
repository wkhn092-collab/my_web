# עומק · אתר הסטודיו

Next.js 16 (App Router), Sanity 6, Tailwind 4, next-intl (עברית בלבד, RTL).
מסמך האפיון וההחלטות: [`PROJECT_BRIEF.md`](./PROJECT_BRIEF.md). העלאה לאוויר: [`docs/deployment.md`](./docs/deployment.md).

## הרצה מקומית

```bash
npm install
cp .env.example .env.local   # אפשר להשאיר ריק: האתר ירוץ על תוכן ה-seed
npm run dev                  # http://localhost:3000, ה-Studio ב-/studio
```

בלי מפתחות, הטופס עובד במצב פיתוח: Turnstile מדולג, הגבלת השליחות נשמרת בזיכרון, והפנייה לא נשמרת בשום מקום (רק מגיעים לוואטסאפ ול-/thanks). בסביבה מפורסמת כל אלה חובה.

## פקודות

| פקודה | מה עושה |
| --- | --- |
| `npm run dev` | שרת פיתוח |
| `npm run build` / `npm start` | build ופרודקשן מקומי |
| `npm run lint` | ESLint |
| `npm run typecheck` | יצירת טיפוסי routes ובדיקת TypeScript |
| `npm test` | בדיקות יחידה (Vitest) |
| `npm run test:e2e` | בדיקות קצה לקצה (Playwright, מובייל 375px ודסקטופ) |
| `npm run seed` | טעינת תוכן התחלתי ל-Sanity |

`npm run test:e2e` מרים שרת על פורט 3200. אם כבר רץ `npm run dev`, ‏Next לא יאפשר שרת פיתוח שני: מריצים עם `E2E_PORT=3000` כדי להשתמש בקיים.

## מבנה

```
src/
  app/(site)/        עמודי האתר (בית, עבודות, פרויקט, מי אני, תודה, משפטי)
  app/studio/        Sanity Studio מוטמע
  app/api/           webhook לרענון תוכן, draft mode
  app/actions/       Server Action של טופס הפנייה
  components/        רכיבי UI (site, lead, works, home, water, legal)
  content/           תוכן seed וטיוטות משפטיות (fallback לפיתוח)
  lib/               דומיין (שעות מענה, טלפון, וואטסאפ), אבטחה, env, store
  sanity/            סכמות, קליינטים ושאילתות GROQ
  proxy.ts           CSP עם nonce לכל בקשה
messages/he.json     כל המיקרו-קופי
docs/                אפיון, מפת תנועה, קונספט 3D, רישיונות, העלאה לאוויר
```
