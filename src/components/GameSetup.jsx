
import React, { useState } from 'react';

function GameSetup({ players, onStartGame }) {
    const [selectedIds, setSelectedIds] = useState([]);
    const [target, setTarget] = useState(301);
    const [mode, setMode] = useState('standard'); // 'standard' or 'count_up'

    const togglePlayer = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(pid => pid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleStart = () => {
        if (selectedIds.length >= 1) {
            onStartGame({
                target,
                selectedPlayerIds: selectedIds,
                mode
            });
        }
    };

    return (
        <div className="card">
            <h2>🎮 New Game</h2>

            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-secondary)' }}>Game Mode</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => setMode('standard')}
                        className={`btn ${mode === 'standard' ? 'btn-primary' : 'btn-secondary'} `}
                    >
                        Standard (301/501)
                    </button>
                    <button
                        onClick={() => setMode('count_up')}
                        className={`btn ${mode === 'count_up' ? 'btn-primary' : 'btn-secondary'} `}
                    >
                        Count Up
                    </button>
                </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                    {mode === 'standard' ? 'Starting Score' : 'Target Score'}
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {[301, 501, 701, 1001].map(t => (
                        <button
                            key={t}
                            onClick={() => setTarget(t)}
                            className={`btn ${target === t ? 'btn-primary' : 'btn-secondary'} `}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-secondary)' }}>Select Players</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {players.map(player => (
                        <button
                            key={player.id}
                            onClick={() => togglePlayer(player.id)}
                            className={`btn ${selectedIds.includes(player.id) ? 'btn-primary' : 'btn-secondary'} `}
                            style={{ width: 'auto' }}
                        >
                            {player.name}
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={handleStart}
                disabled={selectedIds.length < 1}
                className="btn btn-primary"
                style={{ opacity: selectedIds.length < 1 ? 0.5 : 1 }}
            >
                Start Game
            </button>
        </div>
    );
}

export default GameSetup;
