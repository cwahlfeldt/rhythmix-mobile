import { useCallback } from 'react';
import { useGameState } from '../contexts/GameStateContext';
import { calculateScore } from '../utils/scoring';
import { NOTE_HEIGHT } from '../constants/Global';
import type { Note } from '../types/song';

interface ScoringConfig {
    beatLinePosition: number;
}

export const useScoring = ({ beatLinePosition }: ScoringConfig) => {
    const { state, dispatch } = useGameState();

    const handleTap = useCallback((lane: number) => {
        if (state.isPaused) return;

        const notesInLane = state.activeNotes.filter(note => note.lane === lane);
        if (notesInLane.length === 0) return;

        // Find the nearest note to the beat line
        const nearestNote = notesInLane.reduce((nearest, note) => {
            if (!nearest) return note;

            // Get current Y positions
            const notePos = note.position?.value ?? 0;
            const nearestPos = nearest.position?.value ?? 0;

            // Calculate distances from beat line
            const currentDiff = Math.abs(notePos - beatLinePosition);
            const nearestDiff = Math.abs(nearestPos - beatLinePosition);

            return currentDiff < nearestDiff ? note : nearest;
        });

        if (!nearestNote) return;

        // Calculate timing based on position
        const notePos = nearestNote.position?.value ?? 0;
        const distanceFromBeatLine = notePos - beatLinePosition;

        // Convert distance to timing (ms)
        // NOTE_HEIGHT represents one beat duration in pixels
        const beatDurationMs = (60 / state.bpm) * 1000;
        const timingDiff = (distanceFromBeatLine / NOTE_HEIGHT) * beatDurationMs;

        const { points, rating } = calculateScore(timingDiff);

        if (rating !== 'MISS') {
            dispatch({
                type: 'SCORE_NOTE',
                payload: {
                    note: nearestNote,
                    points,
                    rating,
                },
            });
        }
    }, [state.isPaused, state.activeNotes, state.bpm, beatLinePosition, dispatch]);

    const handleMiss = useCallback((note: Note) => {
        dispatch({
            type: 'MISS_NOTE',
            payload: { note },
        });
    }, [dispatch]);

    return {
        handleTap,
        handleMiss,
    };
};
