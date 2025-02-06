import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

interface BeatLineProps {
    laneWidth: number;
    numberOfLanes: number;
}

export function BeatLine({ laneWidth, numberOfLanes }: BeatLineProps) {
    return (
        <View style={styles.container}>
            {/* Lane backgrounds */}
            <View style={[styles.lanesContainer, { width: laneWidth * numberOfLanes }]}>
                {Array.from({ length: numberOfLanes }).map((_, index) => (
                    <View
                        key={`lane-${index}`}
                        style={[
                            styles.laneBackground,
                            {
                                width: laneWidth,
                                left: index * laneWidth,
                                backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.05)'
                            }
                        ]}
                    />
                ))}
            </View>

            {/* Main beat line */}
            <View style={[
                styles.line,
                { width: laneWidth * numberOfLanes }
            ]} />

            {/* Lane dividers */}
            <View style={styles.laneMarkersContainer}>
                {Array.from({ length: numberOfLanes + 1 }).map((_, index) => (
                    <View
                        key={`divider-${index}`}
                        style={[
                            styles.laneDivider,
                            { left: index * laneWidth }
                        ]}
                    />
                ))}
            </View>
        </View>
    );
}

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

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 150, // Fixed position from bottom
        alignItems: 'center',
        width: '100%',
    },
    lanesContainer: {
        position: 'absolute',
        height: '100%',
        bottom: 0,
    },
    laneBackground: {
        position: 'absolute',
        height: '100%',
        bottom: 0,
    },
    line: {
        height: 4,
        backgroundColor: '#fff',
        borderRadius: 2,
        shadowColor: '#fff',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 5,
    },
    laneMarkersContainer: {
        position: 'absolute',
        width: '100%',
        height: 20,
        flexDirection: 'row',
    },
    laneDivider: {
        position: 'absolute',
        width: 2,
        height: '100%', // Extend to full height
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        shadowColor: '#fff',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 3,
    },
});