# Kugelblitz ♟️

A command-line chess engine written in JavaScript (Node.js). Play against a minimax-based AI with alpha-beta pruning and move ordering heuristics.

## Features

- Minimax algorithm with alpha-beta pruning
- Move ordering (captures prioritized first) to improve pruning efficiency
- Center bias heuristic to encourage positionally active play
- Material-based board evaluation
- Configurable search depth and player color
- Debug mode for move-by-move evaluation output
- Real-time progress bar during the computer's turn

## Requirements

- Node.js (v18+ recommended)

## Installation

```bash
git clone -b version-2 https://github.com/timgrindall/Kugelblitz.git
cd Kugelblitz
npm install
```

## Usage

```bash
node src/index.js [depth] [color] [-debug]
```

### Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `depth` | Search depth (plies). Higher = stronger but slower. | `5` |
| `color` | Your color: `w` for white, `b` for black. | `w` |
| `-debug` | Enable debug logging (prints eval scores per move). | off |

### Examples

```bash
# Play as white at default depth 5
node src/index.js

# Play as black at depth 4
node src/index.js 4 b

# Play as white at depth 3 with debug output
node src/index.js 3 w -debug
```

Or use the npm script (plays white at depth 5):

```bash
npm run dev
```

## How to Play

Enter moves in standard algebraic notation when prompted:

```
Enter your move (e.g. e4, Nf3, etc.): e4
```

Examples: `e4`, `Nf3`, `Bxe5`, `O-O` (kingside castle), `O-O-O` (queenside castle).

The board is displayed in ASCII after each move. The game ends automatically on checkmate, stalemate, or draw.

## How it Works

**Minimax with Alpha-Beta Pruning** — The engine searches the game tree to the configured depth, maximizing the score for white and minimizing for black. Alpha-beta pruning cuts off branches that can't influence the final decision, significantly reducing nodes evaluated.

**Board Evaluation** — Positions are scored purely on material balance using standard piece values (P=10, N/B=30, R=50, Q=90, K=900). Checkmate evaluates to ±10,000.

**Move Ordering** — Captures are searched before quiet moves at every node, which improves the effectiveness of alpha-beta pruning by finding good moves earlier.

**Center Bias** — A small positional bonus is applied to moves that land closer to the center of the board, nudging the engine toward more active play.

## Project Structure

```
src/
├── index.js          # Entry point, game loop, CLI argument handling
├── minimax.js        # Minimax algorithm with alpha-beta pruning
├── helpers.js        # Board evaluation, move ordering, piece values, counters
└── getSortedMoves.js # Alternative move sorter with material gain calculation
```

## Dependencies

- [chess.js](https://github.com/jhlywa/chess.js) — Move generation, validation, and game state
- [prompt-sync](https://github.com/heapwolf/prompt-sync) — Synchronous terminal input

## License

MIT — © Tim Grindall
