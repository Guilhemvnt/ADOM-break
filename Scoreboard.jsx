
import React, { useState } from 'react';
import { getCheckoutGuide } from '../utils/checkouts';
import Dartboard from './Dartboard';

// Component for editing a turn's darts
function TurnEditor({ turn, onSave, onCancel }) {
    const [editedDarts, setEditedDarts] = useState([...turn.darts]);

    const updateDart = (dartIndex, field, value) => {
        const newDarts = [...editedDarts];
        newDarts[dartIndex] = {
            ...newDarts[dartIndex],
            [field]: value,
            totalValue: field === 'score' || field === 'multiplier'
                ? (field === 'score' ? value : newDarts[dartIndex].score) * (field === 'multiplier' ? value : newDarts[dartIndex].multiplier)
                : newDarts[dartIndex].totalValue
        };
        setEditedDarts(newDarts);
    };

    const addDart = () => {
        if (editedDarts.length < 3) {
            setEditedDarts([...editedDarts, { score: 0, multiplier: 1, totalValue: 0 }]);
        }
    };

    const removeDart = (dartIndex) => {
        setEditedDarts(editedDarts.filter((_, idx) => idx !== dartIndex));
    };

    return (
        <div>
            <div style={{ fontWeight: 'bold', marginBottom: '10px', color: 'var(--accent-gold)' }}>
                Editing Turn {turn.turnNumber} - {turn.playerName}
            </div>
            {editedDarts.map((dart, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.85rem', minWidth: '50px' }}>Dart {idx + 1}:</div>
                    <select
                        value={dart.multiplier}
                        onChange={(e) => updateDart(idx, 'multiplier', parseInt(e.target.value))}
                        style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-color)'
                        }}
                    >
                        <option value={1}>Single</option>
                        <option value={2}>Double</option>
                        <option value={3}>Triple</option>
                    </select>
                    <input
                        type="number"
                        min="0"
                        max="25"
                        value={dart.score}
                        onChange={(e) => updateDart(idx, 'score', parseInt(e.target.value) || 0)}
                        style={{
                            width: '60px',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-color)'
                        }}
                    />
                    <div style={{ fontSize: '0.85rem', minWidth: '40px' }}>= {dart.totalValue}</div>
                    <button
                        onClick={() => removeDart(idx)}
                        className="btn btn-danger"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                    >
                        ✕
                    </button>
                </div>
            ))}
            {editedDarts.length < 3 && (
                <button
                    onClick={addDart}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.85rem', marginBottom: '10px' }}
                >
                    + Add Dart
                </button>
            )}
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button
                    onClick={() => onSave(editedDarts)}
                    className="btn btn-primary"
                    style={{ padding: '8px 16px', fontSize: '0.85rem', flex: 1 }}
                >
                    💾 Save
                </button>
                <button
                    onClick={onCancel}
                    className="btn btn-secondary"
                    style={{ padding: '8px 16px', fontSize: '0.85rem', flex: 1 }}
                >
                    ✕ Cancel
                </button>
            </div>
        </div>
    );
}

