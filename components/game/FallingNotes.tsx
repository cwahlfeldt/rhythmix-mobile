import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withTiming,
    useSharedValue,
    runOnJS,
    Easing,
    cancelAnimation,
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
    isPaused: boolean;
    bpm: number;
}

export function FallingNotes({
    notes,
    laneWidth,
    gameStartTime,
    onNoteOffscreen,
    isPaused,
    bpm,
}: FallingNotesProps) {
    const pausedPositions = React.useRef(new Map<string, number>());
    const pauseStartTime = React.useRef<number>(0);
    const totalPauseDuration = React.useRef<number>(0);

    return (
        <View style={StyleSheet.absoluteFill}>
            {notes.map((note) => (
                <AnimatedNote
                    key={`${note.timestamp}-${note.lane}`}
                    note={note}
                    laneWidth={laneWidth}
                    gameStartTime={gameStartTime}
                    onOffscreen={onNoteOffscreen}
                    isPaused={isPaused}
                    bpm={bpm}
                    pausedPositions={pausedPositions.current}
                    pauseStartTime={pauseStartTime}
                    totalPauseDuration={totalPauseDuration}
                />
            ))}
        </View>
    );
}

interface AnimatedNoteProps {
    note: Note;
    laneWidth: number;
    gameStartTime: number;
    onOffscreen: (note: Note) => void;
    isPaused: boolean;
    bpm: number;
    pausedPositions: Map<string, number>;
    pauseStartTime: React.MutableRefObject<number>;
    totalPauseDuration: React.MutableRefObject<number>;
}

function AnimatedNote({
    note,
    laneWidth,
    gameStartTime,
    onOffscreen,
    isPaused,
    bpm,
    pausedPositions,
    pauseStartTime,
    totalPauseDuration,
}: AnimatedNoteProps) {
    const translateY = useSharedValue(-NOTE_HEIGHT);
    const noteKey = `${note.timestamp}-${note.lane}`;
    const animationStarted = React.useRef(false);

    // Set initial position on note object for hit detection
    React.useEffect(() => {
        note.position = translateY;
    }, []);

    React.useEffect(() => {
        if (isPaused) {
            if (!pauseStartTime.current) {
                pauseStartTime.current = Date.now();
            }
            pausedPositions.set(noteKey, translateY.value);
            cancelAnimation(translateY);
            return;
        } else if (pauseStartTime.current) {
            // Update total pause duration when resuming
            totalPauseDuration.current += Date.now() - pauseStartTime.current;
            pauseStartTime.current = 0;
        }

        // Calculate timing including pause compensation
        const effectiveGameTime = Date.now() - gameStartTime - totalPauseDuration.current;
        const noteTimeMs = note.timestamp * 1000;
        const timeToStart = noteTimeMs - effectiveGameTime;

        // Calculate animation parameters
        const beatDurationMs = (60 / bpm) * 1000;
        const fallDuration = beatDurationMs * 4; // Time to fall full distance

        // If note hasn't started falling yet and isn't scheduled
        if (!animationStarted.current && timeToStart > 0) {
            setTimeout(() => {
                if (!isPaused) {
                    translateY.value = withTiming(800, {
                        duration: fallDuration,
                        easing: Easing.linear,
                    }, (finished) => {
                        if (finished) {
                            runOnJS(onOffscreen)(note);
                        }
                    });
                }
            }, timeToStart);
            animationStarted.current = true;
        }
        // If note was paused, resume from paused position
        else if (pausedPositions.has(noteKey)) {
            const currentPos = pausedPositions.get(noteKey)!;
            const remainingDistance = 800 - currentPos;
            const remainingDuration = (remainingDistance / (800 + NOTE_HEIGHT)) * fallDuration;

            translateY.value = currentPos;
            translateY.value = withTiming(800, {
                duration: remainingDuration,
                easing: Easing.linear,
            }, (finished) => {
                if (finished) {
                    runOnJS(onOffscreen)(note);
                }
            });
            pausedPositions.delete(noteKey);
        }
        // If note should already be falling (negative timeToStart)
        else if (!animationStarted.current && timeToStart <= 0) {
            const elapsedTime = -timeToStart;
            const progress = elapsedTime / fallDuration;
            const startPosition = -NOTE_HEIGHT + progress * (800 + NOTE_HEIGHT);
            const remainingDuration = fallDuration * (1 - progress);

            translateY.value = startPosition;
            translateY.value = withTiming(800, {
                duration: remainingDuration,
                easing: Easing.linear,
            }, (finished) => {
                if (finished) {
                    runOnJS(onOffscreen)(note);
                }
            });
            animationStarted.current = true;
        }

    }, [note, gameStartTime, isPaused, bpm]);

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