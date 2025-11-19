import React, { useState } from 'react';

function PlayerManager({ players, onAddPlayer }) {
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            onAddPlayer(name.trim());
            setName('');
        }
    };

    return (
        <div className="card">
            <h2>👥 Players</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter player name..."
                />
                <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>
                    Add
                </button>
            </form>

            <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
                {players.map(player => (
                    <div key={player.id} style={{
                        background: 'var(--bg-primary)',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontWeight: 'bold', color: 'var(--accent-green)' }}>{player.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            Wins: {player.stats.wins}
                        </div>
                    </div>
                ))}
                {players.length === 0 && (
                    <div style={{ color: 'var(--text-secondary)', gridColumn: '1/-1', textAlign: 'center' }}>
                        No players added yet.
                    </div>
                )}
            </div>
        </div>
    );
}

export default PlayerManager;
