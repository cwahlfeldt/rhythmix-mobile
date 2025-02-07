import { SCORE_ZONES, SCORE_POINTS } from '../constants/Global';

export type ScoreRating = keyof typeof SCORE_POINTS;

export interface ScoreResult {
    points: number;
    rating: ScoreRating;
}

export function calculateScore(timingDifference: number): ScoreResult {
    const absDiff = Math.abs(timingDifference);

    if (absDiff <= SCORE_ZONES.PERFECT) {
        return { points: SCORE_POINTS.PERFECT, rating: 'PERFECT' };
    }
    if (absDiff <= SCORE_ZONES.GOOD) {
        return { points: SCORE_POINTS.GOOD, rating: 'GOOD' };
    }
    if (absDiff <= SCORE_ZONES.MID) {
        return { points: SCORE_POINTS.MID, rating: 'MID' };
    }
    if (absDiff <= SCORE_ZONES.BAD) {
        return { points: SCORE_POINTS.BAD, rating: 'BAD' };
    }
    return { points: SCORE_POINTS.MISS, rating: 'MISS' };
}

// Helper to calculate note timing
export function calculateNoteTiming(
    noteTimestamp: number,
    gameStartTime: number,
    currentTime = Date.now()
): number {
    return (currentTime - gameStartTime) - (noteTimestamp * 1000);
}
