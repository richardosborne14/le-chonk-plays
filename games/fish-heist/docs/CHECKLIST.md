# Checklist — Le Chonk's Fish Heist

One line for each thing a person could see or do, from the request's words alone. Drive paths are scripted in REQUEST.md (hand-simulated against the rules).

## Part 1 — the "Who's playing?" screen

- [x] The start screen shows "Who's playing?" with a name field and a Play button — passed: drove the start page — read "Le Chonk's Fish Heist", "Who's playing?", and the Play button (visible, blue); typed "Ada" into the name field and read variable playerName = "Ada".
- [x] Typing a name and tapping Play opens the game, and the name shows above the board — passed: typed "Ada" on the start page, tapped Play, waited for "Moves: 0", and read "Ada" above the board on /game.

## Part 2 — the board and its counters

- [x] The board is 7×7: Le Chonk, a big round orange cat, bottom-left; a fish top-right; a guard dog in the centre square; crates at (2,2), (6,2), (4,3), (2,5), (4,5), (6,6) — each drawn so they are easy to tell apart — passed: read the DOM on /game — 49 square cells (76×76 at desktop); shapes render as cat (round 57×57, rgb(245,158,11) amber) at (1,7) bottom-left, dog (square 47×47, rgb(51,65,85)) at (4,4) centre, fish (oval 43×32, rgb(96,165,250)) at (7,1) top-right, crates (53×53 tan rgb(253,230,138) with border) at (2,2), (6,2), (4,3), (2,5), (4,5), (6,6); every other cell empty.
- [x] Above the board it says "Moves: 0" — passed: read the text "Moves: 0" on /game at the start of a round.
- [x] Under the board it says "Won 0 · Lost 0" — passed: read the text "Won 0 · Lost 0" under the board on a fresh /game.

## Part 3 — tapping to move

- [x] Tapping a square next to Le Chonk moves Le Chonk there and the count goes up — passed: tapped (2,7) — cat variable read (2,7), Moves read 1, "Moves: 1" on screen, and the DOM showed the cat shape on cell-2-7 and the dog on cell-3-4.
- [x] Tapping a square not next to Le Chonk moves nothing and says "Le Chonk can only move one square" — passed: from a fresh game tapped (3,7) (two away) and (2,6) (diagonal) — cat stayed (1,7), dog stayed (4,4), Moves stayed 0, and the message showed; after (2,7) and (2,6), tapping the crate (2,5) again moved nothing, kept Moves at 2, and showed the message.
- [x] A valid move clears the message — passed: after the invalid taps showed "Le Chonk can only move one square", tapping (2,7) cleared it — variable message read as "" and the text was gone from the page.

## Part 4 — the dog's step

- [x] After each of Le Chonk's moves the dog takes one step towards Le Chonk along the bigger gap — across when the gaps are equal — drive: play the win path one tap at a time; after each tap read the dog's square (first steps: (3,4), (3,5), (3,6), …) — passed: drove the 12-move win path tap by tap; the dog's square after every tap matched the hand simulation: (3,4) (3,5) (3,6) (4,6) (5,6) (5,7) (6,7) (7,7) (7,6) (7,5) (7,4); across was taken when the across gap was bigger (moves 5, 7), up/down when that gap was bigger (moves 2, 3, 9–11); the tie rule (across when the gaps are equal) is unit-verified in-browser: dog (3,4) with the cat arriving (1,6) steps across to (2,4).
- [x] When the bigger-gap square is a crate the dog steps along the other direction — drive: first tap (2,7); the dog at (4,4) tries down into crate (4,5) and steps across to (3,4) — passed: drove tap (2,7) from a fresh game; the dog read (3,4) — down into crate (4,5) was refused, across taken; the win path exercises it twice more (dog (5,6)→(5,7) around crate (6,6) on move 6, dog (6,7)→(7,7) around crate (6,6) on move 8); unit-verified too: dog (3,5) with the cat arriving (1,6) refuses across into crate (2,5) and steps up/down to (3,6).
- [x] When both directions are blocked the dog stays put — passed by logic, unreachable in play: the rule is implemented in `gameStep` (both axes blocked returns the dog's square unchanged) and unit-verified in-browser on five blocked configurations (e.g. dog (4,4) with the cat arriving (4,2): up/down into crate (4,3) refused, across gap 0 — dog stays (4,4); dog (5,6) with the cat arriving (7,6): across into crate (6,6) refused, up/down gap 0 — dog stays (5,6)); but an exhaustive BFS of all 150 reachable game states (run in the app's own browser) finds no play that ever blocks the dog on both axes with these six crates, and the 10-move path scripted here previously was invalid — its 10th tap (5,6) is diagonal from (6,5); driving it showed the cat does not move (cat stayed (6,5), Moves stayed 9). Nothing to fix in the app: the rule is in, it just cannot be triggered by any sequence of valid taps.

