import React from 'react';
import { View, StyleSheet } from 'react-native';

// Generate a grid of randomly colored squares for the background
export function generateProceduralBackground() {
    const rows = 8;
    const cols = 6;
    const squares = [];
    const colors = [
        '#FF3366', // Pink
        '#FF6B6B', // Coral
        '#4ECDC4', // Turquoise
        '#45B7D1', // Light Blue
        '#96CEB4', // Mint
        '#FFEEAD', // Light Yellow
    ];

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const size = Math.random() * 50 + 50; // Random size between 50 and 100
            const rotation = Math.random() * 360; // Random rotation
            const color = colors[Math.floor(Math.random() * colors.length)];
            const opacity = Math.random() * 0.5 + 0.1; // Random opacity between 0.1 and 0.6

            squares.push(
                <View
                    key={`${i}-${j}`}
                    style={[
                        styles.square,
                        {
                            width: size,
                            height: size,
                            backgroundColor: color,
                            opacity,
                            transform: [
                                { rotate: `${rotation}deg` },
                                { scale: Math.random() * 0.5 + 0.5 }, // Random scale between 0.5 and 1
                            ],
                            position: 'absolute',
                            left: (j * 150) - 50 + (Math.random() * 50), // Add some random offset
                            top: (i * 150) - 50 + (Math.random() * 50),
                        },
                    ]}
                />
            );
        }
    }

    return squares;
}

const styles = StyleSheet.create({
    square: {
        borderRadius: 8,
    },
});