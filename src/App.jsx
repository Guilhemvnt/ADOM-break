import React, { useState, useEffect } from 'react';
import PlayerManager from './components/PlayerManager';
import GameSetup from './components/GameSetup';
import Scoreboard from './components/Scoreboard';
import PlayerStats from './components/PlayerStats';
import { uploadGameStats } from './services/googleSheets';

function App() {
    const [players, setPlayers] = useState(() => {
        const saved = localStorage.getItem('darts_players');
        return saved ? JSON.parse(saved) : [];
    });

    const [gameState, setGameState] = useState('setup'); // setup, playing, stats
    const [gameSettings, setGameSettings] = useState({
        target: 301,
        selectedPlayerIds: []
    });

    const [currentMatch, setCurrentMatch] = useState(null);

    useEffect(() => {
        localStorage.setItem('darts_players', JSON.stringify(players));
    }, [players]);

    const addPlayer = (name) => {
        const newPlayer = {
            id: Date.now().toString(),
            name,
            stats: { gamesPlayed: 0, wins: 0 },
            allDarts: [] // Store all darts thrown by this player
        };
        setPlayers([...players, newPlayer]);
    };

    const startGame = (settings) => {
        setGameSettings(settings);
        const matchPlayers = settings.selectedPlayerIds.map(id => {
            const p = players.find(pl => pl.id === id);
            return {
                ...p,
                score: settings.mode === 'count_up' ? 0 : settings.target,
                dartsThrown: 0,
                history: []
            };
        });

        setCurrentMatch({
            players: matchPlayers,
            currentPlayerIndex: 0,
            startTime: new Date().toISOString(),
            mode: settings.mode, // 'standard' or 'count_up'
            target: settings.target
        });
        setGameState('playing');
    };

    const handleGameFinish = async (winnerId, stats) => {
        // Update local stats and save detailed dart data
        const updatedPlayers = players.map(p => {
            if (gameSettings.selectedPlayerIds.includes(p.id)) {
                const playerStats = stats.find(s => s.id === p.id);
                const playerDarts = playerStats ? playerStats.history.filter(d => d && typeof d === 'object') : [];

                return {
                    ...p,
                    stats: {
                        gamesPlayed: p.stats.gamesPlayed + 1,
                        wins: p.id === winnerId ? p.stats.wins + 1 : p.stats.wins
                    },
                    allDarts: [...(p.allDarts || []), ...playerDarts]
                };
            }
            return p;
        });
        setPlayers(updatedPlayers);

        // Upload to Google Sheets
        const winner = players.find(p => p.id === winnerId);
        try {
            await uploadGameStats({
                date: new Date().toISOString(),
                winner: winner.name,
                target: gameSettings.target,
                players: stats.map(s => s.name).join(', '),
                dartsThrown: stats.find(s => s.id === winnerId).dartsThrown
            });
            alert('Game saved to cloud!');
        } catch (e) {
            console.error('Upload failed', e);
            alert('Failed to upload stats, but game is saved locally.');
        }

        setGameState('setup');
    };

    return (
        <div className="container">
            <div className="header">
                <h1>🎯 Pro Darts Scorer</h1>
            </div>

            {gameState === 'setup' && (
                <>
                    <PlayerManager players={players} onAddPlayer={addPlayer} />
                    {players.length >= 2 && (
                        <GameSetup
                            players={players}
                            onStartGame={startGame}
                        />
                    )}
                    {players.length > 0 && (
                        <button
                            onClick={() => setGameState('stats')}
                            className="btn btn-secondary"
                            style={{ marginTop: '20px' }}
                        >
                            📊 View Statistics
                        </button>
                    )}
                </>
            )}

            {gameState === 'stats' && (
                <PlayerStats
                    players={players}
                    onBack={() => setGameState('setup')}
                />
            )}

            {gameState === 'playing' && currentMatch && (
                <Scoreboard
                    initialMatch={currentMatch}
                    onFinish={handleGameFinish}
                    onCancel={() => setGameState('setup')}
                />
            )}
        </div>
    );
}

export default App;
