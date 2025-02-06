import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, Pressable, Modal, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '../components/ThemedText';
import { BeatLine } from '../components/game/BeatLine';
import { ScoreDisplay } from '../components/game/ScoreDisplay';
import { FallingNotes } from '../components/game/FallingNotes';
import { CountdownOverlay } from '../components/game/CountdownOverlay';
import { calculateScore, calculateNoteTiming } from '../utils/scoring';
import type { SongResponse, Note } from '../types/song';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const NUMBER_OF_LANES = 3;
const LANE_WIDTH = Dimensions.get('window').width / NUMBER_OF_LANES;
const AUDIO_WARMUP_DURATION = 3000; // 3 seconds of warmup

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
    const [showCountdown, setShowCountdown] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState('Preparing audio...');

    const soundRef = useRef<Audio.Sound>();
    const warmupSoundRef = useRef<Audio.Sound>();
    const gameStartTimeRef = useRef<number>(0);
    const currentTimeRef = useRef<number>(0);

    useEffect(() => {
        setupGame();
        return () => {
            cleanupAudio();
        };
    }, []);

    const cleanupAudio = async () => {
        if (soundRef.current) {
            await soundRef.current.unloadAsync();
        }
        if (warmupSoundRef.current) {
            await warmupSoundRef.current.unloadAsync();
        }
    };

    const setupGame = async () => {
        try {
            setLoadingStatus('Setting up audio...');
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
                shouldDuckAndroid: false,
            });

            // Load and play a short sound at low volume to initialize audio system
            setLoadingStatus('Initializing audio system...');
            try {
                const { sound } = await Audio.Sound.createAsync(
                    require('../assets/test_song.mp3'),
                    {
                        shouldPlay: true,
                        volume: 0.01,
                        positionMillis: 0,
                        progressUpdateIntervalMillis: 50
                    }
                );
                warmupSoundRef.current = sound;

                // Stop after 100ms
                await new Promise(resolve => setTimeout(async () => {
                    await sound.stopAsync();
                    await sound.unloadAsync();
                    warmupSoundRef.current = undefined;
                    resolve(true);
                }, 100));
            } catch (e) {
                console.warn('Warmup audio failed, continuing anyway:', e);
            }

            // Load the actual song
            setLoadingStatus('Loading song...');
            let songSound;
            try {
                songSound = await Audio.Sound.createAsync(
                    require('../assets/test_song.mp3'),
                    { shouldPlay: false }
                );
            } catch (e: any) {
                console.error('Audio loading error:', e);
                throw new Error(`Failed to load audio: ${e?.message || 'Unknown error'}`);
            }

            soundRef.current = songSound.sound;

            // Wait for audio system to fully initialize
            setLoadingStatus('Connecting audio devices...');
            await new Promise(resolve => setTimeout(resolve, AUDIO_WARMUP_DURATION));

            setIsLoading(false);
            setShowCountdown(true);
        } catch (error) {
            console.error('Error setting up game:', error);
            router.back();
        }
    };

    const handleCountdownComplete = async () => {
        setShowCountdown(false);
        const now = Date.now();
        gameStartTimeRef.current = now;
        setActiveNotes(songData.data.notes);
        await soundRef.current?.playAsync();
    };

    const handleTap = async (lane: number) => {
        if (isPaused || isGameOver) return;

        const notesInLane = activeNotes.filter(note => note.lane === lane);
        if (notesInLane.length === 0) return;

        const currentTime = Date.now();

        const nearestNote = notesInLane.reduce((nearest, note) => {
            if (!nearest) return note;
            const currentDiff = Math.abs(calculateNoteTiming(note.timestamp, gameStartTimeRef.current, currentTime));
            const nearestDiff = Math.abs(calculateNoteTiming(nearest.timestamp, gameStartTimeRef.current, currentTime));
            return currentDiff < nearestDiff ? note : nearest;
        }, null as Note | null);

        if (nearestNote) {
            const timingDiff = calculateNoteTiming(nearestNote.timestamp, gameStartTimeRef.current, currentTime);
            const { points, rating } = calculateScore(timingDiff);

            if (rating !== 'MISS') {
                setScore(prev => prev + points);
                setCombo(prev => prev + 1);
                setLastRating(rating);
                setActiveNotes(prev => prev.filter(n => n !== nearestNote));
            }
        }
    };

    const handleNoteOffscreen = (note: Note) => {
        setActiveNotes(prev => prev.filter(n => n !== note));
        setCombo(0);
        setLastRating('MISS');
    };

    const handlePause = async () => {
        setIsPaused(true);
        const status = await soundRef.current?.getStatusAsync();
        if (status && 'positionMillis' in status) {
            currentTimeRef.current = status.positionMillis / 1000;
        }
        await soundRef.current?.pauseAsync();
    };

    const handleResume = () => {
        setShowCountdown(true);
    };

    const handleResumeAfterCountdown = async () => {
        const beatDuration = 60000 / songData.data.metadata.bpm;
        const now = Date.now();
        const currentPosition = currentTimeRef.current * 1000;

        gameStartTimeRef.current = now - currentPosition;

        setIsPaused(false);
        await soundRef.current?.playFromPositionAsync(currentPosition);
    };

    const handleQuit = async () => {
        await cleanupAudio();
        router.back();
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" style={styles.loadingSpinner} />
                <ThemedText style={styles.loadingText}>{loadingStatus}</ThemedText>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <ThemedText style={styles.songName}>{songData.data.metadata.name}</ThemedText>
                <Pressable onPress={handlePause} style={styles.pauseButton}>
                    <ThemedText>II</ThemedText>
                </Pressable>
            </View>

            <ScoreDisplay
                score={score}
                lastRating={lastRating}
                combo={combo}
            />

            <View style={styles.gameArea}>
                <BeatLine
                    laneWidth={LANE_WIDTH}
                    numberOfLanes={NUMBER_OF_LANES}
                />

                <FallingNotes
                    notes={activeNotes}
                    laneWidth={LANE_WIDTH}
                    scrollSpeed={songData.data.metadata.recommended_scroll_speed}
                    gameStartTime={gameStartTimeRef.current}
                    onNoteOffscreen={handleNoteOffscreen}
                    isPaused={isPaused}
                    bpm={songData.data.metadata.bpm}
                />

                <View style={styles.laneContainer}>
                    {Array.from({ length: NUMBER_OF_LANES }).map((_, index) => (
                        <Pressable
                            key={index}
                            style={styles.lane}
                            onPress={() => handleTap(index)}
                        />
                    ))}
                </View>

                <CountdownOverlay
                    isVisible={showCountdown}
                    onComplete={isPaused ? handleResumeAfterCountdown : handleCountdownComplete}
                    bpm={songData.data.metadata.bpm}
                />
            </View>

            <Modal
                visible={isPaused && !isGameOver && !showCountdown}
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
    loadingContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingSpinner: {
        marginBottom: 20,
    },
    loadingText: {
        fontSize: 18,
        textAlign: 'center',
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
        zIndex: 10,
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