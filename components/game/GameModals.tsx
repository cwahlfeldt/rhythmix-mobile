import React from 'react';
import { View, StyleSheet, Modal, Pressable } from 'react-native';
import { ThemedText } from '../../components/ThemedText';

interface GameModalsProps {
    isPaused: boolean;
    isGameOver: boolean;
    showCountdown: boolean;
    score: number;
    previousHighScore: number;
    onResume: () => void;
    onQuit: () => void;
}

export function GameModals({
    isPaused,
    isGameOver,
    showCountdown,
    score,
    previousHighScore,
    onResume,
    onQuit,
}: GameModalsProps) {
    return (
        <>
            <Modal
                visible={isPaused && !isGameOver && !showCountdown}
                transparent
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ThemedText style={styles.modalTitle}>PAUSED</ThemedText>
                        <Pressable style={styles.modalButton} onPress={onResume}>
                            <ThemedText>RESUME</ThemedText>
                        </Pressable>
                        <Pressable style={styles.modalButton} onPress={onQuit}>
                            <ThemedText>QUIT</ThemedText>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={isGameOver}
                transparent
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ThemedText style={styles.modalTitle}>GAME OVER</ThemedText>
                        <ThemedText style={styles.scoreText}>
                            Score: {score.toLocaleString()}
                        </ThemedText>
                        {score > previousHighScore && (
                            <ThemedText style={styles.newHighScore}>
                                New High Score!
                            </ThemedText>
                        )}
                        <Pressable style={styles.modalButton} onPress={onQuit}>
                            <ThemedText>CONTINUE</ThemedText>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        minWidth: 250,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    modalButton: {
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginTop: 10,
        minWidth: 150,
        alignItems: 'center',
    },
    scoreText: {
        fontSize: 20,
        marginBottom: 10,
    },
    newHighScore: {
        fontSize: 18,
        color: '#FFD700',
        marginBottom: 20,
    },
});
