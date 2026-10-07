import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const WCAG_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

// Entrance animations hold text at near-zero opacity until it scrolls in; axe should judge the settled page.
test.use({ reducedMotion: 'reduce' });

async function expectNoViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_AA).analyze();
  const summary = violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
  expect(summary).toEqual([]);
}

const PAGES = ['/', '/about', '/projects', '/thanks', '/legal/accessibility', '/legal/privacy', '/no-such-page'];

for (const path of PAGES) {
  test(`${path} meets WCAG 2.2 AA (axe)`, async ({ page }) => {
    await page.goto(path);
    await expectNoViolations(page);
  });
}

test('a project page meets WCAG 2.2 AA (axe)', async ({ page }) => {
  await page.goto('/projects');
  const href = await page.locator('main a[href^="/projects/"]').first().getAttribute('href');
  expect(href).toBeTruthy();
  await page.goto(href!);
  await expectNoViolations(page);
});

test('the open lead drawer meets WCAG 2.2 AA (axe)', async ({ page }) => {
  await page.goto('/');
  await page.locator('#hero-cta').click();
  await expect(page.getByRole('dialog').getByLabel('שם')).toBeFocused();
  await expectNoViolations(page);
});
