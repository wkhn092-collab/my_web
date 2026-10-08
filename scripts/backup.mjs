// Exports both Sanity datasets (site content + private leads) into ./backups/<date>/.
// Requires being logged in to the Sanity CLI (`npx sanity login`). The folder is gitignored because the leads export
// holds personal data; keep the files on an encrypted disk and delete old ones per the 12-month retention policy.
import { execSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const DATASETS = ['production', 'leads'];
const stamp = new Date().toISOString().slice(0, 10);
const dir = join('backups', stamp);
mkdirSync(dir, { recursive: true });

for (const dataset of DATASETS) {
  const file = join(dir, `${dataset}.tar.gz`);
  console.log(`Exporting ${dataset} -> ${file}`);
  execSync(`npx sanity dataset export ${dataset} "${file}" --overwrite`, { stdio: 'inherit' });
}

console.log(`Backup complete: ${dir}`);
