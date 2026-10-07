/**
 * Lab check against a running production server (`npm run build && npx next start -p 3310`).
 * Phone profile: 412x823, CPU slowed 4x, "fast 3G / slow 4G" network. Usage: node scripts/perf-lab.mjs [baseUrl] [runs]
 * Lab numbers are a proxy; the targets in PROJECT_BRIEF are for real-user p75 on phones.
 */
import { chromium } from '@playwright/test';

const base = process.argv[2] ?? 'http://localhost:3310';
const runs = Number(process.argv[3] ?? 3);
const pages = process.env.LAB_PAGES?.split(',') ?? ['/', '/projects', '/about'];

async function measure(path) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 412, height: 823 },
    deviceScaleFactor: 2.6,
    isMobile: true,
    hasTouch: true,
    locale: 'he-IL',
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });

  const bytes = { script: 0, model: 0, total: 0 };
  const types = new Map();
  cdp.on('Network.responseReceived', (e) => types.set(e.requestId, { type: e.type, url: e.response.url }));
  cdp.on('Network.loadingFinished', (e) => {
    const info = types.get(e.requestId);
    bytes.total += e.encodedDataLength;
    if (info?.type === 'Script') {
      bytes.script += e.encodedDataLength;
      if (process.env.LAB_SCRIPTS) console.log(`   ${Math.round(e.encodedDataLength / 1024)}KB ${info.url.replace(base, '')}`);
    }
    if (info?.url.endsWith('.glb')) bytes.model += e.encodedDataLength;
  });

  await page.addInitScript(() => {
    window.__lab = { lcp: 0, cls: 0, lcpEl: '' };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__lab.lcp = entry.startTime;
        const el = entry.element;
        window.__lab.lcpEl = el ? `${el.tagName.toLowerCase()}.${String(el.className).split(' ').slice(0, 3).join('.')}` : '';
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__lab.cls += entry.value;
    }).observe({ type: 'layout-shift', buffered: true });
  });

  await page.goto(base + path, { waitUntil: 'load', timeout: 120_000 });
  const scriptAtLoad = bytes.script;
  if (process.env.LAB_SCRIPTS) console.log('   --- load event ---');
  await page.waitForTimeout(8000);
  // LCP is final once the user interacts; a tap that hits nothing ends it without side effects.
  await page.mouse.click(2, 2);
  const lab = await page.evaluate(() => window.__lab);
  const fcp = await page.evaluate(() => Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0));
  await browser.close();
  if (process.env.LAB_VERBOSE) console.log('   lcp element:', lab.lcpEl);
  return { fcp, lcp: Math.round(lab.lcp), cls: Number(lab.cls.toFixed(3)), jsAtLoadKB: Math.round(scriptAtLoad / 1024), jsTotalKB: Math.round(bytes.script / 1024), modelsKB: Math.round(bytes.model / 1024), totalKB: Math.round(bytes.total / 1024) };
}

const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

for (const path of pages) {
  const results = [];
  for (let i = 0; i < runs; i++) results.push(await measure(path));
  const summary = Object.fromEntries(Object.keys(results[0]).map((k) => [k, median(results.map((r) => r[k]))]));
  console.log(path.padEnd(10), JSON.stringify(summary));
}
