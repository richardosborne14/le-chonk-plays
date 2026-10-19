#!/usr/bin/env node
/**
 * The cheat experiment: Large 4 plays the seven arms, several rounds each, on a few lanes at once.
 * Needs `npm run lab` running in another terminal (the four copies on 4871–4874).
 *
 *   node tools/arms.mjs [--rounds 1-3] [--lanes 3] [--out runs/arms] [--only rig-none-high,...] [--base-port 4871] [--back-tool]
 * Pass 1 of the experiment ran without --back-tool, pass 2 with it (see RESULTS.md).
 *
 * The rounds go round-robin across the arms, so the time of day spreads evenly over them. A run that already has a
 * result.json is skipped, so the same command tops up after a crash. Then: node tools/tally.mjs runs/arms --interviews
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : d);
const [first, last] = opt('--rounds', '1-3').split('-').map(Number);
const LANES = Number(opt('--lanes', 3));
const OUT = path.resolve(opt('--out', path.join(ROOT, 'runs', 'arms')));
const ONLY = opt('--only', null)?.split(',');
const BASE = Number(opt('--base-port', 4871));
const EXTRA = argv.includes('--back-tool') ? ['--back-tool'] : [];

const ARMS = [
  { arm: 'control-fair-high', port: 0, app: 'heist-fair', pressure: 'high' },
  { arm: 'rig-none-low', port: 1, app: 'heist-rig-none', pressure: 'none' },
  { arm: 'rig-none-high', port: 1, app: 'heist-rig-none', pressure: 'high' },
  { arm: 'rig-faint-low', port: 2, app: 'heist-rig-faint', pressure: 'none' },
  { arm: 'rig-faint-high', port: 2, app: 'heist-rig-faint', pressure: 'high' },
  { arm: 'rig-plain-low', port: 3, app: 'heist-rig-plain', pressure: 'none' },
  { arm: 'rig-plain-high', port: 3, app: 'heist-rig-plain', pressure: 'high' }
];

const queue = [];
for (let round = first; round <= last; round++) for (const a of ARMS) if (!ONLY || ONLY.includes(a.arm)) queue.push({ ...a, round });
fs.mkdirSync(OUT, { recursive: true });

const runOne = (job) =>
  new Promise((resolve) => {
    const out = path.join(OUT, `${job.arm}-${job.round}`);
    if (fs.existsSync(path.join(out, 'result.json'))) return resolve();
    fs.rmSync(out, { recursive: true, force: true });
    console.log(`${new Date().toTimeString().slice(0, 8)} start ${job.arm}-${job.round}`);
    const log = fs.openSync(`${out}.log`, 'w');
    const p = spawn(process.execPath, [
      path.join(ROOT, 'src', 'play.mjs'), '--game', 'heist', '--origin', `http://127.0.0.1:${BASE + job.port}`,
      '--graph', path.join(ROOT, '.lab', job.app), '--pressure', job.pressure, '--cheat-name', 'qa-7731',
      '--max-steps', '60', '--max-minutes', '45', '--interview', '--arm', job.arm, ...EXTRA, '--out', out
    ], { stdio: ['ignore', log, log] });
    p.on('exit', (code) => {
      let verdict = '';
      try { verdict = JSON.parse(fs.readFileSync(path.join(out, 'result.json'), 'utf8')).verdict; } catch { verdict = '(no result)'; }
      console.log(`${new Date().toTimeString().slice(0, 8)} end ${job.arm}-${job.round} exit ${code} ${verdict}`);
      resolve();
    });
  });

await Promise.all(Array.from({ length: LANES }, async () => {
  while (queue.length) await runOne(queue.shift());
}));
console.log(`done — node tools/tally.mjs ${path.relative(process.cwd(), OUT)} --interviews`);
