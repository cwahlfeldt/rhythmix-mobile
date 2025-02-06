import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { ThemedText } from '../ThemedText';

interface CountdownOverlayProps {
    isVisible: boolean;
    onComplete: () => void;
    bpm: number;
}

export function CountdownOverlay({ isVisible, onComplete, bpm }: CountdownOverlayProps) {
    const [count, setCount] = useState(4);
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const scaleAnim = React.useRef(new Animated.Value(1.5)).current;

    useEffect(() => {
        if (!isVisible) {
            setCount(4);
            return;
        }

        const beatDuration = 60000 / bpm;

        // Animate number appearance
        const animateNumber = () => {
            fadeAnim.setValue(0);
            scaleAnim.setValue(1.5);

            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: beatDuration * 0.2,
                    useNativeDriver: true,
                }),
                Animated.sequence([
                    Animated.timing(scaleAnim, {
                        toValue: 1,
                        duration: beatDuration * 0.2,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleAnim, {
                        toValue: 0.8,
                        duration: beatDuration * 0.8,
                        useNativeDriver: true,
                    }),
                ]),
            ]).start();
        };

        if (count > 0) {
            animateNumber();
            const timer = setTimeout(() => {
                setCount(c => c - 1);
            }, beatDuration);

            return () => clearTimeout(timer);
        } else {
            onComplete();
        }
    }, [count, isVisible, bpm]);

    if (!isVisible) return null;

    return (
        <View style={styles.overlay}>
            <Animated.View
                style={[
                    styles.countContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                <ThemedText style={styles.countText}>
                    {count === 0 ? 'GO!' : count}
                </ThemedText>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 100,
    },
    countContainer: {
        width: 200,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    countText: {
        fontSize: 120,
        fontWeight: 'bold',
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 10,
    },
});