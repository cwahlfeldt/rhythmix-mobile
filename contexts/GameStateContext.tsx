import React, { createContext, useContext, useReducer, useMemo } from 'react';
import type { Note } from '../types/song';

export interface GameState {
    isPlaying: boolean;
    isPaused: boolean;
    gameStartTime: number;
    currentTime: number;
    pauseStartTime: number | null;
    totalPauseDuration: number;
    score: number;
    combo: number;
    lastRating: string | null;
    activeNotes: Note[];
    bpm: number;

}

export type GameAction =
    | { type: 'START_GAME'; payload: { startTime: number; notes: Note[]; bpm: number; scrollSpeed: number } }
    | { type: 'PAUSE_GAME'; payload: { pauseTime: number } }
    | { type: 'RESUME_GAME'; payload: { resumeTime: number } }
    | { type: 'UPDATE_TIME'; payload: { currentTime: number } }
    | { type: 'SCORE_NOTE'; payload: { note: Note; points: number; rating: string } }
    | { type: 'MISS_NOTE'; payload: { note: Note } }
    | { type: 'REMOVE_NOTE'; payload: { note: Note } };

const initialGameState: GameState = {
    isPlaying: false,
    isPaused: false,
    gameStartTime: 0,
    currentTime: 0,
    pauseStartTime: null,
    totalPauseDuration: 0,
    score: 0,
    combo: 0,
    lastRating: null,
    activeNotes: [],
    bpm: 0,

};

export const gameReducer = (state: GameState, action: GameAction): GameState => {
    switch (action.type) {
        case 'START_GAME':
            return {
                ...initialGameState,
                isPlaying: true,
                gameStartTime: action.payload.startTime,
                currentTime: action.payload.startTime,
                activeNotes: action.payload.notes,
                bpm: action.payload.bpm,
            };

        case 'PAUSE_GAME':
            return {
                ...state,
                isPaused: true,
                pauseStartTime: action.payload.pauseTime,
            };

        case 'RESUME_GAME':
            if (!state.pauseStartTime) return state;

            const additionalPauseDuration = action.payload.resumeTime - state.pauseStartTime;
            return {
                ...state,
                isPaused: false,
                pauseStartTime: null,
                totalPauseDuration: state.totalPauseDuration + additionalPauseDuration,
            };

        case 'UPDATE_TIME':
            return {
                ...state,
                currentTime: action.payload.currentTime,
            };

        case 'SCORE_NOTE':
            return {
                ...state,
                score: state.score + action.payload.points,
                combo: state.combo + 1,
                lastRating: action.payload.rating,
                activeNotes: state.activeNotes.filter(n => n !== action.payload.note),
            };

        case 'MISS_NOTE':
            return {
                ...state,
                combo: 0,
                lastRating: 'MISS',
                activeNotes: state.activeNotes.filter(n => n !== action.payload.note),
            };

        case 'REMOVE_NOTE':
            return {
                ...state,
                activeNotes: state.activeNotes.filter(n => n !== action.payload.note),
            };

        default:
            return state;
    }
};

const GameStateContext = createContext<{
    state: GameState;
    dispatch: React.Dispatch<GameAction>;
} | null>(null);

export const GameStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(gameReducer, initialGameState);
    const value = useMemo(() => ({ state, dispatch }), [state]);

    return (
        <GameStateContext.Provider value={value}>
            {children}
        </GameStateContext.Provider>
    );
};

export const useGameState = () => {
    const context = useContext(GameStateContext);
    if (!context) {
        throw new Error('useGameState must be used within a GameStateProvider');
    }
    return context;
};

// Utility hooks for game logic
export const useGameTime = () => {
    const { state } = useGameState();
    return state.currentTime - state.gameStartTime - state.totalPauseDuration;
};

export const useEffectiveTime = (timestamp: number) => {
    const gameTime = useGameTime();
    return timestamp * 1000 - gameTime;
};