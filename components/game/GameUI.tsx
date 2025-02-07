import React from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import type { Note } from '../../types/song';
import { ThemedText } from '../../components/ThemedText';
import { BeatLine } from '../../components/game/BeatLine';
import { ScoreDisplay } from '../../components/game/ScoreDisplay';
import { FallingNotes } from '../../components/game/FallingNotes';
import { CountdownOverlay } from '../../components/game/CountdownOverlay';

const NUMBER_OF_LANES = 3;
const LANE_WIDTH = Dimensions.get('window').width / NUMBER_OF_LANES;

interface GameUIProps {
    songName: string;
    score: number;
    combo: number;
    lastRating: string | null;
    showCountdown: boolean;
    isPaused: boolean;
    bpm: number;
    notes: Note[];

    onPause: () => void;
    onTap: (lane: number) => void;
    onCountdownComplete: () => void;
    onNoteOffscreen: (note: Note) => void;
}

export function GameUI({
    songName,
    score,
    combo,
    lastRating,
    showCountdown,
    isPaused,
    bpm,
    onPause,
    onTap,
    onCountdownComplete,
    notes,
    onNoteOffscreen,
}: GameUIProps) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <ThemedText style={styles.songName}>{songName}</ThemedText>
                <Pressable onPress={onPause} style={styles.pauseButton}>
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
                    notes={notes}
                    laneWidth={LANE_WIDTH}
                    onNoteOffscreen={onNoteOffscreen}
                />

                <View style={styles.laneContainer}>
                    {Array.from({ length: NUMBER_OF_LANES }).map((_, index) => (
                        <Pressable
                            key={index}
                            style={styles.lane}
                            onPress={() => onTap(index)}
                        />
                    ))}
                </View>

                <CountdownOverlay
                    isVisible={showCountdown}
                    onComplete={onCountdownComplete}
                    bpm={bpm}
                />
            </View>
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
});
