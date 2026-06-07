let pieceValues = {
  p: 10,
  n: 30,
  b: 30,
  r: 50,
  q: 90,
  k: 900
}


const checkmate_eval = 10000;
let nodes_evaluated = 0;
let zero_evals = 0;
let nonzero_evals = 0;

let nonzeroEvalsByDepth;

export function orderMoves(moves, position) {
  const sortedMoves = moves.sort((moveA, moveB) => {
    // Captures first (moves with 'x' in notation)
    const isCaptureA = moveA.includes('x');
    const isCaptureB = moveB.includes('x');
    
    if (isCaptureA && !isCaptureB) return -1;
    if (!isCaptureA && isCaptureB) return 1;
    
    return 0; // Equal priority
  });

  return sortedMoves;
}

/* export const getOrderMoves = (moves, position) => {
  // sort by includes a capture and then material gain
  const sortedMoves = moves.sort((moveA, moveB) => {
    const isCaptureA = moveA.includes('x');
    const isCaptureB = moveB.includes('x');

    if (isCaptureA && !isCaptureB) { // che
      //get piece value
    }
    if (!isCaptureA && isCaptureB) return 1;

    return 0; // equal priority
  });

  return sortedMoves;
} */

export function getCenterBias(move, isMaximizing) {
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

export function getPieceValue(piece){
  if (piece == null) {
    return 0;
  }

  if (piece.color == 'w') {
    return pieceValues[piece.type];
  } else {
    return -pieceValues[piece.type];
  }
}

export function evaluateBoard(board, depth){
  let evaluation = 0;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      evaluation += getPieceValue(board[i][j])
    }
  }
  nodes_evaluated++;
  return evaluation;
}

export function evaluatePosition(position, depth){
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
  return nonzeroEvalsByDepth;
}

export const progressBar = (num_moves, index) => {
  let progressBarUnfilled = '';
  let progressBarFilled = '';
  const totalLength = 30;
  const new_index = Math.floor(totalLength * (index+1) / num_moves);

  for (let f = 0; f <= new_index; f++) {
    progressBarFilled = progressBarFilled + '█';
  }
  for (let u = (totalLength - new_index); u != 0; --u) {
    progressBarUnfilled = progressBarUnfilled + '░';
  }
  const progressBar = progressBarFilled + progressBarUnfilled;
  process.stdout.write(`Processing move ${index+1} of ${num_moves} [${progressBar}]\r`)
}