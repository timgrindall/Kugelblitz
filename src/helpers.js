// Global constants and helper functions for chess evaluation
let pieceValues = {
  p: 10,
  n: 30,
  b: 30,
  r: 50,
  q: 90,
  k: 900
};

/**
 * Sorts moves to prioritize captures (a standard optimization for alpha-beta pruning).
 * @param {Array<string>} moves - List of possible move strings.
 * @param {Object} position - The current chessJs position object.
 * @returns {Array<string>} Sorted list of moves.
 */
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


// --- Open Line Evaluation Bonus (New Feature) ---
/**
 * Calculates an estimated bonus score based on open files and ranks.
 * A file/rank is considered 'open' if it has significantly fewer pawns blocked.
 * @param {board} board - The chess board state from chess.js.
 * @param {bool} isMaximizing - Where we pass in the maxi or mini state
 * @returns {number} The cumulative open line bonus score.
 */
export function calculateOpenLineBonus(board, isMaximizing) {
  let bonus = 0;

  // --- Check Files (Columns A-H) ---
  for (let fileIndex = 0; fileIndex < 8; fileIndex++) { // fileIndex 0 is 'a', 7 is 'h'
    let pawnCount = 0;

    // Check all ranks vertically for this file
    for (let rankIndex = 0; rankIndex < 8; rankIndex++) {
      const piece = board[rankIndex][fileIndex];
      if (piece && piece.type === 'p') {
        pawnCount++;
      }
    }

    // Scoring logic: Bonus decays based on pawn count. Max possible pawns is 8.
    const fileBonus = Math.max(1, 7 - (pawnCount * 0.9));

    bonus += fileBonus;
  }


  // --- Check Ranks (Rows 1-8) ---
  for (let rankIndex = 0; rankIndex < 8; rankIndex++) { // Rank 0 is Rank 8, 7 is Rank 1
    let pawnCount = 0;

    // Check all files horizontally for this rank
    for (let fileIndex = 0; fileIndex < 8; fileIndex++) {
      const piece = board[rankIndex][fileIndex];
      if (piece && piece.type === 'p') {
        pawnCount++;
      }
    }

    // Same scoring logic for ranks
    const rankBonus = Math.max(1, 7 - (pawnCount * 0.9));
    bonus += rankBonus;
  }

  const scaledBonus = bonus * 0.02; // Significantly reduced scaling factor to bring it into the desired 5-10 range.
  return isMaximizing ? scaledBonus : -scaledBonus;
}

const checkmate_eval = 10000;
let nodes_evaluated = 0;
let zero_evals = 0;
let nonzero_evals = 0;

let nonzeroEvalsByDepth;

let totalOpenLineBonus = 0;
let numOpenLineBonus = 0;


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
    return 0;	// potential bug: could fail silently
  }

  const file = toSquare.charCodeAt(0) - 'a'.charCodeAt(0); // 0-7
  const rank = parseInt(toSquare[1]) - 1; // 0-7

  const distFromCenter = Math.abs(file - 3.5) + Math.abs(rank - 3.5);

  const bias = (5 - distFromCenter) * 2;	// multiply by 2 to help encourage pieces towards the center
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


/**
 * Evaluates the board state based on material and positional heuristics, 
 * including open lines/ranks.
 * @param {board} board - The current board state.
 * @param {number} depth - Current search depth (used for evaluation).
 * @param {bool} isMaximizing - maxi/mini state passed down from evaluatePosition()
 * @returns {number} The total board score.
 */
export function evaluateBoard(board, depth, isMaximizing){
  // 1. Material Score Calculation
  let materialEval = 0;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      materialEval += getPieceValue(board[i][j]);
    }
  }

  // 2. Open Line Bonus Calculation
  const openLineBonus = calculateOpenLineBonus(board, isMaximizing);

  // calculate open line bonus average score
  totalOpenLineBonus += openLineBonus;
  numOpenLineBonus++;
  
  // Total evaluation is a weighted sum of all features
  return materialEval;
}


/**
 * Evaluates the position after making a move, returning score and updated metrics.
 * @param {object} position - The chessJs position object (after calling .move()).
 * @param {number} depth - Current search depth.
 * @returns {number} The final evaluation score for this state.
 */
export function evaluatePosition(position, depth){
  nodes_evaluated++;

  if (position.isCheckmate()){
    return (position.turn() == 'w') ? -checkmate_eval : checkmate_eval;
  } else if (position.isDraw()){
    return 0;
  } else {
    const isMaxi = position.turn() === 'w'
    const evalScore = evaluateBoard(position.board(), depth, isMaxi);
    if (evalScore === 0) {
      zero_evals++;
    } else {
      nonzero_evals++;
      nonzeroEvalsByDepth[depth]++;
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
  totalOpenLineBonus = 0;
  numOpenLineBonus = 0;
}

export function getNonzeroEvalsByDepth() {
  return nonzeroEvalsByDepth;
}

export function getAvgOpenLineBonus() {
  return (totalOpenLineBonus / numOpenLineBonus);
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