function Scoreboard({ initialMatch, onFinish, onCancel }) {
    const [match, setMatch] = useState(initialMatch);
    const [multiplier, setMultiplier] = useState(1); // 1, 2, 3
    const [roundDarts, setRoundDarts] = useState([]); // Array of dart objects: {score, multiplier, totalValue}
    const [inputMode, setInputMode] = useState('keyboard'); // 'keyboard' or 'dartboard'
    const [turnHistory, setTurnHistory] = useState([]); // Array of completed turns
    const [editingTurn, setEditingTurn] = useState(null); // Index of turn being edited, or null
    const [showHistory, setShowHistory] = useState(false); // Toggle for history visibility

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

        // Save turn to history
        const turnEntry = {
            turnNumber: turnHistory.length + 1,
            playerIndex: match.currentPlayerIndex,
            playerName: currentPlayer.name,
            darts: dartsToConfirm,
            turnScore: roundTotal,
            scoreBefore: currentPlayer.score,
            scoreAfter: newScore,
            bust: false
        };
        setTurnHistory([...turnHistory, turnEntry]);

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

            // Save bust turn to history
            const bustTurnEntry = {
                turnNumber: turnHistory.length + 1,
                playerIndex: match.currentPlayerIndex,
                playerName: currentPlayer.name,
                darts: roundDarts.length > 0 ? roundDarts : [{ score: 0, multiplier: 0, totalValue: 0 }],
                turnScore: 0,
                scoreBefore: currentPlayer.score,
                scoreAfter: currentPlayer.score,
                bust: true
            };
            setTurnHistory([...turnHistory, bustTurnEntry]);
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

    const editTurn = (turnIndex, newDarts) => {
        // Update the turn in history
        const updatedHistory = [...turnHistory];
        const turn = updatedHistory[turnIndex];
        const newTurnScore = newDarts.reduce((a, b) => a + b.totalValue, 0);

        const newScoreAfter = match.mode === 'count_up'
            ? turn.scoreBefore + newTurnScore
            : turn.scoreBefore - newTurnScore;

        updatedHistory[turnIndex] = {
            ...turn,
            darts: newDarts,
            turnScore: newTurnScore,
            scoreAfter: newScoreAfter,
            bust: false // Reset bust flag when editing
        };

        // Recalculate all subsequent turns
        recalculateFromTurn(turnIndex, updatedHistory);
        setEditingTurn(null);
    };

    const recalculateFromTurn = (startIndex, historyToUpdate) => {
        const updatedHistory = [...historyToUpdate];
        let updatedPlayers = [...initialMatch.players].map(p => ({
            ...p,
            score: match.mode === 'count_up' ? 0 : match.target,
            dartsThrown: 0,
            history: []
        }));

        // Replay all turns from the beginning
        for (let i = 0; i <= startIndex; i++) {
            const turn = updatedHistory[i];
            const player = updatedPlayers[turn.playerIndex];

            if (i < startIndex) {
                // For turns before the edited one, just apply them as-is
                const newScore = match.mode === 'count_up'
                    ? player.score + turn.turnScore
                    : player.score - turn.turnScore;

                updatedPlayers[turn.playerIndex] = {
                    ...player,
                    score: newScore,
                    dartsThrown: player.dartsThrown + turn.darts.length,
                    history: [...player.history, ...turn.darts]
                };
            } else {
                // For the edited turn, recalculate
                const newScore = match.mode === 'count_up'
                    ? player.score + turn.turnScore
                    : player.score - turn.turnScore;

                updatedPlayers[turn.playerIndex] = {
                    ...player,
                    score: newScore,
                    dartsThrown: player.dartsThrown + turn.darts.length,
                    history: [...player.history, ...turn.darts]
                };

                // Update the turn's scoreBefore and scoreAfter
                updatedHistory[i] = {
                    ...turn,
                    scoreBefore: player.score,
                    scoreAfter: newScore
                };
            }
        }

        // Recalculate all subsequent turns
        for (let i = startIndex + 1; i < updatedHistory.length; i++) {
            const turn = updatedHistory[i];
            const player = updatedPlayers[turn.playerIndex];

            const newScore = match.mode === 'count_up'
                ? player.score + turn.turnScore
                : player.score - turn.turnScore;

            updatedPlayers[turn.playerIndex] = {
                ...player,
                score: newScore,
                dartsThrown: player.dartsThrown + turn.darts.length,
                history: [...player.history, ...turn.darts]
            };

            updatedHistory[i] = {
                ...turn,
                scoreBefore: player.score,
                scoreAfter: newScore
            };
        }

        // Update match state with recalculated players
        setMatch({
            ...match,
            players: updatedPlayers
        });
        setTurnHistory(updatedHistory);
    };

    const deleteTurn = (turnIndex) => {
        if (!confirm('Are you sure you want to delete this turn? This will recalculate all subsequent turns.')) {
            return;
        }

        const updatedHistory = turnHistory.filter((_, idx) => idx !== turnIndex);

        // Renumber turns
        const renumberedHistory = updatedHistory.map((turn, idx) => ({
            ...turn,
            turnNumber: idx + 1
        }));

        // Recalculate from the beginning
        let updatedPlayers = [...initialMatch.players].map(p => ({
            ...p,
            score: match.mode === 'count_up' ? 0 : match.target,
            dartsThrown: 0,
            history: []
        }));

        const finalHistory = [];
        for (let i = 0; i < renumberedHistory.length; i++) {
            const turn = renumberedHistory[i];
            const player = updatedPlayers[turn.playerIndex];

            const newScore = match.mode === 'count_up'
                ? player.score + turn.turnScore
                : player.score - turn.turnScore;

            updatedPlayers[turn.playerIndex] = {
                ...player,
                score: newScore,
                dartsThrown: player.dartsThrown + turn.darts.length,
                history: [...player.history, ...turn.darts]
            };

            finalHistory.push({
                ...turn,
                scoreBefore: player.score,
                scoreAfter: newScore
            });
        }

        setMatch({
            ...match,
            players: updatedPlayers
        });
        setTurnHistory(finalHistory);
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

            {/* Turn History Section */}
            {turnHistory.length > 0 && (
                <div className="card" style={{ marginTop: '20px' }}>
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="btn btn-secondary"
                        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                        <span>📜 Turn History ({turnHistory.length} turns)</span>
                        <span>{showHistory ? '▼' : '▶'}</span>
                    </button>

                    {showHistory && (
                        <div style={{ marginTop: '15px', maxHeight: '400px', overflowY: 'auto' }}>
                            {turnHistory.map((turn, idx) => (
                                <div key={idx} style={{
                                    padding: '10px',
                                    marginBottom: '10px',
                                    backgroundColor: 'var(--bg-secondary)',
                                    borderRadius: '8px',
                                    border: editingTurn === idx ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)'
                                }}>
                                    {editingTurn === idx ? (
                                        <TurnEditor
                                            turn={turn}
                                            onSave={(newDarts) => editTurn(idx, newDarts)}
                                            onCancel={() => setEditingTurn(null)}
                                        />
                                    ) : (
                                        <>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <div style={{ fontWeight: 'bold', color: 'var(--accent-green)' }}>
                                                    Turn {turn.turnNumber}: {turn.playerName}
                                                </div>
                                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                                    {turn.scoreBefore} → {turn.scoreAfter}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                                {turn.darts.map((dart, dartIdx) => (
                                                    <div key={dartIdx} style={{
                                                        padding: '4px 8px',
                                                        backgroundColor: 'var(--bg-primary)',
                                                        borderRadius: '4px',
                                                        fontSize: '0.85rem'
                                                    }}>
                                                        {dart.multiplier === 1 && `${dart.score}`}
                                                        {dart.multiplier === 2 && `D${dart.score}`}
                                                        {dart.multiplier === 3 && `T${dart.score}`}
                                                        {dart.totalValue > 0 && ` (${dart.totalValue})`}
                                                    </div>
                                                ))}
                                                {turn.bust && (
                                                    <div style={{
                                                        padding: '4px 8px',
                                                        backgroundColor: 'var(--accent-red)',
                                                        color: '#fff',
                                                        borderRadius: '4px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        BUST
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                                Total: {turn.turnScore}
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => setEditingTurn(idx)}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '6px 12px', fontSize: '0.85rem', flex: 1 }}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteTurn(idx)}
                                                    className="btn btn-danger"
                                                    style={{ padding: '6px 12px', fontSize: '0.85rem', flex: 1 }}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Exit Button at Bottom */}
            <button onClick={onCancel} className="btn btn-secondary" style={{ marginTop: '30px', padding: '12px' }}>
                Exit Game
            </button>
        </div>
    );
}


export default Scoreboard;
