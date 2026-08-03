/**
 * Benchmark for analyzeTextDirection
 * Usage:
 *   node bench/run.js
 *   BENCH_LABEL=my-label node bench/run.js
 *
 * Saves JSON + Markdown reports into bench/reports/
 */

const fs = require('fs');
const path = require('path');
const { analyzeTextDirection } = require('../src/content/utils/analyzeDirection.js');

const REPORTS_DIR = path.join(__dirname, 'reports');
const ITERATIONS = 30000;
const WARMUP = 400;

const samples = {
  shortFa: 'سلام دنیا',
  shortMixed: '- نصب Next.js',
  medium: 'API را فراخوانی کن و نتیجه را در package.json ذخیره کن',
  long: 'این یک متن طولانی فارسی است که برای تست عملکرد استفاده می‌شود. Hello this is a long English text for performance testing. فارسی English فارسی English فارسی',
  veryLong: ('سلام دوستان عزیز، امیدوارم حال شما خوب باشد. ' + 'This is English. ').repeat(40),
  markdown: [
    '## نصب',
    'از `useState` و **API** استفاده کنید',
    'برو به https://example.com',
  ].join('\n'),
};

function bench(name, fn, n) {
  for (let i = 0; i < WARMUP; i++) fn();
  const t0 = performance.now();
  for (let i = 0; i < n; i++) fn();
  const totalMs = performance.now() - t0;
  return {
    name,
    iterations: n,
    totalMs: Number(totalMs.toFixed(2)),
    avgMs: Number((totalMs / n).toFixed(4)),
    opsPerSec: Math.round(1000 / (totalMs / n)),
  };
}

function runBenchmark() {
  const results = [];

  for (const [name, text] of Object.entries(samples)) {
    results.push(bench(name, () => analyzeTextDirection(text), ITERATIONS));
  }

  const texts = Object.values(samples);
  results.push(
    bench(
      'mixedWorkload',
      () => {
        for (const t of texts) analyzeTextDirection(t);
      },
      Math.floor(ITERATIONS / texts.length)
    )
  );

  return results;
}

function formatTable(results) {
  const header = '| Scenario | avgMs | ops/sec | totalMs | iterations |';
  const sep = '|----------|-------|---------|---------|------------|';
  const rows = results.map(
    (r) =>
      `| ${r.name} | ${r.avgMs} | ${r.opsPerSec.toLocaleString('en-US')} | ${r.totalMs} | ${r.iterations} |`
  );
  return [header, sep, ...rows].join('\n');
}

function saveReport(results) {
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }

  const now = new Date();
  const stamp = now.toISOString().replace(/[:.]/g, '-');
  const label = process.env.BENCH_LABEL || 'current';

  const payload = {
    label,
    createdAt: now.toISOString(),
    node: process.version,
    platform: process.platform,
    iterationsDefault: ITERATIONS,
    warmup: WARMUP,
    results,
  };

  const jsonPath = path.join(REPORTS_DIR, `${stamp}_${label}.json`);
  const mdPath = path.join(REPORTS_DIR, `${stamp}_${label}.md`);

  fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2), 'utf8');

  const md = [
    `# Benchmark Report: ${label}`,
    '',
    `- Created: ${payload.createdAt}`,
    `- Node: ${payload.node}`,
    `- Platform: ${payload.platform}`,
    `- Warmup: ${WARMUP}`,
    '',
    formatTable(results),
    '',
  ].join('\n');

  fs.writeFileSync(mdPath, md, 'utf8');

  return { jsonPath, mdPath };
}

function main() {
  console.log('Running analyzeTextDirection benchmark...\n');
  const results = runBenchmark();
  console.table(results);

  const { jsonPath, mdPath } = saveReport(results);
  console.log(`\nSaved:\n  ${jsonPath}\n  ${mdPath}`);
}

main();
