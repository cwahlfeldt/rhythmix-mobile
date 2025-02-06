import React from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { ThemedText } from './ThemedText';
import { SongData } from '../types/song';

interface SongListItemProps {
    song: SongData;
    highScore?: number;
    onPress: () => void;
    isLoading?: boolean;
}

export function SongListItem({ song, highScore = 0, onPress, isLoading = false }: SongListItemProps) {
    // Convert difficulty to stars (0-5)
    const difficultyStars = Math.round(song.metadata.difficulty * 5);
    const stars = '★'.repeat(difficultyStars) + '☆'.repeat(5 - difficultyStars);

    return (
        <Pressable
            onPress={onPress}
            disabled={isLoading}
            style={({ pressed }) => [
                styles.container,
                pressed && styles.pressed,
                isLoading && styles.loading,
            ]}
        >
            <View style={styles.content}>
                <View style={styles.mainInfo}>
                    <ThemedText style={styles.title}>{song.metadata.name}</ThemedText>
                    <ThemedText style={styles.difficulty}>{stars}</ThemedText>
                </View>
                <View style={styles.scoreContainer}>
                    <ThemedText style={styles.scoreLabel}>HIGH SCORE</ThemedText>
                    <ThemedText style={styles.score}>{highScore.toLocaleString()}</ThemedText>
                </View>
                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#fff" />
                    </View>
                )}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        marginHorizontal: 16,
        marginVertical: 8,
        overflow: 'hidden',
    },
    pressed: {
        opacity: 0.7,
        transform: [{ scale: 0.98 }],
    },
    loading: {
        opacity: 0.7,
    },
    content: {
        padding: 16,
    },
    mainInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
    },
    difficulty: {
        fontSize: 16,
        color: '#FFD700',
        marginLeft: 8,
    },
    scoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    scoreLabel: {
        fontSize: 14,
        opacity: 0.7,
    },
    score: {
        fontSize: 16,
        fontWeight: '600',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});