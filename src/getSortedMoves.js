import { Chess } from 'chess.js'; 
// Assuming minimax.js export these:
import { evaluateBoard } from './helpers.js'; 


/**
 * Sorts an array of moves based on heuristic priorities:
 * 1. Captures ('x') are prioritized highest.
 * 2. Material gain (change in overall board evaluation) is the secondary sorting criterion (higher score means better).
 *
 * @param {string[]} moves An array of move strings to be sorted (e.g., ['e4', 'Nf3']).
 * @param {Chess} chessInstance The active chess.js object representing the current game state.
 * @returns {string[]} The sorted array of moves.
 */
export default function getSortedMoves(moves, chessInstance) {

    /**
     * Calculates the material gain (change in board evaluation) for a single move.
     * This is done by comparing the current board evaluation against the evaluation 
     * after simulating the move.
     * @param {string} move The move to test.
     * @returns {{gain: number, isValid: boolean}} Object containing the calculated gain and validity status.
     */
    const calculateMoveGain = (move) => {
        // Create a temporary copy of the current board state to simulate the move safely.
        // const testPosition = new Chess(chessInstance.fen());
        // Or: dangerous but we'll try it
        const testPosition = chessInstance;

        try {
            testPosition.move(move)
        } catch {
            return { gain: -Infinity, isValid: false }; // Invalid moves score lowest
        }

        // 1. Calculate the evaluation before the simulated move
        testPosition.undo();
        let eInitial = evaluateBoard(testPosition.board(), 0); // Depth doesn't matter for evaluation

        testPosition.move(move);

        // 2. Evaluate the board after the move
        let eFinal = evaluateBoard(testPosition.board(), 0);
        testPosition.undo();

        // Material Gain: E_final - E_initial
        // A positive gain means we improved our position relative to the opponent's pieces.
        const gain = eFinal - eInitial;

        return { gain: gain, isValid: true };
    };


    /**
     * Custom comparison function for Array.sort(). 
     * It returns a negative number if A should come before B, positive otherwise, and zero if they are equal.
     */
    return moves.sort((moveA, moveB) => {

        // --- 1. Primary Sort Key: Captures ('x') ---
        const isCaptureA = moveA.includes('x');
        const isCaptureB = moveB.includes('x');

        if (isCaptureA && !isCaptureB) return -1; // A captures, B doesn't -> A first
        if (!isCaptureA && isCaptureB) return 1;  // B captures, A doesn't -> B first

        // --- 2. Secondary Sort Key: Material Gain (Descending order: Highest gain comes first) ---
        const resultA = calculateMoveGain(moveA);
        const resultB = calculateMoveGain(moveB);

        if (!resultA.isValid || !resultB.isValid) {
             // If both are invalid, they stay in relative order (0). 
             return 0; 
        }

        // We want the move with the HIGHER gain to be sorted first.
        // If resultB.gain is higher than resultA.gain, we need a positive return value for A (meaning B comes before A).
        const gainComparison = resultB.gain - resultA.gain; 

        // If gains are equal, fall back to random order or alphabetical order (0 here)
        return Math.sign(gainComparison);
    });
}
