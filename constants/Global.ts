export const NOTE_HEIGHT = 32;

// Scoring zones (in milliseconds)
export const SCORE_ZONES = {
    PERFECT: 50, // ±50ms
    GOOD: 100,   // ±100ms
    MID: 150,    // ±150ms
    BAD: 200,    // ±200ms
    MISS: 200,   // >±200ms
};

// Points for each scoring zone
export const SCORE_POINTS = {
    PERFECT: 1000,
    GOOD: 700,
    MID: 400,
    BAD: 100,
    MISS: 0,
};

// Calculate score based on timing difference
export function calculateScore(timingDifference: number): {
    score: number;
    rating: keyof typeof SCORE_POINTS;
} {
    const absDiff = Math.abs(timingDifference);

    if (absDiff <= SCORE_ZONES.PERFECT) {
        return { score: SCORE_POINTS.PERFECT, rating: 'PERFECT' };
    } else if (absDiff <= SCORE_ZONES.GOOD) {
        return { score: SCORE_POINTS.GOOD, rating: 'GOOD' };
    } else if (absDiff <= SCORE_ZONES.MID) {
        return { score: SCORE_POINTS.MID, rating: 'MID' };
    } else if (absDiff <= SCORE_ZONES.BAD) {
        return { score: SCORE_POINTS.BAD, rating: 'BAD' };
    } else {
        return { score: SCORE_POINTS.MISS, rating: 'MISS' };
    }
}