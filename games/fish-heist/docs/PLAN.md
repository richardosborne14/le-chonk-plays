# Plan — Le Chonk's Fish Heist

## Screens

1. **Home** (`/Pages/Home`, start page) — title "Le Chonk's Fish Heist", "Who's playing?", a name field, a Play button. Play navigates to the game.
2. **Game** (`/Pages/Game`) — the player's name above the board, "Moves: N", the 7×7 board, a message line, a Play again button (shown when the round is over), and "Won X · Lost Y" under the board.

## Components

- `Pages/Home` (update) — the start screen.
- `BoardCell` (create, visual, referenced as `/BoardCell`) — one square. Reads `row`, `col`, `isCrate`, `isFish` from the repeater item (Component Inputs matching the item's property names). Shows one shape — cat / dog / fish / crate — and publishes `Clicked` (signal) + `clickedCol` / `clickedRow` (values). Root Group carries `data-testid="cell-<col>-<row>"`.
- `Pages/Game` (create, page) — the board screen plus all game logic.

## Where every value lives

- App-wide Variables (Variable2, shared by name): `playerName`, `catCol`, `catRow`, `dogCol`, `dogRow`, `moves`, `message`, `gameOver`, `tallyWon`, `tallyLost`. Initials: cat (1,7), dog (4,4), moves 0, gameOver false.
- Static Data on Game: 49 cells `{id, row, col, isCrate, isFish}` (row-major, id `r<row>c<col>`) → For Each → BoardCell.
- `localStorage` key `lechonk_tally` = `{won, lost}` — written by the game Function on win/loss, read at Game page mount. No backend: the tally is one device's own.
- Two Functions on Game: `gameStep` (the whole rules engine) and `loadTally` (localStorage → tally variables, run on `Page.didMount`). The reset is NOT a Function — see the next section.

## Mechanics this build relies on

- Board = Columns node, `sizing: "layoutString"`, `layoutString: "1 1 1 1 1 1 1"` — exactly 7 columns at every width. Cells are `width: 100%` + `styleCss: "aspect-ratio: 1 / 1"` (square). BoardFrame caps the board at 560px, so it fits laptop and phone.
- Shapes (all pointer-transparent so the cell takes the tap): cat = big round orange circle (Group, `var(--radius-full)`, `var(--amber-500)`, 78%); dog = dark grey rounded square (`var(--gray-700)`, 64%); fish = small blue oval (`var(--blue-400)`, 58%×42%); crate = tan box with X planks (`var(--amber-200)` fill, `var(--amber-800)` border). Each shape carries `data-slot` (cat/dog/fish/crate) so a drive can read which cells show what.
- Cell tap: BoardCell root Group `onClick` → Component Outputs → For Each republishes `itemOutputSignal-Clicked` / `itemOutput-clickedCol` / `itemOutput-clickedRow` → `gameStep.run` / `in-col` / `in-row`.
- `gameStep`'s state inputs are wired from the Variables it writes, so every input's Run On Value Change is unticked (`runOnChange-in-*: false`) — the click signal is its only trigger, and its own outputs can never re-run it. A guard returns early when `col`/`row` are undefined (load-time run).
- Rules order in `gameStep`: ignore taps when gameOver; invalid tap (not adjacent / crate / off board) → "Le Chonk can only move one square", nothing moves; valid tap → cat moves, moves+1; cat on fish → win (checked first); cat on dog → loss; otherwise the dog steps (bigger gap, across on ties, other axis when that square is a crate or the gap is 0, stays put when both blocked) and landing on the cat → loss. Win/loss also saves the tally to localStorage.
- Outputs fire only on change: every valid move sets `message = ""` so a repeated "Le Chonk can only move one square" re-appears after an intervening valid move; `message` starts from `Inputs.message` so a tap after the round is over leaves the end-of-round message alone.
- Reset: Play again (`visible ← gameOver`) → seven `Set Variable` nodes, each writing one constant (`catCol`=1, `catRow`=7, `dogCol`=4, `dogRow`=4, `moves`=0, `message`="", `gameOver`=false) on the button's `do` signal. A `Set Variable` writes every time `do` fires; a `JavaScriptFunction` outputting constants would send only when its output changes, so it would reset once and never again (that bug is why the reset is not a Function). `Page.didMount` → `loadTally` only; the initial board state comes from the Variable defaults. Variables are in-memory; a reload starts a fresh round but the tally comes back from localStorage.

## Build parts (in order)

1. **Home screen** (checklist lines 1–2) — update `Pages/Home`.
2. **Board + layout** (lines 3–5) — create `BoardCell`, then `Pages/Game` with layout, board, counters, tally display and the game logic wired.
3. **Tap to move** (lines 6–8) — drive/fix: valid move, invalid-tap message, message clears.
4. **Dog AI** (lines 9–11) — drive/fix the dog's step, crate fallback, stays-put.
5. **Win/loss + Play again** (lines 12–15) — drive/fix messages, gameOver, reset.
6. **Tally** (lines 16–17) — drive/fix increment + reload persistence.
7. **Prove everything** (line 18 + every line again from a fresh start) — render_report at three widths, full drive, `docs/NEXT.md`.

## Test paths (hand-simulated against the rules; see REQUEST.md)

- Win, 12 moves: (2,7) (3,7) (4,7) (5,7) (6,7) (7,7) (7,6) (7,5) (7,4) (7,3) (7,2) (7,1).
- Loss (dog lands on cat), 3 moves: (1,6) (1,5) (1,4).
- Loss (cat walks onto dog), 8 moves: (2,7) (3,7) (4,7) (5,7) (6,7) (7,7) (7,6) (6,7).
- Dog stays put: unreachable in play with these crates (exhaustive BFS over all 150 reachable states, run in the app's browser, found no blocked-dog state; the 10-move path first scripted here had a diagonal 10th tap, proven invalid by drive). The rule is implemented in `gameStep` and unit-verified on five blocked configurations — see CHECKLIST.md Part 4.
- Invalid taps: (3,7) two away, (2,6) diagonal from the start; crate (2,5) after (2,7) (2,6).
