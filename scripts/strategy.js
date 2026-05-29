// strategy.js
console.log("Starting Strategy...");
const initialMoves = ["e2-e4", "Nf3"]; 
const possibleMoves = [...initialMoves]; 
let depth = 1;
console.log(`Initial Moves: ${initialMoves.join(', ')}`); 

for (let i = 0; i < 5; i++) {
  // Simulate an evaluation
  const childEval = Math.random();
  
  if (childEval > 0.5) {
    possibleMoves[i] += "x";
  } else {
    possibleMoves[i] += "-";
  }
  console.log(`Move ${i}: ${possibleMoves[i]} (${childEval})`);
}

// DEBUG: Log move being evaluated
// if (depth === initialDepth && DEBUG) {
//   console.log(`Evaluating move: ${possibleMoves[i]}`);
// }

// DEBUG: Log move and its evaluation
if (depth === initialDepth && DEBUG) {
    console.log(`Move ${possibleMoves[i]}: eval = ${childEval}, bias = ${bias}, adjusted = ${adjustedEval} (${(timerEnd - timerStart)/1000} sec)`);
}

export function getNonzeroEvalsByDepth() {
  // console.log("nonzeroEvalsByDepth:", nonzeroEvalsByDepth);  // Debug
  return nonzeroEvalsByDepth;
}