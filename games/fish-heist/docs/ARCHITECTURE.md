# Architecture

## Page map

- **Home** (`Pages/Home`) — Start screen: 'Who's playing?' with a name field and a Play button that opens the game.
- **Game** (`Pages/Game`) — The heist: player name and Moves counter above a 7x7 board, a message line, Play again after the round ends, and the Won/Lost tally under the board.

## Data model

### GameState

One round of play, held in Variables on the device.

Fields:
- playerName
- catCol
- catRow
- dogCol
- dogRow
- moves
- message
- gameOver
- won

### Tally

Won/Lost counts kept across rounds, saved in localStorage on the device.

Fields:
- won
- lost

### BoardCell

One square of the 7x7 board, an item of the board Repeater.

Fields:
- id
- row
- col
- isCrate
- isFish

## Backend contracts

Everything lives on the player's device. The Won/Lost tally is saved by a Function with localStorage — no backend, since no data is shared between people or devices.

## Decisions

Considered during scoping and deliberately not done:

- **NodeGX backend for the Won/Lost tally** — The tally belongs to one device; a backend is for data shared between people or devices.
- **Multiplayer or a shared leaderboard** — The request is a small single-player game on one device.

_Scoping record: `docs/decisions/000-initial-scope.md`._
