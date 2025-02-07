import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemedText } from '../../components/ThemedText';

interface LoadingScreenProps {
    status: string;
}

export function LoadingScreen({ status }: LoadingScreenProps) {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" style={styles.loadingSpinner} />
            <ThemedText style={styles.loadingText}>{status}</ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingSpinner: {
        marginBottom: 20,
    },
    loadingText: {
        fontSize: 18,
        textAlign: 'center',
    },
});
