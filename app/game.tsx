import React from 'react';
import { GameStateProvider } from '../contexts/GameStateContext';
import GameComponent from '../components/game/GameComponent';

export default function GameScreen() {
    return (
        <GameStateProvider>
            <GameComponent />
        </GameStateProvider>
    );
}
