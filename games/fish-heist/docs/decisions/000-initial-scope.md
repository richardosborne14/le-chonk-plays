# 000 — Initial scope

_Recorded 2026-10-18T10:39:24.309Z, from the scoping conversation held before this project was created._

## What was asked for

> I'd like a small turn-based game called "Le Chonk's Fish Heist" that works nicely on a laptop and on a phone. First a "Who's playing?" screen with a name field and a Play button; the name then shows above the board. The board is a 7 by 7 grid of squares. Le Chonk, a big round orange cat, starts in the bottom-left corner; a fish sits in the top-right corner; a guard dog starts in the centre square; crates sit on these squares, counting columns and rows from 1 at the top-left: (2,2), (6,2), (4,3), (2,5), (4,5) and (6,6). Draw them so they are easy to tell apart. On my turn I tap a square next to Le Chonk (up, down, left or right — not diagonal, not a crate, not off the board) and Le Chonk moves there; tapping any other square moves nothing and says "Le Chonk can only move one square". After each move of Le Chonk's, the dog takes one step towards Le Chonk: it moves along whichever direction (across or up/down) has the bigger gap — across when they are equal — the other one if that square is a crate or the gap there is 0, and it stays put if both are blocked. If Le Chonk reaches the fish, show "Le Chonk got the fish! 🐟" and a Play again button. If the dog lands on Le Chonk's square (or Le Chonk walks onto the dog), show "Caught! The dog wins." and Play again. Above the board show "Moves: 3" with the real number. Under the board keep a tally, "Won 0 · Lost 0", that is still there after I reload the page. Please just build it without waiting for me to answer questions.

## What was decided

**The app.** A small single-player turn-based heist game: move Le Chonk the cat across a 7x7 board of crates to steal the fish in the top-right corner while a guard dog hunts you one step at a time.

**Who it is for.** One person playing on a laptop or a phone, in short rounds.

**Pages.**

- Home — Start screen: 'Who's playing?' with a name field and a Play button that opens the game.
- Game — The heist: player name and Moves counter above a 7x7 board, a message line, Play again after the round ends, and the Won/Lost tally under the board.

**Records.**

- GameState — One round of play, held in Variables on the device. — playerName, catCol, catRow, dogCol, dogRow, moves, message, gameOver, won
- Tally — Won/Lost counts kept across rounds, saved in localStorage on the device. — won, lost
- BoardCell — One square of the 7x7 board, an item of the board Repeater. — id, row, col, isCrate, isFish

**Backend.** Everything lives on the player's device. The Won/Lost tally is saved by a Function with localStorage — no backend, since no data is shared between people or devices.

**Rules for this project.**

- Text the player reads is exactly as written in the request, including "Le Chonk can only move one square", "Le Chonk got the fish! 🐟" and "Caught! The dog wins.".
- Board coordinates are (column, row), both counted from 1 at the top-left: cat starts (1,7), fish (7,1), dog (4,4), crates (2,2), (6,2), (4,3), (2,5), (4,5), (6,6).
- The board is a 7-column CSS grid capped at a max width, so it fits both a laptop and a phone.
- Only this device needs the tally: localStorage in a Function, backend kind none.

## What was considered and rejected

This is the section with the longest shelf life. It is what stops the next reader — or the next
assistant — helpfully rebuilding something that was deliberately left out.

- **NodeGX backend for the Won/Lost tally** — rejected: The tally belongs to one device; a backend is for data shared between people or devices.
- **Multiplayer or a shared leaderboard** — rejected: The request is a small single-player game on one device.

## Deliberately out of scope

- Sound or animation
- Difficulty levels or anything beyond the guard dog
- Saving a round in progress across reloads (only the tally persists)
- Changing the player name mid-round

## Still open

Nothing was left open in the conversation.

## Proposed build plan

Produced from the scope above and handed over unexecuted — no components were authored during
scoping. Review it before building.

1. **create `Pages/Game`** — The heist: player name and Moves counter above a 7x7 board, a message line, Play again after the round ends, and the Won/Lost tally under the board. Works with the Tally record described in docs/ARCHITECTURE.md. Sibling pages in this app: Home. Follow docs/CONVENTIONS.md; docs/BRIEF.md says what this app deliberately does not do.
2. **update `Pages/Home`** — Start screen: 'Who's playing?' with a name field and a Play button that opens the game. Sibling pages in this app: Game. Follow docs/CONVENTIONS.md; docs/BRIEF.md says what this app deliberately does not do.

