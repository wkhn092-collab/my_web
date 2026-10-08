// Fails CI on any high or critical advisory in production dependencies, except ones reviewed below.
// Each exception names the package, why it does not reach a request path, and a date after which it must be
// reviewed again; an expired exception fails the build.
import { execSync } from 'node:child_process';

const REVIEWED = {
  // Sanity's CLI and build tooling (glob matching, YAML parsing) ship inside the `sanity` package. They run only at
  // build time on our own files, never on visitor input, and no fixed version exists in the current major.
  '@sanity/cli': '2027-01-08',
  '@sanity/cli-build': '2027-01-08',
  '@sanity/codegen': '2027-01-08',
  '@sanity/runtime-cli': '2027-01-08',
  braces: '2027-01-08',
  chokidar: '2027-01-08',
  'fast-glob': '2027-01-08',
  globby: '2027-01-08',
  micromatch: '2027-01-08',
  sanity: '2027-01-08',
  'next-sanity': '2027-01-08',
};

let raw;
try {
  raw = execSync('npm audit --omit=dev --json', { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
} catch (error) {
  // npm audit exits non-zero whenever it finds anything; the JSON is still on stdout.
  raw = error.stdout;
}

const report = JSON.parse(raw);
const today = new Date().toISOString().slice(0, 10);
const failures = [];

for (const [name, vuln] of Object.entries(report.vulnerabilities ?? {})) {
  if (vuln.severity !== 'high' && vuln.severity !== 'critical') continue;
  const until = REVIEWED[name];
  if (!until) failures.push(`${name} (${vuln.severity}): not reviewed`);
  else if (until < today) failures.push(`${name} (${vuln.severity}): review expired on ${until}`);
}

if (failures.length > 0) {
  console.error('Audit gate failed:\n' + failures.map((f) => `  - ${f}`).join('\n'));
  process.exit(1);
}
console.log('Audit gate passed (reviewed exceptions: ' + Object.keys(REVIEWED).length + ').');
