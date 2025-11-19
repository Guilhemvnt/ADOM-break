import React from 'react';

function PlayerStats({ players, onBack }) {
    const calculateStats = (player) => {
        if (!player.allDarts || player.allDarts.length === 0) {
            return {
                totalDarts: 0,
                avgPerDart: 0,
                singles: 0,
                doubles: 0,
                triples: 0,
                accuracy: { singles: 0, doubles: 0, triples: 0 }
            };
        }

        const totalDarts = player.allDarts.length;
        const totalScore = player.allDarts.reduce((sum, d) => sum + (d.totalValue || 0), 0);
        const avgPerDart = totalScore / totalDarts;

        const singles = player.allDarts.filter(d => d.multiplier === 1).length;
        const doubles = player.allDarts.filter(d => d.multiplier === 2).length;
        const triples = player.allDarts.filter(d => d.multiplier === 3).length;

        return {
            totalDarts,
            avgPerDart: avgPerDart.toFixed(2),
            singles,
            doubles,
            triples,
            accuracy: {
                singles: ((singles / totalDarts) * 100).toFixed(1),
                doubles: ((doubles / totalDarts) * 100).toFixed(1),
                triples: ((triples / totalDarts) * 100).toFixed(1)
            }
        };
    };

    return (
        <div className="container">
            <div className="header">
                <h1>📊 Player Statistics</h1>
            </div>

            <button onClick={onBack} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
                ← Back to Setup
            </button>

            {players.map(player => {
                const stats = calculateStats(player);
                return (
                    <div key={player.id} className="card" style={{ marginBottom: '20px' }}>
                        <h2 style={{ marginBottom: '15px' }}>{player.name}</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                            <div style={{ textAlign: 'center', padding: '10px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Games Played</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-green)' }}>
                                    {player.stats.gamesPlayed}
                                </div>
                            </div>

                            <div style={{ textAlign: 'center', padding: '10px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Wins</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
                                    {player.stats.wins}
                                </div>
                            </div>

                            <div style={{ textAlign: 'center', padding: '10px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Win Rate</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                                    {player.stats.gamesPlayed > 0 ? ((player.stats.wins / player.stats.gamesPlayed) * 100).toFixed(1) : 0}%
                                </div>
                            </div>

                            <div style={{ textAlign: 'center', padding: '10px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Darts</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                                    {stats.totalDarts}
                                </div>
                            </div>

                            <div style={{ textAlign: 'center', padding: '10px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Avg Per Dart</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-green)' }}>
                                    {stats.avgPerDart}
                                </div>
                            </div>
                        </div>

                        <h3 style={{ marginBottom: '10px' }}>Accuracy Breakdown</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Singles</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{stats.singles}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{stats.accuracy.singles}%</div>
                            </div>

                            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Doubles</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-red)' }}>{stats.doubles}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{stats.accuracy.doubles}%</div>
                            </div>

                            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Triples</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-green)' }}>{stats.triples}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{stats.accuracy.triples}%</div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default PlayerStats;
