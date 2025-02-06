import { SharedValue } from 'react-native-reanimated';

export interface TimingScore {
    points: number;
    rating: 'PERFECT' | 'GOOD' | 'OK' | 'MISS';
}

// Simplified scoring zones (in milliseconds)
const TIMING_THRESHOLDS = {
    PERFECT: 50,  // ±50ms
    GOOD: 100,    // ±100ms
    OK: 150,      // ±150ms
} as const;

// Simplified points system
const POINTS = {
    PERFECT: 1000,
    GOOD: 500,
    OK: 100,
    MISS: 0,
} as const;

export function calculateScore(timingDifference: number): TimingScore {
    const absDiff = Math.abs(timingDifference);

    if (absDiff <= TIMING_THRESHOLDS.PERFECT) {
        return { points: POINTS.PERFECT, rating: 'PERFECT' };
    }
    if (absDiff <= TIMING_THRESHOLDS.GOOD) {
        return { points: POINTS.GOOD, rating: 'GOOD' };
    }
    if (absDiff <= TIMING_THRESHOLDS.OK) {
        return { points: POINTS.OK, rating: 'OK' };
    }
    return { points: POINTS.MISS, rating: 'MISS' };
}

// Helper to calculate note timing
export function calculateNoteTiming(
    noteTimestamp: number,
    gameStartTime: number,
    currentTime = Date.now()
): number {
    return (currentTime - gameStartTime) - (noteTimestamp * 1000);
}