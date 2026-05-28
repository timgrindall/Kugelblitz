# Kugelblitz

A console-based chess engine written in Node.js using minimax algorithm with alpha-beta pruning.

## Usage

```bash
node index.js [depth] [color]
```

- `depth` — Search depth (default: 5). Lower values for faster games.
- `color` — Player color: `w` for white, `b` for black (default: white).

Examples:
```bash
node index.js              # Play as white, depth 5
node index.js 4 w          # Play as white, depth 4
node index.js 5 b          # Play as black, depth 5
```

## How to Play

- Enter moves in algebraic notation (e.g., `e2e4`, `Nf3`)
- Computer responds with its move
- Game ends on checkmate, stalemate, or draw

## Features

- Minimax algorithm with alpha-beta pruning
- Move ordering optimization (captures prioritized)
- Position evaluation based on material balance
- Random move selection among tied evaluations
- Center bias for positional preference
- Performance metrics (nodes evaluated, search time)

## Requirements

- Node.js
- npm

## Installation

```bash
npm install
```

## Project Structure

- `index.js` — Main game loop
- `minimax.js` — Minimax algorithm and evaluation functions
- `package.json` — Dependencies

## Algorithm

Kugelblitz uses the minimax algorithm to evaluate positions recursively. Key optimizations:

- **Alpha-beta pruning** — Eliminates branches that cannot affect the final decision
- **Move ordering** — Evaluates captures first, enabling better pruning
- **Center bias** — Encourages piece activity toward the board center
