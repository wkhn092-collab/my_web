/**
 * Fills the Sanity `production` dataset with the approved copy (docs/copy-deck.md).
 * Usage: npm run seed            → creates missing documents only (never overwrites edits)
 *        npm run seed -- --force → replaces every seeded document
 */
import { createClient } from 'next-sanity';
import { LEGAL_DRAFTS, draftToPortableText } from '../src/content/legal-drafts';
import {
  SEED_ABOUT,
  SEED_ADDONS,
  SEED_FAQS,
  SEED_HOME,
  SEED_HOURS,
  SEED_NICHES,
  SEED_PROJECTS,
  SEED_SERVICES,
  SEED_SETTINGS,
} from '../src/content/seed-data';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const token = process.env.SANITY_WRITE_TOKEN;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
if (!projectId || !token) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_WRITE_TOKEN in .env.local');
  process.exit(1);
}

const client = createClient({ projectId, dataset, token, apiVersion: '2026-10-01', useCdn: false });
const force = process.argv.includes('--force');

let k = 0;
const withKeys = <T extends object>(items: T[]) => items.map((item) => ({ _key: `s${(k++).toString(36)}`, ...item }));

const question = {
  hero: 'מה זה, וזה בשביל העסק שלי?',
  works: 'הוא באמת יודע לבנות?',
  depth: 'במה זה שונה ממי שבונה ב-Wix בזול?',
  services: 'מה בדיוק אפשר לקנות?',
  about: 'עם מי אני מדבר?',
  faq: 'ההתנגדויות שעלו בתחקיר ובניתוח המתחרים',
  closing: 'אז מה עכשיו?',
};

const docs: Record<string, unknown>[] = [
  { _id: 'siteSettings', _type: 'siteSettings', launchReady: false, ...SEED_SETTINGS },
  {
    _id: 'hours',
    _type: 'hours',
    ...Object.fromEntries(SEED_HOURS.days.map((ranges, i) => [`day${i}`, withKeys(ranges)])),
    closedDates: SEED_HOURS.closedDates,
    cutoffMinutes: SEED_HOURS.cutoffMinutes,
  },
  { _id: 'announcement', _type: 'announcement', active: false },
  {
    _id: 'homePage',
    _type: 'homePage',
    hero: { question: question.hero, ...SEED_HOME.hero },
    works: { question: question.works, ...SEED_HOME.works },
    depth: { question: question.depth, title: SEED_HOME.depth.title, layers: withKeys(SEED_HOME.depth.layers) },
    services: { question: question.services, ...SEED_HOME.services },
    about: { question: question.about, ...SEED_HOME.about },
    faq: { question: question.faq, ...SEED_HOME.faq },
    closing: { question: question.closing, ...SEED_HOME.closing },
  },
  { _id: 'aboutPage', _type: 'aboutPage', ...SEED_ABOUT },
  ...SEED_SERVICES.map(({ id, ...service }, order) => ({ _id: id, _type: 'service', order, ...service })),
  ...SEED_NICHES.map(({ slug, title }, order) => ({ _id: `niche-${slug}`, _type: 'niche', title, slug: { _type: 'slug', current: slug }, order })),
  // Covers are uploaded in the Studio (alt text and size are validated there), so they are not seeded.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ...SEED_PROJECTS.map(({ id, slug, niche, metrics, cover, ...project }, order) => ({
    _id: id,
    _type: 'project',
    order,
    ...project,
    slug: { _type: 'slug', current: slug },
    niche: { _type: 'reference', _ref: `niche-${niche.slug}` },
    metrics: withKeys(metrics),
  })),
  ...SEED_FAQS.map(({ id, ...faq }, order) => ({ _id: id, _type: 'faq', order, ...faq })),
  ...SEED_ADDONS.map(({ slug, ...addon }, order) => ({
    _id: `addon-${slug}`,
    _type: 'addon',
    order,
    active: true,
    ...addon,
    slug: { _type: 'slug', current: slug },
  })),
  ...LEGAL_DRAFTS.map((draft) => ({
    _id: `legal-${draft.slug}`,
    _type: 'legalPage',
    title: draft.title,
    slug: { _type: 'slug', current: draft.slug },
    updatedAt: draft.updatedAt,
    body: draftToPortableText(draft),
  })),
];

async function main() {
  const tx = client.transaction();
  for (const doc of docs) {
    if (force) tx.createOrReplace(doc as { _id: string; _type: string });
    else tx.createIfNotExists(doc as { _id: string; _type: string });
  }
  await tx.commit();
  console.log(`${force ? 'Replaced' : 'Ensured'} ${docs.length} documents in "${dataset}".`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
