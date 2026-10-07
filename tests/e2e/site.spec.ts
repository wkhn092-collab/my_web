import { expect, test } from '@playwright/test';

test.describe('home', () => {
  test('renders the hero in Hebrew RTL with a nonce-based CSP', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    const csp = response?.headers()['content-security-policy'] ?? '';
    expect(csp).toMatch(/script-src 'self' 'nonce-[A-Za-z0-9+/=]+' 'strict-dynamic'/);
    expect(csp).toContain("frame-ancestors 'self'");

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'he');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('אתרים עם עומק.');
    await expect(page.locator('#hero-cta')).toHaveText('לשיחה על האתר שלך');
  });

  test('has no horizontal overflow', async ({ page }) => {
    await page.goto('/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('every concept project is labelled', async ({ page }) => {
    await page.goto('/projects');
    const cards = page.locator('main article');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i)).toContainText('פרויקט קונספט');
    }
  });
});

test.describe('lead form', () => {
  test('shows the approved microcopy for invalid input and focuses the first error', async ({ page }) => {
    await page.goto('/');
    const form = page.locator('#contact form');
    await form.getByRole('button', { name: 'להמשך בוואטסאפ' }).click();
    await expect(form.getByText('צריך שם, כדי שאדע איך לפנות')).toBeVisible();
    await expect(form.getByLabel('שם')).toBeFocused();

    await form.getByLabel('שם').fill('דנה');
    await form.getByLabel('טלפון').fill('123');
    await form.getByRole('button', { name: 'להמשך בוואטסאפ' }).click();
    await expect(form.getByText('כדאי לבדוק את המספר. למשל: 050-1234567')).toBeVisible();
    await expect(form.getByLabel('טלפון')).toBeFocused();
  });

  test('a valid lead opens WhatsApp with the prefilled message and lands on /thanks', async ({ page, context }) => {
    // Never hit the real WhatsApp from tests.
    await context.route('https://wa.me/**', (route) => route.fulfill({ status: 200, body: 'ok' }));
    await page.goto('/');
    const popup = context.waitForEvent('page');
    const form = page.locator('#contact form');
    await form.getByLabel('שם').fill('דנה');
    await form.getByLabel('טלפון').fill('050-1234567');
    await form.getByLabel('אתר תדמית').check();
    await form.getByRole('button', { name: 'להמשך בוואטסאפ' }).click();

    const whatsapp = await popup;
    await whatsapp.waitForURL(/^https:\/\/wa\.me\//);
    const url = new URL(whatsapp.url());
    expect(url.pathname).toBe('/972503967230');
    expect(url.searchParams.get('text')).toBe('היי, אני דנה, פניתי אליך מהאתר של עומק.\nסוג אתר: אתר תדמית');

    await expect(page).toHaveURL(/\/thanks$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('תודה, דנה. הפנייה אצלי.');
  });

  test('a direct visit to /thanks shows no personal data', async ({ page }) => {
    await page.goto('/thanks');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('תודה. הפנייה אצלי.');
  });
});

test.describe('routing', () => {
  test('unknown pages return 404 with a way back', async ({ page }) => {
    const response = await page.goto('/no-such-page');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('link', { name: 'לעמוד הבית', exact: true })).toBeVisible();
  });

  test('legal pages render with tokens filled', async ({ page }) => {
    await page.goto('/legal/accessibility');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('הצהרת נגישות');
    await expect(page.locator('article')).not.toContainText('{coordinatorName}');
  });
});
