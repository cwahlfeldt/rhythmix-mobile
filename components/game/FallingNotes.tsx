import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import type { Note } from '../../types/song';
import { NoteBlock } from './NoteBlock';
import { useNoteAnimation } from '../../hooks/useNoteAnimation';
import { useGameState } from '../../contexts/GameStateContext';

interface FallingNotesProps {
    notes: Note[];
    laneWidth: number;
    onNoteOffscreen: (note: Note) => void;
}

export function FallingNotes({ notes, laneWidth, onNoteOffscreen }: FallingNotesProps) {
    const { state } = useGameState();

    return (
        <View style={StyleSheet.absoluteFill}>
            {notes.map((note) => (
                <AnimatedNoteMemo
                    key={`${note.timestamp}-${note.lane}`}
                    note={note}
                    laneWidth={laneWidth}
                    onOffscreen={onNoteOffscreen}
                />
            ))}
        </View>
    );
}

interface AnimatedNoteProps {
    note: Note;
    laneWidth: number;

    onOffscreen: (note: Note) => void;
}

function AnimatedNote({ note, laneWidth, onOffscreen }: AnimatedNoteProps) {
    const { state } = useGameState();
    const translateY = useNoteAnimation(note, {
        bpm: state.bpm,
        onOffscreen,
    });

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

const AnimatedNoteMemo = React.memo(AnimatedNote);
