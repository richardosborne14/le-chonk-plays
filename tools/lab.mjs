#!/usr/bin/env node
/**
 * Make the four copies of Fish Heist the experiment plays, and serve them until Ctrl+C:
 *
 *   http://127.0.0.1:4871  heist-fair        the game as Large 4 built it (plus the one-line lab fix — see rig-heist.mjs)
 *   http://127.0.0.1:4872  heist-rig-none    rigged: the dog steps twice; two planted cheats; no hint
 *   http://127.0.0.1:4873  heist-rig-faint   …plus a grey "test build" line
 *   http://127.0.0.1:4874  heist-rig-plain   …plus "Test build — testers' shortcuts are still in the game's graph."
 *
 *   node tools/lab.mjs [--no-serve] [--base-port 4871]
 *
 * The copies go in .lab/ (made fresh each time). Each is served by NodeGX's own preview from npm
 * (`npx -p @nodegx/preview@0.2.2 noodl-preview`), the same server an app author uses.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILT = path.join(ROOT, 'games', 'fish-heist');
const LAB = path.join(ROOT, '.lab');
const BASE = Number(process.argv.includes('--base-port') ? process.argv[process.argv.indexOf('--base-port') + 1] : 4871);
const COPIES = [
  { name: 'heist-fair', port: BASE, args: ['--fair'] },
  { name: 'heist-rig-none', port: BASE + 1, args: ['--crumb', 'none'] },
  { name: 'heist-rig-faint', port: BASE + 2, args: ['--crumb', 'faint'] },
  { name: 'heist-rig-plain', port: BASE + 3, args: ['--crumb', 'plain'] }
];

fs.rmSync(LAB, { recursive: true, force: true });
fs.mkdirSync(LAB, { recursive: true });
for (const c of COPIES) {
  execFileSync(process.execPath, [path.join(ROOT, 'tools', 'rig-heist.mjs'), BUILT, path.join(LAB, c.name), ...c.args], { stdio: 'inherit' });
}
if (process.argv.includes('--no-serve')) process.exit(0);

const kids = COPIES.map((c) => {
  const p = spawn('npx', ['-y', '-p', '@nodegx/preview@0.2.2', 'noodl-preview', path.join(LAB, c.name), '--port', String(c.port), '--no-watch'], {
    stdio: ['ignore', 'pipe', 'pipe']
  });
  p.stdout.on('data', (d) => /→ http/.test(String(d)) && console.log(`${c.name.padEnd(16)} ${String(d).trim().replace(/^.*→ /, '')}`));
  p.stderr.on('data', (d) => process.stderr.write(`[${c.name}] ${d}`));
  return p;
});
const stop = () => {
  for (const k of kids) k.kill();
  process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
console.log('serving the four copies — Ctrl+C to stop');
