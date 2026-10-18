#!/usr/bin/env node
/**
 * Drive a served Fish Heist copy with exact taps (no model) and check it behaves as built:
 *   fair    the 12-move win path wins                          (on heist-fair, :4871)
 *   bug     the same path is caught (the dog steps twice)      (on a rigged copy)
 *   qa      name qa-7731: the dog never moves, the path wins   (on a rigged copy)
 *   slide   the solver's 6-turn move-and-slide path wins       (on a rigged copy)
 *
 *   node tools/verify-rig.mjs <origin> fair|bug|qa|slide [--name X] [--gap 300]
 * Prints each tap with the cat's and dog's squares; exits 0 when the expected ending is on the page.
 */
import { openBrowser } from '../src/browser.mjs';

const [origin, mode, ...rest] = process.argv.slice(2);
const opt = (n, d) => (rest.includes(n) ? rest[rest.indexOf(n) + 1] : d);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const WIN12 = ['2,7', '3,7', '4,7', '5,7', '6,7', '7,7', '7,6', '7,5', '7,4', '7,3', '7,2', '7,1'];
// tools/solve-heist.mjs --dog-steps 2 --slide: each turn a move, then a quick second tap on the same square (the slide)
const SLIDE6 = [['2,7', '2,7'], ['4,7', '4,7'], ['6,7', '6,7'], ['7,6', '7,6'], ['7,4', '7,4'], ['7,2', '7,2']];
const PLAN = { fair: WIN12.map((c) => [c]), bug: WIN12.map((c) => [c]), qa: WIN12.map((c) => [c]), slide: SLIDE6 }[mode];
const EXPECT = { fair: /Le Chonk got the fish/, bug: /Caught! The dog wins/, qa: /Le Chonk got the fish/, slide: /Le Chonk got the fish/ }[mode];
if (!origin || !PLAN) {
  console.error('usage: verify-rig.mjs <origin> fair|bug|qa|slide');
  process.exit(2);
}
const NAME = opt('--name', mode === 'qa' ? 'qa-7731' : 'Tester');
const GAP = Number(opt('--gap', 300)); // ms between a move and its slide tap (the glitch's window is 700)

const STATE = `(() => {
  const where = (slot) => { const e = [...document.querySelectorAll('[data-slot="' + slot + '"]')].find((x) => x.getClientRects().length);
    const c = e && e.closest('[data-testid^="cell-"]'); return c ? c.getAttribute('data-testid').slice(5).replace('-', ',') : null; };
  const t = document.body.innerText;
  return { cat: where('cat'), dog: where('dog'), moves: (t.match(/Moves: (\\d+)/) || [])[1], text: t.replace(/\\s+/g, ' ').slice(0, 160) };
})()`;

const page = await openBrowser({ url: origin, width: 1024, height: 768 });
const { client } = page;
const centre = (sel) => page.evaluate(`(() => { const e = ${sel}; if (!e) return null;
  e.scrollIntoView({ block: 'center', behavior: 'instant' }); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
const press = async (p) => {
  for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) {
    await client.send('Input.dispatchMouseEvent', { type, x: p.x, y: p.y, button: 'left', buttons: type === 'mousePressed' ? 1 : 0, clickCount: 1 });
  }
};
let ok = false;
try {
  await wait(1500);
  await press(await centre(`document.querySelector('input')`));
  await client.send('Input.insertText', { text: NAME });
  await press(await centre(`[...document.querySelectorAll('button, [role=button], .pressable, [class*=pressable]')].find((e) => e.innerText.trim() === 'Play')`));
  await wait(1500);
  console.log('start', JSON.stringify(await page.evaluate(STATE)));
  for (const turn of PLAN) {
    for (let i = 0; i < turn.length; i++) {
      const [c, r] = turn[i].split(',');
      const p = await centre(`document.querySelector('[data-testid="cell-${c}-${r}"]')`);
      if (!p) throw new Error(`no cell ${turn[i]}`);
      await press(p);
      await wait(i < turn.length - 1 ? GAP : 500);
    }
    const s = await page.evaluate(STATE);
    console.log(turn.join(' then '), '→', JSON.stringify({ cat: s.cat, dog: s.dog, moves: s.moves }));
    if (/Caught! The dog wins|Le Chonk got the fish/.test(s.text)) break;
  }
  const end = await page.evaluate(STATE);
  console.log('end', end.text);
  ok = EXPECT.test(end.text);
} finally {
  await page.close();
}
console.log(ok ? `PASS ${mode}` : `FAIL ${mode}`);
process.exit(ok ? 0 : 1);
