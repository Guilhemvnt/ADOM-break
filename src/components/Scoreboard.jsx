
import React, { useState } from 'react';
import { getCheckoutGuide } from '../utils/checkouts';
import Dartboard from './Dartboard';

function Scoreboard({ initialMatch, onFinish, onCancel }) {
    const [match, setMatch] = useState(initialMatch);
    const [multiplier, setMultiplier] = useState(1); // 1, 2, 3
    const [roundDarts, setRoundDarts] = useState([]); // Array of dart objects: {score, multiplier, totalValue}
    const [inputMode, setInputMode] = useState('keyboard'); // 'keyboard' or 'dartboard'

    const currentPlayer = match.players[match.currentPlayerIndex];
    const currentRoundScore = roundDarts.reduce((a, b) => a + b.totalValue, 0);

    let remainingScore;
    if (match.mode === 'count_up') {
        remainingScore = match.target - (currentPlayer.score + currentRoundScore);
    } else {
        remainingScore = currentPlayer.score - currentRoundScore;
    }

    const checkoutSuggestion = match.mode === 'count_up' ? null : getCheckoutGuide(remainingScore);

    const handleScoreClick = (baseScore, directMultiplier = null) => {
        if (roundDarts.length >= 3) return;

        let finalMultiplier = directMultiplier || multiplier;
        let finalScore = baseScore * finalMultiplier;

        // Validate Triple 25 (doesn't exist, max is Double 25 = 50)
        if (baseScore === 25 && finalMultiplier === 3) {
            alert("Triple Bull doesn't exist!");
            setMultiplier(1);
            return;
        }

        const dartObject = {
            score: baseScore,
            multiplier: finalMultiplier,
            totalValue: finalScore,
            dartNumber: roundDarts.length + 1,
            timestamp: new Date().toISOString()
        };

        const newRoundDarts = [...roundDarts, dartObject];
        const newRoundTotal = newRoundDarts.reduce((a, b) => a + b.totalValue, 0);

        if (match.mode === 'count_up') {
            // Count Up Mode: Add score
            const potentialScore = currentPlayer.score + newRoundTotal;

            if (potentialScore >= match.target) {
                // Win condition for Count Up (Reach or exceed target)
                finishGame(newRoundDarts);
            } else {
                setRoundDarts(newRoundDarts);
                setMultiplier(1);

                // Auto-advance after 3 darts
                if (newRoundDarts.length === 3) {
                    setTimeout(() => confirmRound(), 500);
                }
            }
        } else {
            // Standard Mode: Subtract score
            // Check for Bust
            if (currentPlayer.score - newRoundTotal < 0 || currentPlayer.score - newRoundTotal === 1) {
                // BUST
                alert("BUST!");
                nextTurn(match.players, false);
            } else if (currentPlayer.score - newRoundTotal === 0) {
                // Checkout
                finishGame(newRoundDarts);
            } else {
                setRoundDarts(newRoundDarts);
                setMultiplier(1);

                // Auto-advance after 3 darts
                if (newRoundDarts.length === 3) {
                    setTimeout(() => confirmRound(), 500);
                }
            }
        }
    };

    const finishGame = (finalDarts) => {
        const finalRoundScore = finalDarts.reduce((a, b) => a + b.totalValue, 0);
        let updatedPlayers = [...match.players];
        updatedPlayers[match.currentPlayerIndex] = {
            ...currentPlayer,
            score: match.mode === 'count_up' ? currentPlayer.score + finalRoundScore : 0,
            dartsThrown: currentPlayer.dartsThrown + finalDarts.length,
            history: [...currentPlayer.history, ...finalDarts]
        };
        onFinish(currentPlayer.id, updatedPlayers);
    };

    const confirmRound = (darts = null) => {
        const dartsToConfirm = darts || roundDarts;
        const roundTotal = dartsToConfirm.reduce((a, b) => a + b.totalValue, 0);
        let updatedPlayers = [...match.players];

        const newScore = match.mode === 'count_up'
            ? currentPlayer.score + roundTotal
            : currentPlayer.score - roundTotal;

        updatedPlayers[match.currentPlayerIndex] = {
            ...currentPlayer,
            score: newScore,
            dartsThrown: currentPlayer.dartsThrown + dartsToConfirm.length,
            history: [...currentPlayer.history, ...dartsToConfirm]
        };

        nextTurn(updatedPlayers);
    };

    const nextTurn = (updatedPlayers, saveScore = true) => {
        let finalPlayers = updatedPlayers;
        if (!saveScore) {
            // Revert score update, but add darts thrown
            finalPlayers = [...match.players];
            finalPlayers[match.currentPlayerIndex] = {
                ...currentPlayer,
                dartsThrown: currentPlayer.dartsThrown + 3,
                history: [...currentPlayer.history, { score: 0, multiplier: 0, totalValue: 0, bust: true }]
            };
        }

        let nextPlayerIndex = (match.currentPlayerIndex + 1) % match.players.length;
        setMatch({
            ...match,
            players: finalPlayers,
            currentPlayerIndex: nextPlayerIndex
        });
        setRoundDarts([]);
        setMultiplier(1);
    };

    const undoLastDart = () => {
        if (roundDarts.length > 0) {
            setRoundDarts(roundDarts.slice(0, -1));
        }
    };

    return (
        <div className="container" style={{ padding: '10px', maxWidth: '100%' }}>
            {/* Players Score Strip */}
            <div style={{
                display: 'flex',
                overflowX: 'auto',
                gap: '10px',
                marginBottom: '15px',
                paddingBottom: '5px'
            }}>
                {match.players.map((p, idx) => (
                    <div key={p.id} style={{
                        minWidth: '80px',
                        padding: '8px',
                        borderRadius: '8px',
                        backgroundColor: idx === match.currentPlayerIndex ? 'var(--accent-green)' : 'var(--bg-secondary)',
                        color: idx === match.currentPlayerIndex ? '#000' : 'var(--text-primary)',
                        textAlign: 'center',
                        border: '1px solid var(--border-color)'
                    }}>
                        <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{p.name}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{p.score}</div>
                    </div>
                ))}
            </div>

            {/* Current Round Status */}
            <div className="card" style={{ marginBottom: '15px', textAlign: 'center', padding: '15px' }}>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '5px' }}>Current Round</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
                    {[0, 1, 2].map(i => (
                        <div key={i} style={{
                            width: '35px', height: '35px',
                            borderRadius: '50%',
                            border: '2px solid var(--border-color)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backgroundColor: roundDarts[i] !== undefined ? 'var(--bg-primary)' : 'transparent',
                            fontWeight: 'bold',
                            fontSize: '0.9rem'
                        }}>
                            {roundDarts[i] !== undefined ? roundDarts[i].totalValue : ''}
                        </div>
                    ))}
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
                    To Go: {remainingScore}
                </div>
                {checkoutSuggestion && (
                    <div style={{
                        marginTop: '10px',
                        padding: '8px',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        borderRadius: '6px',
                        color: 'var(--accent-green)',
                        fontWeight: 'bold'
                    }}>
                        Aim for: {checkoutSuggestion}
                    </div>
                )}
            </div>

            {/* Input Mode Toggle */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px', gap: '10px' }}>
                <button
                    onClick={() => setInputMode('keyboard')}
                    className={`btn ${inputMode === 'keyboard' ? 'btn-primary' : 'btn-secondary'} `}
                    style={{ width: 'auto' }}
                >
                    ⌨️ Keyboard
                </button>
                <button
                    onClick={() => setInputMode('dartboard')}
                    className={`btn ${inputMode === 'dartboard' ? 'btn-primary' : 'btn-secondary'} `}
                    style={{ width: 'auto' }}
                >
                    🎯 Dartboard
                </button>
            </div>

            {/* Controls */}
            {inputMode === 'dartboard' ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Dartboard onThrow={(score, mult) => handleScoreClick(score, mult)} />
                    <div style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '400px' }}>
                        <button
                            onClick={() => handleScoreClick(0, 1)}
                            className="btn btn-secondary"
                        >
                            MISS
                        </button>
                        <button
                            onClick={undoLastDart}
                            className="btn btn-danger"
                            disabled={roundDarts.length === 0}
                        >
                            UNDO
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '10px' }}>
                    {/* Multipliers */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <button
                            onClick={() => setMultiplier(multiplier === 2 ? 1 : 2)}
                            className={`btn ${multiplier === 2 ? 'btn-primary' : 'btn-secondary'} `}
                        >
                            DOUBLE
                        </button>
                        <button
                            onClick={() => setMultiplier(multiplier === 3 ? 1 : 3)}
                            className={`btn ${multiplier === 3 ? 'btn-primary' : 'btn-secondary'} `}
                        >
                            TRIPLE
                        </button>
                    </div>

                    {/* Number Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                        {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                            <button
                                key={num}
                                onClick={() => handleScoreClick(num)}
                                className="btn btn-secondary"
                                style={{ padding: '12px 0', fontSize: '1rem' }}
                            >
                                {num}
                            </button>
                        ))}
                        {/* Bullseye row */}
                        <button
                            onClick={() => handleScoreClick(25)}
                            className="btn btn-secondary"
                            style={{ gridColumn: 'span 2', color: 'var(--accent-red)' }}
                        >
                            BULL (25)
                        </button>
                        <button
                            onClick={() => handleScoreClick(0)}
                            className="btn btn-secondary"
                            style={{ gridColumn: 'span 1' }}
                        >
                            MISS
                        </button>
                        <button
                            onClick={undoLastDart}
                            className="btn btn-danger"
                            style={{ gridColumn: 'span 2' }}
                            disabled={roundDarts.length === 0}
                        >
                            UNDO
                        </button>
                    </div>
                </div>
            )}

            {/* Validate Round Button - only show if there are darts but less than 3 */}
            {roundDarts.length > 0 && roundDarts.length < 3 && (
                <button
                    onClick={() => confirmRound()}
                    className="btn btn-primary"
                    style={{ marginTop: '20px', padding: '15px', fontSize: '1rem' }}
                >
                    ✓ Validate Round ({currentRoundScore})
                </button>
            )}

            {/* Exit Button at Bottom */}
            <button onClick={onCancel} className="btn btn-secondary" style={{ marginTop: '30px', padding: '12px' }}>
                Exit Game
            </button>
        </div>
    );
}


export default Scoreboard;
