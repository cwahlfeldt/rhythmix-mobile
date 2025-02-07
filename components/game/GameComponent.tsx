import React, { useState, useCallback } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { useGameState } from '../../contexts/GameStateContext';
import { useGameSetup } from '../../hooks/useGameSetup';
import { useScoring } from '../../hooks/useScoring';
import { GameUI } from './GameUI';
import { GameModals } from './GameModals';
import { LoadingScreen } from './LoadingScreen';
import type { SongResponse } from '../../types/song';

export default function GameComponent() {
    const { state, dispatch } = useGameState();
    const params = useLocalSearchParams();
    const songData = JSON.parse(params.songData as string) as SongResponse;
    const previousHighScore = parseInt(params.highScore as string) || 0;

    const [isLoading, setIsLoading] = useState(true);
    const [showCountdown, setShowCountdown] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState('Preparing audio...');
    const [isGameOver, setIsGameOver] = useState(false);

    // Setup game systems
    const { startGame, pauseGame, resumeGame } = useGameSetup({
        onReady: () => {
            setIsLoading(false);
            setShowCountdown(true);
        },
        onError: () => router.back(),
    });

    const { handleTap, handleMiss } = useScoring({
        beatLinePosition: 150, // Match BeatLine position
    });

    // Game state handlers
    const handleCountdownComplete = useCallback(async () => {
        setShowCountdown(false);
        const startTime = await startGame();
        dispatch({
            type: 'START_GAME',
            payload: {
                startTime,
                notes: songData.data.notes,
                bpm: songData.data.metadata.bpm,
                scrollSpeed: songData.data.metadata.recommended_scroll_speed,
            },
        });
    }, [songData, dispatch, startGame]);

    const handlePause = useCallback(async () => {
        const positionMillis = await pauseGame();
        dispatch({
            type: 'PAUSE_GAME',
            payload: { pauseTime: Date.now() },
        });
    }, [dispatch, pauseGame]);

    const handleResume = useCallback(() => {
        setShowCountdown(true);
    }, []);

    const handleResumeAfterCountdown = useCallback(async () => {
        const resumeTime = await resumeGame(state.currentTime);
        dispatch({
            type: 'RESUME_GAME',
            payload: { resumeTime },
        });
    }, [state.currentTime, dispatch, resumeGame]);

    const handleQuit = useCallback(() => {
        router.back();
    }, []);

    if (isLoading) {
        return <LoadingScreen status={loadingStatus} />;
    }

    return (
        <>
            <GameUI
                songName={songData.data.metadata.name}
                score={state.score}
                combo={state.combo}
                lastRating={state.lastRating}
                showCountdown={showCountdown}
                isPaused={state.isPaused}
                bpm={songData.data.metadata.bpm}
                notes={state.activeNotes}
                onPause={handlePause}
                onTap={handleTap}
                onCountdownComplete={
                    state.isPaused ? handleResumeAfterCountdown : handleCountdownComplete
                }
                onNoteOffscreen={handleMiss}
            />

            <GameModals
                isPaused={state.isPaused}
                isGameOver={isGameOver}
                showCountdown={showCountdown}
                score={state.score}
                previousHighScore={previousHighScore}
                onResume={handleResume}
                onQuit={handleQuit}
            />
        </>
    );
}
