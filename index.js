import { Chess } from 'chess.js'
import promptSync from 'prompt-sync'
import minimax, { getNodesEvaluated, getZeroEvals, getNonzeroEvals, getNonzeroEvalsByDepth, resetCounters } from './minimax.js'

const prompt = promptSync({sigint: true})
const chess = new Chess()

const args = process.argv
let maxDepth = 5;
let playerColor = 'w'; // Default to white

if (args.length >= 3) maxDepth = Number(args[2]);
if (args.length >= 4) playerColor = args[3].toLowerCase();

if (!['w', 'b'].includes(playerColor)) {
  console.log("Invalid color. Use 'w' for white or 'b' for black.");
  process.exit(1);
}

console.log(`max depth set to ${maxDepth}`)
console.log(`player is ${playerColor === 'w' ? 'white' : 'black'}, computer is ${playerColor === 'w' ? 'black' : 'white'}`)

while (!chess.isGameOver()) {
  // If it's the player's turn, get their move
  if (chess.turn() === playerColor) {
    console.log(chess.ascii())
    const move = prompt("Enter your move (e.g. e4, Nf3, etc.): ")
    try {
      chess.move(move)
    } catch (e) {
      console.log("Invalid move, please try again.")
      continue;
    }
    console.log(chess.ascii())
  } else {
    // Computer's turn
    console.log(chess.ascii())
    const startTime = Date.now();
    console.log("Computer is thinking...")
    resetCounters(maxDepth);

    const isMaximizing = chess.turn() === 'w';
    const [bestMove, score] = minimax(chess, maxDepth, -Infinity, +Infinity, isMaximizing)
    const endTime = Date.now();

    console.log(`Computer plays: ${bestMove} (score: ${score})`)
    console.log(`Nodes evaluated: ${getNodesEvaluated()}`)
    console.log(`Zero evaluations: ${getZeroEvals()}`)
    console.log(`Non-zero evaluations: ${getNonzeroEvals()}`)
    console.log(`Non-zero evals by depth: out of ${maxDepth}`)
    const depthEvals = getNonzeroEvalsByDepth();
    for (let i = 0; i < depthEvals.length; i++) {
      if (depthEvals[i]) console.log(`Depth ${i}: ${depthEvals[i]} non-zero evals`);
    }
    console.log(`Time elapsed: ${(endTime - startTime)/1000} seconds`)
    chess.move(bestMove)
  }
  
  if (chess.isGameOver()) break;
}

console.log(chess.ascii())
if (chess.isCheckmate()){
  console.log("Checkmate! " + ((chess.turn() == 'w') ? "Black wins!" : "White wins!"))
} else if (chess.isDraw()){
  console.log("It's a draw!")
} else {
  console.log("Game over!")
}