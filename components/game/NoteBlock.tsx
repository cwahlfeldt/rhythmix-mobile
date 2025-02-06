import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Note } from '../../types/song';
import { NOTE_HEIGHT } from '@/constants/Global';

interface NoteBlockProps {
    note: Note;
    position: SharedValue<number>;
    laneWidth: number;
}

export function NoteBlock({ note, position, laneWidth }: NoteBlockProps) {
    // Calculate color based on lane (3 lanes)
    const getColor = (lane: number) => {
        const colors = [
            '#FF3366', // Pink/Red
            '#33FF66', // Bright Green
            '#3366FF', // Bright Blue
        ];
        return colors[lane];
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: position.value }],
    }));

    return (
        <Animated.View
            style={[
                styles.noteBlock,
                {
                    width: laneWidth * 0.8, // 80% of lane width
                    backgroundColor: getColor(note.lane),
                    left: note.lane * laneWidth + (laneWidth * 0.1), // Center in lane
                },
                animatedStyle,
            ]}
        />
    );
}

const styles = StyleSheet.create({
    noteBlock: {
        position: 'absolute',
        height: NOTE_HEIGHT, // Match beat line height
        borderRadius: 2,
        shadowColor: '#fff',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 5,
    },
});