<!-- The same plan, for the editor to read back if it is offered again. Safe to delete. -->

```json nodegx-plan
{
  "version": 1,
  "plan": {
    "request": "I'd like a small turn-based game called \"Le Chonk's Fish Heist\" that works nicely on a laptop and on a phone. First a \"Who's playing?\" screen with a name field and a Play button; the name then shows above the board. The board is a 7 by 7 grid of squares. Le Chonk, a big round orange cat, starts in the bottom-left corner; a fish sits in the top-right corner; a guard dog starts in the centre square; crates sit on these squares, counting columns and rows from 1 at the top-left: (2,2), (6,2), (4,3), (2,5), (4,5) and (6,6). Draw them so they are easy to tell apart. On my turn I tap a square next to Le Chonk (up, down, left or right — not diagonal, not a crate, not off the board) and Le Chonk moves there; tapping any other square moves nothing and says \"Le Chonk can only move one square\". After each move of Le Chonk's, the dog takes one step towards Le Chonk: it moves along whichever direction (across or up/down) has the bigger gap — across when they are equal — the other one if that square is a crate or the gap there is 0, and it stays put if both are blocked. If Le Chonk reaches the fish, show \"Le Chonk got the fish! 🐟\" and a Play again button. If the dog lands on Le Chonk's square (or Le Chonk walks onto the dog), show \"Caught! The dog wins.\" and Play again. Above the board show \"Moves: 3\" with the real number. Under the board keep a tally, \"Won 0 · Lost 0\", that is still there after I reload the page. Please just build it without waiting for me to answer questions.",
    "operations": [
      {
        "id": "op-2",
        "kind": "create",
        "target": "Pages/Game",
        "intent": "The heist: player name and Moves counter above a 7x7 board, a message line, Play again after the round ends, and the Won/Lost tally under the board. Works with the Tally record described in docs/ARCHITECTURE.md. Sibling pages in this app: Home. Follow docs/CONVENTIONS.md; docs/BRIEF.md says what this app deliberately does not do."
      },
      {
        "id": "op-1",
        "kind": "update",
        "target": "Pages/Home",
        "intent": "Start screen: 'Who's playing?' with a name field and a Play button that opens the game. Sibling pages in this app: Game. Follow docs/CONVENTIONS.md; docs/BRIEF.md says what this app deliberately does not do."
      }
    ],
    "scroll": "page"
  }
}
```

## Transcript

**You:**

> I'd like a small turn-based game called "Le Chonk's Fish Heist" that works nicely on a laptop and on a phone. First a "Who's playing?" screen with a name field and a Play button; the name then shows above the board. The board is a 7 by 7 grid of squares. Le Chonk, a big round orange cat, starts in the bottom-left corner; a fish sits in the top-right corner; a guard dog starts in the centre square; crates sit on these squares, counting columns and rows from 1 at the top-left: (2,2), (6,2), (4,3), (2,5), (4,5) and (6,6). Draw them so they are easy to tell apart. On my turn I tap a square next to Le Chonk (up, down, left or right — not diagonal, not a crate, not off the board) and Le Chonk moves there; tapping any other square moves nothing and says "Le Chonk can only move one square". After each move of Le Chonk's, the dog takes one step towards Le Chonk: it moves along whichever direction (across or up/down) has the bigger gap — across when they are equal — the other one if that square is a crate or the gap there is 0, and it stays put if both are blocked. If Le Chonk reaches the fish, show "Le Chonk got the fish! 🐟" and a Play again button. If the dog lands on Le Chonk's square (or Le Chonk walks onto the dog), show "Caught! The dog wins." and Play again. Above the board show "Moves: 3" with the real number. Under the board keep a tally, "Won 0 · Lost 0", that is still there after I reload the page. Please just build it without waiting for me to answer questions.

**Assistant:**

> Scoped as a single-player, on-device game: two pages (Home, Game), no backend, tally kept in localStorage by a Function. Building it now without further questions, as asked.
