import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '../components/ThemedText';
import { SongListItem } from '../components/SongListItem';
import type { SongResponse } from '../types/song';
import testSong from '../assets/test_song.json';

export default function SongsScreen() {
    const [songs, setSongs] = useState<SongResponse[]>([]);
    const [highScores, setHighScores] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSongsAndScores();
    }, []);

    const loadSongsAndScores = async () => {
        try {
            // Load test song
            setSongs([testSong as unknown as SongResponse]);

            // Load high scores
            const scores = await AsyncStorage.getItem('highScores');
            if (scores) {
                setHighScores(JSON.parse(scores));
            }
        } catch (error) {
            console.error('Error loading songs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSongSelect = (song: SongResponse) => {
        router.push({
            pathname: '/game',
            params: {
                songData: JSON.stringify(song),
                highScore: highScores[song.data.metadata.name] || 0,
            },
        });
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ThemedText>Loading songs...</ThemedText>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <ThemedText style={styles.title}>SELECT SONG</ThemedText>
            </View>

            <ScrollView style={styles.songList}>
                {songs.map((song, index) => (
                    <SongListItem
                        key={index}
                        song={song.data}
                        highScore={highScores[song.data.metadata.name]}
                        onPress={() => handleSongSelect(song)}
                    />
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    songList: {
        flex: 1,
        paddingTop: 16,
    },
});