import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

const AUDIO_WARMUP_DURATION = 3000; // 3 seconds of warmup

interface GameSetupConfig {
    onReady: () => void;
    onError: (error: Error) => void;
}

export const useGameSetup = ({ onReady, onError }: GameSetupConfig) => {
    const soundRef = useRef<Audio.Sound>();
    const warmupSoundRef = useRef<Audio.Sound>();

    useEffect(() => {
        setupGame();
        return () => {
            cleanupAudio();
        };
    }, []);

    const cleanupAudio = async () => {
        if (soundRef.current) {
            await soundRef.current.unloadAsync();
        }
        if (warmupSoundRef.current) {
            await warmupSoundRef.current.unloadAsync();
        }
    };

    const setupGame = async () => {
        try {
            // Setup audio mode
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
                shouldDuckAndroid: false,
            });

            // Initialize audio system with a short sound
            try {
                const { sound } = await Audio.Sound.createAsync(
                    require('../assets/test_song.mp3'),
                    {
                        shouldPlay: true,
                        volume: 0.01,
                        positionMillis: 0,
                        progressUpdateIntervalMillis: 50
                    }
                );
                warmupSoundRef.current = sound;

                // Stop after 100ms
                await new Promise(resolve => setTimeout(async () => {
                    await sound.stopAsync();
                    await sound.unloadAsync();
                    warmupSoundRef.current = undefined;
                    resolve(true);
                }, 100));
            } catch (e) {
                console.warn('Warmup audio failed, continuing anyway:', e);
            }

            // Load the actual song
            try {
                const { sound: songSound } = await Audio.Sound.createAsync(
                    require('../assets/test_song.mp3'),
                    { shouldPlay: false }
                );
                soundRef.current = songSound;
            } catch (e: any) {
                throw new Error(`Failed to load audio: ${e?.message || 'Unknown error'}`);
            }

            // Wait for audio system to fully initialize
            await new Promise(resolve => setTimeout(resolve, AUDIO_WARMUP_DURATION));

            onReady();
        } catch (error) {
            onError(error instanceof Error ? error : new Error('Unknown error during setup'));
        }
    };

    const startGame = async () => {
        const now = Date.now();
        await soundRef.current?.playAsync();
        return now;
    };

    const pauseGame = async () => {
        const status = await soundRef.current?.getStatusAsync();
        await soundRef.current?.pauseAsync();
        return status && 'positionMillis' in status ? status.positionMillis : 0;
    };

    const resumeGame = async (positionMillis: number) => {
        await soundRef.current?.playFromPositionAsync(positionMillis);
        return Date.now();
    };

    return {
        startGame,
        pauseGame,
        resumeGame,
    };
};
