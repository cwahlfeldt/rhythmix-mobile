import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

interface BeatLineProps {
    laneWidth: number;
    numberOfLanes: number;
}

export function BeatLine({ laneWidth, numberOfLanes }: BeatLineProps) {
    const totalWidth = laneWidth * numberOfLanes;

    return (
        <View style={styles.container}>
            {/* Lane backgrounds */}
            <View style={[styles.lanesContainer, { width: totalWidth }]}>
                {Array.from({ length: numberOfLanes }).map((_, index) => (
                    <View
                        key={`lane-${index}`}
                        style={[
                            styles.laneBackground,
                            {
                                width: laneWidth,
                                left: index * laneWidth,
                                backgroundColor: `rgba(255, 255, 255, ${index % 2 ? 0.05 : 0.03})`
                            }
                        ]}
                    />
                ))}
            </View>

            {/* Beat line */}
            <View style={[styles.line, { width: totalWidth }]} />

            {/* Lane dividers */}
            <View style={[styles.dividerContainer, { width: totalWidth }]}>
                {Array.from({ length: numberOfLanes + 1 }).map((_, index) => (
                    <View
                        key={`divider-${index}`}
                        style={[styles.divider, { left: index * laneWidth }]}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 150,
        alignItems: 'center',
        width: '100%',
    },
    lanesContainer: {
        position: 'absolute',
        height: '100%',
        bottom: 0,
    },
    laneBackground: {
        position: 'absolute',
        height: '100%',
        bottom: 0,
    },
    line: {
        height: 4,
        backgroundColor: '#fff',
        borderRadius: 2,
        ...Platform.select({
            ios: {
                shadowColor: '#fff',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 10,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    dividerContainer: {
        position: 'absolute',
        height: 20,
        flexDirection: 'row',
    },
    divider: {
        position: 'absolute',
        width: 2,
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        ...Platform.select({
            ios: {
                shadowColor: '#fff',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.3,
                shadowRadius: 3,
            },
            android: {
                elevation: 3,
            },
        }),
    },
});