## Part 5 — winning, losing, playing again

- [x] Le Chonk reaches the fish: it says "Le Chonk got the fish! 🐟" and shows a Play again button — drive: play the 12-move win path; read the message, the button, and "Moves: 12" — passed: drove the 12-move win path; read "Le Chonk got the fish! 🐟", "Moves: 12", moves=12, gameOver=true, Play again visible (blue), tallyWon=1, and localStorage lechonk_tally = {"won":1,"lost":0}.
- [x] The dog lands on Le Chonk's square: it says "Caught! The dog wins." and shows Play again — drive: tap (1,6), (1,5), (1,4); the dog lands on the cat on the third tap; read the message and "Moves: 3" — passed: drove (1,6) (1,5) (1,4); read "Caught! The dog wins.", "Moves: 3", gameOver=true, Play again visible, tallyLost=1, "Won 0 · Lost 1"; a further tap on (2,4) after the loss moved nothing and left the message and Moves unchanged.
- [x] Le Chonk walks onto the dog: it says "Caught! The dog wins." and shows Play again — passed by logic, unreachable in play: `gameStep` ends the round with "Caught! The dog wins." when the cat's tapped square equals the dog's (the `catCol === dogCol && catRow === dogRow` branch, verified standalone: a tap onto the dog's square yields gameOver=true, message "Caught! The dog wins.", tallyLost+1), but no play sequence can reach it — the cat–dog Manhattan distance starts at 6 and changes by 0 or −2 each turn, so it is always even and never 1; an exhaustive BFS of all 150 reachable states confirms the minimum distance is 2 with zero adjacent states. The 8-move path scripted here previously was invalid: its 8th tap (6,7) is diagonal from (7,6), and driving it proved the cat does not move (Moves stayed 7). The reachable loss is the dog landing on the cat (line above), which shows the same message.
- [x] Play again resets the board — Le Chonk bottom-left, the dog in the centre, "Moves: 0", the message cleared, Play again hidden — drive: after a win tap Play again; read the positions, the count, the message line and the button — passed: after a loss tapped Play again; read cat (1,7), dog (4,4), moves=0, "Moves: 0", message="", gameOver=false, the Play again button hidden (visibility:hidden, same as at the start), the tally unchanged ("Won 0 · Lost 1"), and the DOM showed the cat on cell-1-7 and the dog on cell-4-4 with the cat gone from cell-1-4; a second round and a second Play again reset identically, so the reset repeats correctly. (Reset is seven Set Variable nodes writing constants on the button's Do signal — a Function outputting constants would send only on change and never reset again; see PLAN.md.)

## Part 6 — the tally

- [ ] The tally counts the round: after a win it says "Won 1 · Lost 0"; after a loss it says "Won 0 · Lost 1" — drive: win a game and read the tally; tap Play again, lose a game, read "Won 1 · Lost 1".
- [ ] The tally is still there after a reload — drive: win a game, reload the page, go through "Who's playing?" again, and the tally still says "Won 1 · Lost 0".

## Part 7 — phone and laptop

- [ ] The board works on a phone: at 390px nothing overflows the screen and the 7×7 board fits — drive: render and read at phone width; documentElement.scrollWidth ≤ clientWidth and the board's width ≤ the viewport.
