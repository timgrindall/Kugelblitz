let pieceValues = {
  p: 10,
  n: 30,
  b: 30,
  r: 50,
  q: 90,
  k: 900
}

const DEBUG = true; // Set to true to enable debug logging

const checkmate_eval = 10000;
let nodes_evaluated = 0;
let zero_evals = 0;
let nonzero_evals = 0;

let nonzeroEvalsByDepth;

function orderMoves(moves, position) {
  return moves.sort((moveA, moveB) => {
    // Captures first (moves with 'x' in notation)
    const isCaptureA = moveA.includes('x');
    const isCaptureB = moveB.includes('x');
    
    if (isCaptureA && !isCaptureB) return -1;
    if (!isCaptureA && isCaptureB) return 1;
    
    return 0; // Equal priority
  });
}

function getCenterBias(move, isMaximizing) {
  // Remove check (+), checkmate (#), and other notation symbols
  const cleanMove = move.replace(/[+#!?]/g, '');
  
  // Don't apply center bias to king moves
  if (cleanMove.startsWith('K')) {
    return 0;
  }

  let toSquare;
  
  if (cleanMove.length >= 2) {
    toSquare = cleanMove.slice(-2);  // Now gets "e3"
  } else {
    return 0;
  }
  
  const file = toSquare.charCodeAt(0) - 'a'.charCodeAt(0); // 0-7
  const rank = parseInt(toSquare[1]) - 1; // 0-7
  
  const distFromCenter = Math.abs(file - 3.5) + Math.abs(rank - 3.5);
  
  const bias = 5 - distFromCenter;
  return isMaximizing ? bias : -bias;
}

// src/minimax.js

function getCenterBiasV2(move, maximizingPlayer) {
  // Parse move: e.g., "e4" → col=4, row=3
  const colMap = { 'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4, 'f': 5, 'g': 6, 'h': 7 };
  const rowMap = { '1': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6, '8': 7 };

  const [file, rank] = move.split('');
  const col = colMap[file];
  const row = rowMap[rank];

  // Center of 8x8 board (0-indexed)
  const centerX = 4;
  const centerY = 4;

  // Euclidean distance from center
  const dx = Math.abs(col - centerX);
  const dy = Math.abs(row - centerY);
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Maximum possible distance (from corner to center)
  const maxDistance = Math.sqrt(3 * 3 + 3 * 3); // √(9+9) = √18 ≈ 4.24

  // Normalize distance to a bias score (0 to 1)
  // Closer to center → higher score (positive bias)
  const biasScore = 1 - (distance / maxDistance);

  return biasScore; // Positive value for moves near center
}

function getPieceValue(piece){
  if (piece == null) {
    return 0;
  }

  if (piece.color == 'w') {
    return pieceValues[piece.type];
  } else {
    return -pieceValues[piece.type];
  }
}

function evaluateBoard(board, depth){
  let evaluation = 0;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      evaluation += getPieceValue(board[i][j])
    }
  }
  nodes_evaluated++;
  return evaluation;
}

function evaluatePosition(position, depth){
  if (position.isCheckmate()){
    return (position.turn() == 'w') ? -checkmate_eval : checkmate_eval;
  } else if (position.isDraw()){
    return 0;
  } else {
    const evalScore = evaluateBoard(position.board());
    if (evalScore === 0) {
      zero_evals++;
    } else {
      nonzero_evals++;
      nonzeroEvalsByDepth[depth]++
      // console.log(`Non-zero evaluation: ${evalScore}`);
    }
    return evalScore;
  }
}

function minimax(position, depth, alpha, beta, maximizing_player, initialDepth = depth){

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
    if (depth === initialDepth) {
      console.log(`Top level moves: ${possibleMoves.join(', ')}`);
    }

    for (let i = 0; i < possibleMoves.length; i++) {

      //DEBUG: Log move being evaluated
      // if (depth === initialDepth && DEBUG) {
      //   console.log(`Evaluating move: ${possibleMoves[i]}`);
      // }

      const timerStart = Date.now()
      position.move(possibleMoves[i])
      let [childBestMove, childEval] = minimax(position, depth - 1, alpha, beta, false, initialDepth)

      const timerEnd = Date.now()

      const bias = getCenterBiasV2(possibleMoves[i], maximizing_player);
      const adjustedEval = childEval + bias;

      // DEBUG: Log move and its evaluation
      if (depth === initialDepth && DEBUG) {
        console.log(`Move ${possibleMoves[i]}: eval = ${childEval}, bias = ${bias}, adjusted = ${adjustedEval}   ${(timerEnd - timerStart)/1000} (sec)`);
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
    if (depth === initialDepth) {
      console.log(`Top level moves: ${possibleMoves.join(', ')}`);
    }

    for (let i = 0; i < possibleMoves.length; i++) {

      //DEBUG: Log move being evaluated
      // if (depth === initialDepth && DEBUG) {
      //   console.log(`Evaluating move: ${possibleMoves[i]}`);
      // }

      const timerStart = Date.now()
      position.move(possibleMoves[i])
      let [childBestMove, childEval] = minimax(position, depth - 1, alpha, beta, true, initialDepth)

      const timerEnd = Date.now()

      const bias = getCenterBiasV2(possibleMoves[i], maximizing_player);
      const adjustedEval = childEval + bias;

      // DEBUG: Log move and its evaluation
      if (depth === initialDepth && DEBUG) {
        console.log(`Move ${possibleMoves[i]}: eval = ${childEval}, bias = ${bias}, adjusted = ${adjustedEval}   ${(timerEnd - timerStart)/1000} (sec)`);
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

export function getNodesEvaluated() {
  return nodes_evaluated;
}

export function getZeroEvals() {
  return zero_evals;
}

export function getNonzeroEvals() {
  return nonzero_evals;
}

export function resetCounters(maxDepth) {
  nodes_evaluated = 0;
  zero_evals = 0;
  nonzero_evals = 0;
  nonzeroEvalsByDepth = new Array(maxDepth).fill(0);
}

export function getNonzeroEvalsByDepth() {
  // console.log("nonzeroEvalsByDepth:", nonzeroEvalsByDepth);  // Debug
  return nonzeroEvalsByDepth;
}

export default minimax;