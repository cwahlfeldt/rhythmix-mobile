import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { ThemedText } from '../ThemedText';

interface ScoreDisplayProps {
    score: number;
    lastRating: string | null;
    combo: number;
}

export function ScoreDisplay({ score, lastRating, combo }: ScoreDisplayProps) {
    // Animation value for the rating popup
    const ratingScale = new Animated.Value(0);

    // Animate the rating whenever it changes
    useEffect(() => {
        if (lastRating) {
            ratingScale.setValue(0);
            Animated.sequence([
                Animated.spring(ratingScale, {
                    toValue: 1,
                    useNativeDriver: true,
                    speed: 20,
                    bounciness: 8,
                }),
                Animated.timing(ratingScale, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                    delay: 300,
                }),
            ]).start();
        }
    }, [lastRating]);

    const getRatingColor = (rating: string | null) => {
        switch (rating) {
            case 'PERFECT':
                return '#FFD700'; // Gold
            case 'GOOD':
                return '#7CFF00'; // Lime
            case 'MID':
                return '#00FFFF'; // Cyan
            case 'BAD':
                return '#FF6B6B'; // Coral
            case 'MISS':
                return '#FF0000'; // Red
            default:
                return '#FFFFFF'; // White
        }
    };

    return (
        <View style={styles.container}>
            {/* Score */}
            <ThemedText style={styles.score}>
                {score.toLocaleString()}
            </ThemedText>

            {/* Combo */}
            {combo > 1 && (
                <ThemedText style={styles.combo}>
                    {combo}x COMBO
                </ThemedText>
            )}

            {/* Rating Popup */}
            <Animated.View
                style={[
                    styles.ratingContainer,
                    {
                        transform: [{ scale: ratingScale }],
                        opacity: ratingScale,
                    },
                ]}
            >
                <ThemedText
                    style={[
                        styles.rating,
                        { color: getRatingColor(lastRating) },
                    ]}
                >
                    {lastRating}
                </ThemedText>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 100,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    score: {
        fontSize: 32,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 3,
    },
    combo: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 4,
        opacity: 0.8,
    },
    ratingContainer: {
        position: 'absolute',
        top: 80,
        alignItems: 'center',
    },
    rating: {
        fontSize: 24,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
});