import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useEffect, useMemo } from 'react';
import { ThemedText } from '../components/ThemedText';
import { generateProceduralBackground } from '../utils/proceduralGraphics';

export default function StartScreen() {
    // Generate a unique procedural background pattern
    const backgroundPattern = useMemo(() => generateProceduralBackground(), []);

    const handleStart = async () => {
        router.push('/songs');
    };

    return (
        <View style={styles.container}>
            {/* Background pattern */}
            <View style={[styles.backgroundPattern, { opacity: 0.6 }]}>
                {backgroundPattern}
            </View>

            {/* Blur overlay */}
            <BlurView intensity={60} style={StyleSheet.absoluteFill} />

            {/* Content */}
            <View style={styles.content}>
                <ThemedText style={styles.title}>RHYTHMIX</ThemedText>
                <Pressable
                    onPress={handleStart}
                    style={({ pressed }) => [
                        styles.startButton,
                        pressed && styles.startButtonPressed,
                    ]}
                >
                    <ThemedText style={styles.startButtonText}>TAP TO START</ThemedText>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    backgroundPattern: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 48,
        fontWeight: 'bold',
        marginBottom: 40,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 10,
    },
    startButton: {
        paddingHorizontal: 40,
        paddingVertical: 20,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    startButtonPressed: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        transform: [{ scale: 0.98 }],
    },
    startButtonText: {
        fontSize: 24,
        fontWeight: '600',
    },
});