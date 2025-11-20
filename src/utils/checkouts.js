// Common checkout paths for Double Out games
// Format: Score -> "Dart1, Dart2, Dart3" or similar description
// Optimized to show the SHORTEST path (fewest darts) to finish

const checkouts = {
    170: "T20 T20 Bull",
    167: "T20 T19 Bull",
    164: "T20 T18 Bull",
    161: "T20 T17 Bull",
    160: "T20 T20 D20",
    158: "T20 T20 D19",
    157: "T20 T19 D20",
    156: "T20 T20 D18",
    155: "T20 T19 D19",
    154: "T20 T18 D20",
    153: "T20 T19 D18",
    152: "T20 T20 D16",
    151: "T20 T17 D20",
    150: "T20 T18 D18",
    149: "T20 T19 D16",
    148: "T20 T16 D20",
    147: "T20 T17 D18",
    146: "T20 T18 D16",
    145: "T20 T15 D20",
    144: "T20 T20 D12",
    143: "T20 T17 D16",
    142: "T20 T14 D20",
    141: "T20 T19 D12",
    140: "T20 T16 D16",
    139: "T20 T13 D20",
    138: "T20 T18 D12",
    137: "T19 T16 D16",
    136: "T20 T20 D8",
    135: "T20 T15 D15",
    134: "T20 T14 D16",
    133: "T20 T19 D8",
    132: "T20 T16 D12",
    131: "T20 T13 D16",
    130: "T20 T18 D8",
    129: "T19 T16 D12",
    128: "T18 T14 D16",
    127: "T20 T17 D8",
    126: "T19 T19 D6",
    125: "T20 Bull D20",
    124: "T20 T16 D8",
    123: "T19 T16 D9",
    122: "T18 T20 D4",
    121: "T20 T11 D14",
    120: "T20 20 D20",
    119: "T19 T10 D16",
    118: "T20 18 D20",
    117: "T20 17 D20",
    116: "T20 16 D20",
    115: "T20 15 D20",
    114: "T20 14 D20",
    113: "T20 13 D20",
    112: "T20 12 D20",
    111: "T20 19 D16",
    110: "T20 Bull", // 2-dart finish
    109: "T19 12 D20",
    108: "T20 16 D16",
    107: "T19 Bull", // 2-dart finish
    106: "T20 10 D18",
    105: "T20 13 D16",
    104: "T20 12 D16",
    103: "T20 3 D20",
    102: "T20 10 D16",
    101: "T17 10 D20",
    100: "T20 D20", // 2-dart finish
    99: "T19 10 D16",
    98: "T20 D19", // 2-dart finish
    97: "T19 D20", // 2-dart finish
    96: "T20 D18", // 2-dart finish
    95: "T19 D19", // 2-dart finish
    94: "T18 D20", // 2-dart finish
    93: "T19 D18", // 2-dart finish
    92: "T20 D16", // 2-dart finish
    91: "T17 D20", // 2-dart finish
    90: "T18 D18", // 2-dart finish
    89: "T19 D16", // 2-dart finish
    88: "T16 D20", // 2-dart finish
    87: "T17 D18", // 2-dart finish
    86: "T18 D16", // 2-dart finish
    85: "T15 D20", // 2-dart finish
    84: "T20 D12", // 2-dart finish
    83: "T17 D16", // 2-dart finish
    82: "Bull D16", // 2-dart finish
    81: "T19 D12", // 2-dart finish
    80: "T20 D10", // 2-dart finish
    79: "T13 D20", // 2-dart finish
    78: "T18 D12", // 2-dart finish
    77: "T19 D10", // 2-dart finish
    76: "T20 D8", // 2-dart finish
    75: "T17 D12", // 2-dart finish
    74: "T14 D16", // 2-dart finish
    73: "T19 D8", // 2-dart finish
    72: "T16 D12", // 2-dart finish
    71: "T13 D16", // 2-dart finish
    70: "T18 D8", // 2-dart finish
    69: "T19 D6", // 2-dart finish
    68: "T20 D4", // 2-dart finish
    67: "T17 D8", // 2-dart finish
    66: "T10 D18", // 2-dart finish
    65: "T15 D10", // 2-dart finish
    64: "T16 D8", // 2-dart finish
    63: "T13 D12", // 2-dart finish
    62: "T10 D16", // 2-dart finish
    61: "T15 D8", // 2-dart finish
    60: "20 D20", // 2-dart finish
    59: "19 D20", // 2-dart finish
    58: "18 D20", // 2-dart finish
    57: "17 D20", // 2-dart finish
    56: "16 D20", // 2-dart finish
    55: "15 D20", // 2-dart finish
    54: "14 D20", // 2-dart finish
    53: "13 D20", // 2-dart finish
    52: "12 D20", // 2-dart finish
    51: "11 D20", // 2-dart finish
    50: "Bull", // 1-dart finish
    49: "9 D20", // 2-dart finish
    48: "16 D16", // 2-dart finish
    47: "7 D20", // 2-dart finish
    46: "6 D20", // 2-dart finish
    45: "5 D20", // 2-dart finish
    44: "4 D20", // 2-dart finish
    43: "3 D20", // 2-dart finish
    42: "2 D20", // 2-dart finish
    41: "1 D20", // 2-dart finish
    40: "D20", // 1-dart finish
    39: "7 D16", // 2-dart finish
    38: "D19", // 1-dart finish
    37: "5 D16", // 2-dart finish
    36: "D18", // 1-dart finish
    35: "3 D16", // 2-dart finish
    34: "D17", // 1-dart finish
    33: "1 D16", // 2-dart finish
    32: "D16", // 1-dart finish
    31: "15 D8", // 2-dart finish
    30: "D15", // 1-dart finish
    29: "13 D8", // 2-dart finish
    28: "D14", // 1-dart finish
    27: "11 D8", // 2-dart finish
    26: "D13", // 1-dart finish
    25: "9 D8", // 2-dart finish
    24: "D12", // 1-dart finish
    23: "7 D8", // 2-dart finish
    22: "D11", // 1-dart finish
    21: "5 D8", // 2-dart finish
    20: "D10", // 1-dart finish
    19: "3 D8", // 2-dart finish
    18: "D9", // 1-dart finish
    17: "1 D8", // 2-dart finish
    16: "D8", // 1-dart finish
    15: "7 D4", // 2-dart finish
    14: "D7", // 1-dart finish
    13: "5 D4", // 2-dart finish
    12: "D6", // 1-dart finish
    11: "3 D4", // 2-dart finish
    10: "D5", // 1-dart finish
    9: "1 D4", // 2-dart finish
    8: "D4", // 1-dart finish
    7: "3 D2", // 2-dart finish
    6: "D3", // 1-dart finish
    5: "1 D2", // 2-dart finish
    4: "D2", // 1-dart finish
    3: "1 D1", // 2-dart finish
    2: "D1" // 1-dart finish
};

export const getCheckoutGuide = (score) => {
    if (score > 170) return null;
    if (score < 2) return null;

    const guide = checkouts[score];
    if (!guide) return "No 3-dart out";

    // Expand abbreviations for better readability
    return guide
        .replace(/T(\d+)/g, 'Triple $1')
        .replace(/D(\d+)/g, 'Double $1')
        .replace(/Bull/g, 'Bullseye');
};

