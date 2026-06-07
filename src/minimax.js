import getSortedMoves from './getSortedMoves.js'
import { orderMoves, getCenterBias, getPieceValue, evaluateBoard, evaluatePosition, progressBar } from './helpers.js'

// const DEBUG = true; // Set to true to enable debug logging

function minimax(position, depth, alpha, beta, maximizing_player, initialDepth = depth, DEBUG = false){

  // base case: if terminal state (game over) or max depth (depth == 0) is reached, return evaluation of position
  if (position.isCheckmate() || position.isDraw() || depth == 0){
    return [null, evaluatePosition(position, depth)];
  }

  let bestMove;
  if (maximizing_player) {
    // find move with best possible score
  let maxEval = -Infinity;
  let bestMoves = [];  // Collect all best moves
  let possibleMoves = orderMoves(position.moves(), position);

    // DEBUG: Log moves and their evaluations
    if (depth === initialDepth && DEBUG) {
      console.log(`Top level moves: ${possibleMoves.join(', ')}`);
    }

    // Evaluate each move and track the best score
    for (let i = 0; i < possibleMoves.length; i++) {

      //DEBUG: Log move being evaluated
      // if (depth === initialDepth && DEBUG) {
      //   console.log(`Evaluating move: ${possibleMoves[i]}`);
      // }

      const timerStart = Date.now()
      position.move(possibleMoves[i])
      let [childBestMove, childEval] = minimax(position, depth - 1, alpha, beta, false, initialDepth, DEBUG)

      const timerEnd = Date.now()

      const bias = getCenterBias(possibleMoves[i], maximizing_player);
      const adjustedEval = childEval + bias;

      // DEBUG: Log move and its evaluation
      if (depth === initialDepth && DEBUG) {
        console.log(`Move ${possibleMoves[i]}: eval = ${childEval}, bias = ${bias}, adjusted = ${adjustedEval}   ${(timerEnd - timerStart)/1000} (sec)`);
      } else if (depth === initialDepth) {
        progressBar(possibleMoves.length, i)
      }

      if (adjustedEval > maxEval) {
        maxEval = adjustedEval;
        bestMoves = [possibleMoves[i]];
      } else if (adjustedEval === maxEval) {
        bestMoves.push(possibleMoves[i]);
      }
      position.undo()

      // alpha beta pruning
      alpha = Math.max(alpha, adjustedEval)
      if (beta <= alpha) {
        break;
      }
    }

    // Pick random move from best moves
    const bestMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
    return [bestMove, maxEval];

  } else {
    // find move with worst possible score (for maximizer)
    let minEval = +Infinity;
    let bestMoves = [];
    let possibleMoves = orderMoves(position.moves(), position);

    // DEBUG: Log moves and their evaluations
    if (depth === initialDepth && DEBUG) {
      console.log(`Top level moves: ${possibleMoves.join(', ')}`);
    }

    for (let i = 0; i < possibleMoves.length; i++) {

      //DEBUG: Log move being evaluated
      // if (depth === initialDepth && DEBUG) {
      //   console.log(`Evaluating move: ${possibleMoves[i]}`);
      // }

      const timerStart = Date.now()
      position.move(possibleMoves[i])
      let [childBestMove, childEval] = minimax(position, depth - 1, alpha, beta, true, initialDepth, DEBUG)

      const timerEnd = Date.now()

      const bias = getCenterBias(possibleMoves[i], maximizing_player);
      const adjustedEval = childEval + bias;

      // DEBUG: Log move and its evaluation
      if (depth === initialDepth && DEBUG) {
        console.log(`Move ${possibleMoves[i]}: eval = ${childEval}, bias = ${bias}, adjusted = ${adjustedEval}   ${(timerEnd - timerStart)/1000} (sec)`);
      } else if (depth === initialDepth) {
        progressBar(possibleMoves.length, i)
      }

      if (adjustedEval < minEval) {
        minEval = adjustedEval;
        bestMoves = [possibleMoves[i]];
      } else if (adjustedEval === minEval) {
        bestMoves.push(possibleMoves[i]);
      }
      position.undo()

      // alpha beta pruning
      beta = Math.min(beta, adjustedEval)
      if (beta <= alpha) {
        break;
      }
    }

    // Pick random move from best moves
    const bestMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
    return [bestMove, minEval];
  }

}

export default minimax;