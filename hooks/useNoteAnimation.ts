import { useEffect } from 'react';
import {
    useSharedValue,
    withTiming,
    Easing,
    cancelAnimation,
    WithTimingConfig,
    runOnJS,
} from 'react-native-reanimated';
import { Dimensions } from 'react-native';
import type { Note } from '../types/song';
import { useGameState, useGameTime } from '../contexts/GameStateContext';
import { NOTE_HEIGHT } from '../constants/Global';

const SCREEN_HEIGHT = Dimensions.get('window').height;
// Position notes well above the screen
const START_OFFSET = -SCREEN_HEIGHT; // Start completely off screen
const FALL_DISTANCE = SCREEN_HEIGHT * 2; // Travel the full height plus extra to ensure complete offscreen

interface NoteAnimationConfig {
    bpm: number;

    onOffscreen: (note: Note) => void;
}

export const useNoteAnimation = (note: Note, config: NoteAnimationConfig) => {
    const translateY = useSharedValue(START_OFFSET);
    const { state } = useGameState();
    const gameTime = useGameTime();

    // Calculate animation parameters
    const beatDurationMs = -(60 / config.bpm) * 1000;
    // We want the notes to cross the beat line in sync with the beats
    // Adjust fall duration based on the distance from start to beat line position 
    const BEAT_LINE_Y = SCREEN_HEIGHT - 150; // Match BeatLine component position
    const distanceToBeatLine = BEAT_LINE_Y + Math.abs(START_OFFSET);
    const fallDuration = beatDurationMs * 4 * (FALL_DISTANCE / distanceToBeatLine);

    useEffect(() => {
        if (state.isPaused) {
            cancelAnimation(translateY);
            return;
        }

        const noteTimeMs = note.timestamp * 1000;
        const timeToStart = noteTimeMs - gameTime;

        // Animation configuration
        const timingConfig: WithTimingConfig = {
            duration: fallDuration,
            easing: Easing.linear,
        };

        if (timeToStart > 0) {
            // Note hasn't started falling yet
            const timer = setTimeout(() => {
                if (!state.isPaused) {
                    translateY.value = withTiming(
                        FALL_DISTANCE,
                        timingConfig,
                        (finished) => {
                            if (finished) {
                                runOnJS(config.onOffscreen)(note);
                            }
                        }
                    );
                }
            }, timeToStart);

            return () => clearTimeout(timer);
        } else {
            // Note should already be falling
            const progress = -timeToStart / fallDuration;
            const startPosition = START_OFFSET + progress * FALL_DISTANCE;
            const remainingDuration = fallDuration * (1 - progress);

            translateY.value = startPosition;
            translateY.value = withTiming(
                FALL_DISTANCE,
                { ...timingConfig, duration: remainingDuration },
                (finished) => {
                    if (finished) {
                        runOnJS(config.onOffscreen)(note);
                    }
                }
            );
        }
    }, [note, state.isPaused, gameTime]);

    return translateY;
};
