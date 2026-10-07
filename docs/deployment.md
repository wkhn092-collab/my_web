# העלאה לאוויר: Sanity ו-Vercel

המדריך מניח שהחשבונות כבר פתוחים: GitHub, Vercel, Sanity, Resend, Cloudflare ו-Upstash.
כל ערך סודי נכנס רק ל-Vercel ול-`.env.local` אצלך במחשב, ולעולם לא ל-git. הרשימה המלאה של המשתנים נמצאת ב-`.env.example`.

> ב-Vercel ובסביבת Preview השרת לא יעלה בכלל אם חסר משתנה חובה (`REQUIRED_ON_VERCEL` ב-`src/lib/env.server.ts`). זו הגנה מכוונת: עדיף שגיאת פריסה מאשר טופס שמקבל פניות בלי הגנה מבוטים או בלי לשמור אותן.

---

## 1. Sanity

### 1.1 פרויקט ו-datasets

1. ב-[sanity.io/manage](https://www.sanity.io/manage): פרויקט חדש בשם "עומק". מעתיקים את ה-Project ID.
2. Datasets:
   - `production`: **Public**. זה התוכן של האתר (מוצג לכולם בכל מקרה).
   - `leads`: **Private**. כאן נשמרות הפניות. אסור שיהיה Public.
   ```bash
   npx sanity dataset create leads --visibility private
   ```
   (`production` נוצר עם הפרויקט. אם לא: `npx sanity dataset create production --visibility public`.)

### 1.2 CORS

API → CORS origins. מוסיפים, **עם** Allow credentials (בשביל ה-Studio שב-`/studio`):

- `http://localhost:3000`
- `https://<הדומיין>` (למשל `https://omek.co.il`)
- כתובת ה-Preview של Vercel, אם רוצים Studio גם שם.

### 1.3 טוקנים

API → Tokens:

| שם | הרשאה | משתנה |
| --- | --- | --- |
| `omek-preview` | Viewer | `SANITY_READ_TOKEN` |
| `omek-server` | Editor | `SANITY_WRITE_TOKEN` |

ה-Editor משמש לשמירת פניות ב-`leads` ולסקריפט ה-seed. שניהם בצד השרת בלבד, בלי `NEXT_PUBLIC`.

### 1.4 תוכן התחלתי (seed)

ממלאים את `.env.local` (לפחות `NEXT_PUBLIC_SANITY_PROJECT_ID` ו-`SANITY_WRITE_TOKEN`), ואז:

```bash
npm run seed            # יוצר רק מסמכים שעוד לא קיימים
npm run seed -- --force # דורס את הכול לפי src/content (זהירות: מוחק עריכות)
```

אחרי ה-seed נכנסים ל-`http://localhost:3000/studio`, משלימים ב"פרטי העסק" את השם המשפטי, סוג העוסק והמספר (בלי זה המסמך לא יתפרסם, וזה בכוונה), ומעלים תמונות לפרויקטים.

### 1.5 Webhook לרענון האתר

API → Webhooks → Create:

- **URL:** `https://<הדומיין>/api/revalidate`
- **Dataset:** `production` בלבד (לא `leads`)
- **Trigger on:** Create, Update, Delete
- **Filter:** `_type in ["siteSettings","hours","announcement","homePage","aboutPage","service","addon","niche","project","testimonial","faq","legalPage"]`
- **Projection:** `{_type}`
- **HTTP method:** POST
- **Secret:** מחרוזת אקראית של 32 תווים ומעלה. אותו ערך נכנס ל-`SANITY_WEBHOOK_SECRET`.

יצירת סוד:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

בלי webhook האתר עדיין מתעדכן, אבל רק פעם ביממה.

---

## 2. Cloudflare Turnstile

1. Cloudflare → Turnstile → Add widget.
2. **Hostnames:** הדומיין (וגם `localhost` אם רוצים לבדוק מקומית עם מפתחות אמיתיים).
3. **Widget mode:** Managed.
4. מעתיקים: Site key ל-`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, ו-Secret key ל-`TURNSTILE_SECRET_KEY`.

בפרודקשן השרת בודק שה-hostname שחזר מ-Cloudflare שווה לדומיין שב-`NEXT_PUBLIC_SITE_URL`, לכן חשוב שזה יהיה הדומיין הקנוני (ראו "דומיין" למטה).

## 3. Upstash Redis (הגבלת שליחות)

1. Upstash → Create database → Redis, אזור `eu-central-1` (פרנקפורט, קרוב ל-Vercel `fra1`).
2. מעתיקים את ה-REST URL וה-REST Token ל-`UPSTASH_REDIS_REST_URL` ו-`UPSTASH_REDIS_REST_TOKEN`.

המגבלות: 3 פניות לכל IP בעשר דקות, ו-5 פניות לאותו מספר טלפון ביום. בלי Redis האתר המפורס **חוסם** את הטופס (fail closed), ולא מוותר על ההגבלה.

## 4. Resend (מיילים)

1. Resend → Domains → Add domain → מוסיפים את רשומות ה-DNS שהם נותנים (SPF, DKIM) אצל רשם הדומיין, ומחכים לאימות.
2. API Keys → Create, בהרשאת Sending access בלבד. הערך נכנס ל-`RESEND_API_KEY`.
3. `EMAIL_FROM="עומק <hello@<הדומיין>>"`, ו-`OWNER_EMAIL` הוא המייל שאליו מגיע הגיבוי של כל פנייה.

עד שהדומיין מאומת אפשר לבדוק עם `onboarding@resend.dev`, אבל אז Resend שולח רק לכתובת של בעל החשבון.

## 5. מלח ל-IP

`LEAD_IP_SALT`: מחרוזת אקראית של 32 תווים ומעלה (אותה פקודה כמו בסעיף ה-webhook). כתובות IP לא נשמרות, רק hash שלהן עם המלח הזה. לא משנים את המלח אחרי ההשקה, אחרת הגבלת השליחות "שוכחת" את כולם.

---

## 6. Vercel

### 6.1 תוכנית

**Hobby אסור לשימוש מסחרי** לפי תנאי Vercel. אתר של עסק צריך **Pro**.

### 6.2 חיבור הפרויקט

1. דוחפים את הקוד ל-GitHub (ריפו פרטי).
2. Vercel → Add New → Project → בוחרים את הריפו. Framework: Next.js (מזוהה לבד). אין צורך לשנות Build Command.
3. Settings → Functions → Region: `fra1` (פרנקפורט).
4. Settings → General → Node.js Version: 24.x.

### 6.3 משתני סביבה

Settings → Environment Variables. כל משתנה מ-`.env.example`, עם ערכים אמיתיים, ל-Production ול-Preview:

- חובה (השרת לא יעלה בלעדיהם): `NEXT_PUBLIC_SANITY_PROJECT_ID`, `SANITY_WRITE_TOKEN`, `SANITY_WEBHOOK_SECRET`, `RESEND_API_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `LEAD_IP_SALT`.
- חשוב: `NEXT_PUBLIC_SITE_URL` (ב-Production: הדומיין הקנוני עם `https://`), `SANITY_READ_TOKEN` (לתצוגה מקדימה), `EMAIL_FROM`, `OWNER_EMAIL`.
- רשות: `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_CLARITY_ID`. נטענים רק אחרי הסכמה לעוגיות.

משתנה שמתחיל ב-`NEXT_PUBLIC_` נצרב בזמן ה-build, לכן אחרי שינוי שלו צריך Redeploy.

### 6.4 דומיין

1. Settings → Domains → מוסיפים את הדומיין ואת `www`.
2. מגדירים אחד מהם כקנוני (מומלץ בלי `www`) והשני כ-Redirect 308 אליו.
3. מעדכנים את `NEXT_PUBLIC_SITE_URL`, את ה-CORS ב-Sanity, את ה-Hostnames ב-Turnstile ואת ה-URL של ה-webhook.

### 6.5 תצוגה מקדימה (Presentation)

ב-Studio, בלשונית Presentation, האתר נטען בתוך iframe עם טיוטות. זה עובד כש-`SANITY_READ_TOKEN` מוגדר. ה-CSP של האתר מאפשר מסגור רק מאותו דומיין (`frame-ancestors 'self'`), ולכן ה-Studio חייב לרוץ מתוך האתר עצמו (`/studio`) ולא מ-`*.sanity.studio`.

---

## 7. בדיקה אחרי העלייה

- [ ] `https://<הדומיין>` נטען, בעברית ומימין לשמאל, עם התוכן מ-Sanity (לא תוכן ה-seed).
- [ ] שליחת טופס עם הטלפון שלך: נפתח וואטסאפ עם הודעה מוכנה, הפנייה מופיעה ב-Studio ב"פניות", ומגיע מייל גיבוי.
- [ ] שינוי טקסט ב-Studio ופרסום: האתר מתעדכן תוך כמה שניות (ה-webhook עובד). ב-Sanity → Webhooks → Attempts רואים 200.
- [ ] כותרות אבטחה: [securityheaders.com](https://securityheaders.com) מראה CSP עם nonce, HSTS ו-X-Content-Type-Options.
- [ ] Lighthouse במובייל על דף הבית ועל דף פרויקט.
- [ ] לפני שמפעילים GA4 או Clarity: לוודא שבלי לחיצה על "לאישור" אין בקשות אליהם (DevTools → Network).

## 8. פריסה שוטפת

- כל push ל-`main` עולה לפרודקשן; כל Pull Request מקבל Preview משלו.
- GitHub Actions (`.github/workflows/ci.yml`) מריץ lint, בדיקת טיפוסים, בדיקות יחידה, build ובדיקות קצה לקצה על כל PR.
- עדכוני תלויות: `npm outdated`, ואז `npm audit --omit=dev`. ‏Next.js מעדכנים לגרסת patch האחרונה ברגע שיוצא תיקון אבטחה.
