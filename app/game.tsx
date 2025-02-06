import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, Pressable, Modal, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '../components/ThemedText';
import { NoteBlock } from '../components/game/NoteBlock';
import { BeatLine, calculateScore, SCORE_ZONES } from '../components/game/BeatLine';
import { ScoreDisplay } from '../components/game/ScoreDisplay';
import { FallingNotes } from '../components/game/FallingNotes';
import type { SongResponse, Note } from '../types/song';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const NUMBER_OF_LANES = 3;
const LANE_WIDTH = Dimensions.get('window').width / NUMBER_OF_LANES;

export default function GameScreen() {
    const params = useLocalSearchParams();
    const songData = JSON.parse(params.songData as string) as SongResponse;
    const previousHighScore = parseInt(params.highScore as string) || 0;

    const [isLoading, setIsLoading] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [lastRating, setLastRating] = useState<string>();
    const [activeNotes, setActiveNotes] = useState<Note[]>([]);

    const soundRef = useRef<Audio.Sound>();
    const gameStartTimeRef = useRef<number>(0);
    const currentTimeRef = useRef<number>(0);

    useEffect(() => {
        setupGame();
        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
        };
    }, []);

    const setupGame = async () => {
        try {
            // Set up audio
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
            });

            // Load the song from local MP3 file
            let soundObject;
            try {
                console.log('Loading local MP3 file...');
                soundObject = await Audio.Sound.createAsync(
                    require('../assets/test_song.mp3'),
                    { shouldPlay: false }
                );
            } catch (e: any) {
                console.error('Audio loading error:', e);
                throw new Error(`Failed to load audio: ${e?.message || 'Unknown error'}`);
            }

            const { sound } = soundObject;
            soundRef.current = sound;

            setIsLoading(false);
            startCountIn();
        } catch (error) {
            console.error('Error setting up game:', error);
            router.back();
        }
    };

    const startCountIn = async () => {
        // 4-count based on BPM
        const beatDuration = 60000 / songData.data.metadata.bpm;
        let count = 4;

        // Function to handle each beat
        const handleBeat = async () => {
            if (count > 0) {
                count--;
                if (count === 0) {
                    // Start game immediately on the 5th beat
                    startGame();
                }
            }
        };

        // Start the count-in with precise timing
        const beatTimer = () => {
            handleBeat();
            if (count > 0) {
                setTimeout(beatTimer, beatDuration);
            }
        };

        beatTimer();
    };

    const startGame = async () => {
        // Start immediately on the 5th beat (after 4-count)
        const beatDuration = 60000 / songData.data.metadata.bpm;
        const now = Date.now();

        // Set game start time to now
        gameStartTimeRef.current = now;
        setActiveNotes(songData.data.notes);

        // Start the song immediately
        await soundRef.current?.playAsync();
    };

    const handleTap = async (lane: number) => {
        if (isPaused || isGameOver) return;

        const beatLineY = SCREEN_HEIGHT - 150; // Same position as defined in BeatLine
        const hitWindow = 30; // Pixels of leeway for visual alignment

        // Find notes in this lane that are at the beat line
        const notesInLane = activeNotes.filter(note => note.lane === lane);

        // Get the note closest to the beat line if multiple are in range
        const nearestNote = notesInLane.reduce((nearest, note) => {
            if (!nearest) return note;
            const currentDiff = Math.abs(note.position!.value - beatLineY);
            const nearestDiff = Math.abs(nearest.position!.value - beatLineY);
            return currentDiff < nearestDiff ? note : nearest;
        }, null as Note | null);

        console.log(notesInLane[0].timestamp);

        if (nearestNote) {
            // Perfect hit since we're checking position
            setScore(prev => prev + 1000);
            setCombo(prev => prev + 1);
            setLastRating('PERFECT');

            // Remove the hit note
            setActiveNotes(prev => prev.filter(n => n !== nearestNote));
        }
    };

    const handleNoteOffscreen = (note: Note) => {
        console.log(activeNotes.length)
        setActiveNotes(activeNotes.slice(0));
        setCombo(0);
        setLastRating('MISS');
        setScore(prev => Math.max(0, prev - 500)); // Decrease score by 500 points, but don't go below 0
    };

    const endGame = async () => {
        // Stop the song
        await soundRef.current?.stopAsync();

        // Save high score if beaten
        if (score > previousHighScore) {
            const highScores = JSON.parse(
                await AsyncStorage.getItem('highScores') || '{}'
            );
            highScores[songData.data.metadata.name] = score;
            await AsyncStorage.setItem('highScores', JSON.stringify(highScores));
        }

        setIsGameOver(true);
    };

    const handlePause = async () => {
        setIsPaused(true);
        const status = await soundRef.current?.getStatusAsync();
        if (status && 'positionMillis' in status) {
            currentTimeRef.current = status.positionMillis / 1000;
        }
        await soundRef.current?.pauseAsync();
    };

    const handleResume = async () => {
        // Calculate the next beat time based on current BPM
        const beatDuration = 60000 / songData.data.metadata.bpm;
        const now = Date.now();
        const nextBeatTime = now + (beatDuration - (now % beatDuration));

        // Update game start time to maintain sync with notes
        const currentPosition = currentTimeRef.current * 1000; // Convert to milliseconds
        gameStartTimeRef.current = nextBeatTime - currentPosition;

        // Wait until the next beat to resume
        const waitTime = nextBeatTime - now;
        await new Promise(resolve => setTimeout(resolve, waitTime));

        setIsPaused(false);
        await soundRef.current?.playFromPositionAsync(currentPosition);
    };

    const handleQuit = async () => {
        if (soundRef.current) {
            await soundRef.current.unloadAsync();
        }
        router.back();
    };

    if (isLoading) {
        return (
            <View style={styles.container}>
                <ThemedText>Loading...</ThemedText>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <ThemedText style={styles.songName}>{songData.data.metadata.name}</ThemedText>
                <Pressable onPress={handlePause} style={styles.pauseButton}>
                    <ThemedText>II</ThemedText>
                </Pressable>
            </View>

            {/* Score Display */}
            <ScoreDisplay
                score={score}
                lastRating={lastRating}
                combo={combo}
            />

            {/* Game Area */}
            <View style={styles.gameArea}>
                <BeatLine
                    laneWidth={LANE_WIDTH}
                    numberOfLanes={NUMBER_OF_LANES}
                />

                {/* Falling Notes */}
                <FallingNotes
                    notes={activeNotes}
                    laneWidth={LANE_WIDTH}
                    scrollSpeed={songData.data.metadata.recommended_scroll_speed}
                    gameStartTime={gameStartTimeRef.current}
                    onNoteOffscreen={handleNoteOffscreen}
                    isPaused={isPaused}
                    bpm={songData.data.metadata.bpm}
                />

                {/* Lane Touch Areas */}
                <View style={styles.laneContainer}>
                    {Array.from({ length: NUMBER_OF_LANES }).map((_, index) => (
                        <Pressable
                            key={index}
                            style={styles.lane}
                            onPress={() => handleTap(index)}
                        />
                    ))}
                </View>
            </View>

            {/* Pause Modal */}
            <Modal
                visible={isPaused && !isGameOver}
                transparent
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ThemedText style={styles.modalTitle}>PAUSED</ThemedText>
                        <Pressable style={styles.modalButton} onPress={handleResume}>
                            <ThemedText>RESUME</ThemedText>
                        </Pressable>
                        <Pressable style={styles.modalButton} onPress={handleQuit}>
                            <ThemedText>QUIT</ThemedText>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* Game Over Modal */}
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
                        <Pressable style={styles.modalButton} onPress={handleQuit}>
                            <ThemedText>CONTINUE</ThemedText>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    songName: {
        fontSize: 18,
        fontWeight: '600',
    },
    pauseButton: {
        padding: 10,
    },
    gameArea: {
        flex: 1,
        position: 'relative',
    },
    laneContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        zIndex: 10, // Ensure it's above other elements for tapping
    },
    lane: {
        flex: 1,
        height: '100%',
        backgroundColor: 'transparent',
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
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