import { Chess } from 'chess.js'
import promptSync from 'prompt-sync'
import minimax, { getNodesEvaluated, getZeroEvals, getNonzeroEvals, getNonzeroEvalsByDepth, resetCounters } from './minimax.js'

const prompt = promptSync({sigint: true}) // initialize chess game and prompt-sync for user input
const chess = new Chess()

let maxDepth; // depth of search for minimax

const args = process.argv
if (args.length < 3) maxDepth = 5
else maxDepth = Number(args[2])

console.log(`max depth set to ${maxDepth}`)

while (!chess.isGameOver()) {
  console.log(chess.ascii())
  // get input from user for move
  const move = prompt("Enter your move (e.g. e4, Nf3, etc.): ")
  try {
    chess.move(move)
  } catch (e) {
    console.log("Invalid move, please try again.")
    continue;
  }
  console.log(chess.ascii())
  //break if game is over after player's move
  if (chess.isGameOver()) break;


  // get best move for computer using minimax
  // (start timer)
  const startTime = Date.now();
  console.log("Computer is thinking...")
  resetCounters(maxDepth);

  // Determine whose turn it is
  const isMaximizing = chess.turn() === 'w'; // true if white's turn, false if black's turn

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

console.log(chess.ascii())
if (chess.isCheckmate()){
  console.log("Checkmate! " + ((chess.turn() == 'w') ? "Black wins!" : "White wins!"))
} else if (chess.isDraw()){
  console.log("It's a draw!")
} else {
  console.log("Game over!")
}

/* Maybe we just need to select a random selection from the best moves? */