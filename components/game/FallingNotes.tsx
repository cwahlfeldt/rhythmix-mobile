import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withTiming,
    useSharedValue,
    withSequence,
    runOnJS,
    Easing,
} from 'react-native-reanimated';
import type { Note } from '../../types/song';
import { NoteBlock } from './NoteBlock';
import { NOTE_HEIGHT } from '@/constants/Global';

interface FallingNotesProps {
    notes: Note[];
    laneWidth: number;
    scrollSpeed: number;
    gameStartTime: number;
    onNoteOffscreen: (note: Note) => void;
    isPaused?: boolean;
    bpm: number;
}

export function FallingNotes({
    notes,
    laneWidth,
    scrollSpeed,
    gameStartTime,
    onNoteOffscreen,
    isPaused = false,
    bpm,
}: FallingNotesProps) {
    const screenHeight = Dimensions.get('window').height;

    return (
        <View style={StyleSheet.absoluteFill}>
            {notes.map((note) => (
                <AnimatedNote
                    key={`${note.timestamp}-${note.lane}`}
                    note={note}
                    laneWidth={laneWidth}
                    scrollSpeed={scrollSpeed}
                    gameStartTime={gameStartTime}
                    screenHeight={screenHeight}
                    onOffscreen={onNoteOffscreen}
                    isPaused={isPaused}
                    bpm={bpm}
                />
            ))}
        </View>
    );
}

interface AnimatedNoteProps {
    note: Note;
    laneWidth: number;
    scrollSpeed: number;
    gameStartTime: number;
    screenHeight: number;
    onOffscreen: (note: Note) => void;
    isPaused?: boolean;
    bpm: number;
}

function AnimatedNote({
    note,
    laneWidth,
    scrollSpeed,
    gameStartTime,
    screenHeight,
    onOffscreen,
    isPaused = false,
    bpm,
}: AnimatedNoteProps) {
    const startY = -150; // Start position above screen
    const beatLineY = screenHeight - 150; // Beat line position
    const translateY = useSharedValue(startY);

    // Set initial position on note object
    useEffect(() => {
        note.position = translateY;
    }, []);

    useEffect(() => {
        // Don't start animation if game hasn't started yet
        if (Date.now() < gameStartTime) {
            return;
        }

        // Calculate when this note should hit the beat line center
        const noteTimeMs = note.timestamp * 1000; // Convert to milliseconds
        const currentTimeMs = Date.now() - gameStartTime;
        const timeToHitMs = noteTimeMs - currentTimeMs;

        // Calculate fall duration based on visual preference (6 beats to reach line)
        const beatsToReachLine = 24;
        const fallDurationMs = (NOTE_HEIGHT * 60 / (bpm)) * 1000;

        // Precise center offset calculation
        const centerOffsetMs = (NOTE_HEIGHT / 2) / (beatLineY - startY) * fallDurationMs;
        const delayMs = timeToHitMs - fallDurationMs + centerOffsetMs;

        if (delayMs < 0) return;

        let animationFrameId: number;
        let startTime: number;

        if (!isPaused) {
            const animate = (timestamp: number) => {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime;

                if (elapsed >= delayMs) {
                    translateY.value = withSequence(
                        withTiming(startY, { duration: 0 }),
                        withTiming(beatLineY, {
                            duration: fallDurationMs,
                            easing: Easing.linear,
                        }),
                        withTiming(screenHeight, {
                            duration: fallDurationMs / 2,
                            easing: Easing.linear,
                        }, (finished) => {
                            if (finished) {
                                runOnJS(onOffscreen)(note);
                            }
                        })
                    );
                } else {
                    animationFrameId = requestAnimationFrame(animate);
                }
            };

            animationFrameId = requestAnimationFrame(animate);
        }

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [note, scrollSpeed, gameStartTime, isPaused]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <Animated.View style={animatedStyle}>
            <NoteBlock
                note={note}
                position={translateY}
                laneWidth={laneWidth}
            />
        </Animated.View>
    );
}