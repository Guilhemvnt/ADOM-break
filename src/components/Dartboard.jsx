import React from 'react';

const Dartboard = ({ onThrow }) => {
    const width = 400;
    const height = 400;
    const centerX = width / 2;
    const centerY = height / 2;

    // Standard Dartboard Dimensions (relative)
    const R_DOUBLE_OUTER = 170;
    const R_DOUBLE_INNER = 160;
    const R_TRIPLE_OUTER = 107;
    const R_TRIPLE_INNER = 97;
    const R_BULL_OUTER = 32;
    const R_BULL_INNER = 12.7;

    // Order of numbers on a dartboard clockwise from top (20)
    const NUMBERS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

    const getRing = (radius) => {
        if (radius < R_BULL_INNER) return 'InnerBull';
        if (radius < R_BULL_OUTER) return 'OuterBull';
        if (radius < R_TRIPLE_INNER) return 'SingleInner';
        if (radius < R_TRIPLE_OUTER) return 'Triple';
        if (radius < R_DOUBLE_INNER) return 'SingleOuter';
        if (radius < R_DOUBLE_OUTER) return 'Double';
        return 'Miss';
    };

    const getScore = (x, y) => {
        const dx = x - centerX;
        const dy = y - centerY;
        const radius = Math.sqrt(dx * dx + dy * dy);

        // Calculate angle in degrees, adjusting so 0 is at top (12 o'clock)
        // atan2 returns angle from positive x-axis (3 o'clock)
        let angle = Math.atan2(dy, dx) * (180 / Math.PI);
        angle += 90; // Rotate so 0 is at top
        if (angle < 0) angle += 360;

        const sliceAngle = 360 / 20;
        // Offset by half a slice so 20 is centered at top
        const adjustedAngle = (angle + sliceAngle / 2) % 360;
        const sliceIndex = Math.floor(adjustedAngle / sliceAngle);
        const baseScore = NUMBERS[sliceIndex];

        const ring = getRing(radius);

        if (ring === 'InnerBull') return { score: 50, multiplier: 1, text: 'Bullseye' };
        if (ring === 'OuterBull') return { score: 25, multiplier: 1, text: 'Outer Bull' };
        if (ring === 'Miss') return { score: 0, multiplier: 0, text: 'Miss' };

        let multiplier = 1;
        if (ring === 'Double') multiplier = 2;
        if (ring === 'Triple') multiplier = 3;

        return { score: baseScore, multiplier, text: `${ring} ${baseScore}` };
    };

    const handleClick = (e) => {
        // use currentTarget to ensure we get the SVG element's rect, not the clicked path's
        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();

        // Calculate x/y relative to the SVG element
        const clientX = e.clientX;
        const clientY = e.clientY;

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        // Scale to the viewBox dimensions (400x400)
        const scaleX = 400 / rect.width;
        const scaleY = 400 / rect.height;

        const result = getScore(x * scaleX, y * scaleY);
        onThrow(result.score, result.multiplier);
    };

    // Helper to create slice paths
    const createSlicePath = (startR, endR, startAngle, endAngle) => {
        const x1 = centerX + startR * Math.cos((startAngle - 90) * Math.PI / 180);
        const y1 = centerY + startR * Math.sin((startAngle - 90) * Math.PI / 180);
        const x2 = centerX + endR * Math.cos((startAngle - 90) * Math.PI / 180);
        const y2 = centerY + endR * Math.sin((startAngle - 90) * Math.PI / 180);
        const x3 = centerX + endR * Math.cos((endAngle - 90) * Math.PI / 180);
        const y3 = centerY + endR * Math.sin((endAngle - 90) * Math.PI / 180);
        const x4 = centerX + startR * Math.cos((endAngle - 90) * Math.PI / 180);
        const y4 = centerY + startR * Math.sin((endAngle - 90) * Math.PI / 180);

        return `M ${x1} ${y1} L ${x2} ${y2} A ${endR} ${endR} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${startR} ${startR} 0 0 0 ${x1} ${y1} Z`;
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 400 400"
                style={{ maxWidth: '300px', maxHeight: '300px', cursor: 'crosshair' }}
                onClick={handleClick}
            >
                <circle cx="200" cy="200" r="200" fill="#1e293b" />

                {NUMBERS.map((num, i) => {
                    const angle = i * 18;
                    const startAngle = angle - 9;
                    const endAngle = angle + 9;
                    const isEven = i % 2 === 0;

                    // Colors
                    const c1 = isEven ? '#000' : '#ffdfbf'; // Black / Beige (Singles)
                    const c2 = isEven ? '#e11d48' : '#22c55e'; // Red / Green (Triples/Doubles)

                    // Adjust standard colors: 
                    // Standard: Black/White for singles. Red/Green for D/T.
                    // Let's use: Black (#0f172a) and White (#f1f5f9) for singles
                    // Red (#ef4444) and Green (#22c55e) for D/T
                    const singleColor = i % 2 === 0 ? '#0f172a' : '#f1f5f9';
                    const specialColor = i % 2 === 0 ? '#ef4444' : '#22c55e';

                    return (
                        <g key={num}>
                            {/* Double Ring */}
                            <path d={createSlicePath(R_DOUBLE_INNER, R_DOUBLE_OUTER, startAngle, endAngle)} fill={specialColor} stroke="#fff" strokeWidth="1" />
                            {/* Outer Single */}
                            <path d={createSlicePath(R_TRIPLE_OUTER, R_DOUBLE_INNER, startAngle, endAngle)} fill={singleColor} stroke="#fff" strokeWidth="1" />
                            {/* Triple Ring */}
                            <path d={createSlicePath(R_TRIPLE_INNER, R_TRIPLE_OUTER, startAngle, endAngle)} fill={specialColor} stroke="#fff" strokeWidth="1" />
                            {/* Inner Single */}
                            <path d={createSlicePath(R_BULL_OUTER, R_TRIPLE_INNER, startAngle, endAngle)} fill={singleColor} stroke="#fff" strokeWidth="1" />

                            {/* Labels */}
                            <text
                                x={centerX + 185 * Math.cos((angle - 90) * Math.PI / 180)}
                                y={centerY + 185 * Math.sin((angle - 90) * Math.PI / 180)}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#fff"
                                fontSize="14"
                                fontWeight="bold"
                            >
                                {num}
                            </text>
                        </g>
                    );
                })}

                {/* Outer Bull */}
                <circle cx="200" cy="200" r={R_BULL_OUTER} fill="#22c55e" stroke="#fff" strokeWidth="1" />
                {/* Inner Bull */}
                <circle cx="200" cy="200" r={R_BULL_INNER} fill="#ef4444" stroke="#fff" strokeWidth="1" />
            </svg>
        </div>
    );
};

export default Dartboard;
