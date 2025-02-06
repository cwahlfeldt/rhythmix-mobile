import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { SharedValue } from 'react-native-reanimated';
import type { Note } from '../../types/song';
import { NOTE_HEIGHT } from '@/constants/Global';

// Predefined colors for better performance and consistency
const LANE_COLORS = [
    '#FF3366', // Red
    '#33FF66', // Green
    '#3366FF', // Blue
] as const;

interface NoteBlockProps {
    note: Note;
    position: SharedValue<number>;
    laneWidth: number;
}

export function NoteBlock({ note, laneWidth }: NoteBlockProps) {
    const noteWidth = laneWidth * 0.8; // 80% of lane width
    const xPosition = note.lane * laneWidth + (laneWidth * 0.1); // Center in lane

    return (
        <Animated.View
            style={[
                styles.noteBlock,
                {
                    width: noteWidth,
                    left: xPosition,
                    backgroundColor: LANE_COLORS[note.lane % LANE_COLORS.length],
                }
            ]}
        />
    );
}

const styles = StyleSheet.create({
    noteBlock: {
        position: 'absolute',
        height: NOTE_HEIGHT,
        borderRadius: 2,
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 5,
    },
});