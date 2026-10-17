const DIMINISHING_FACTOR = 0.75;
const STANDARD_PAIR_VALUE = 0.1;
const INLAY_PAIR_VALUE = 0.025;

export const candleColors = [
    ['white', 'White'],
    ['orange', 'Orange'],
    ['magenta', 'Magenta'],
    ['light_blue', 'Light Blue'],
    ['yellow', 'Yellow'],
    ['lime', 'Lime'],
    ['pink', 'Pink'],
    ['gray', 'Gray'],
    ['light_gray', 'Light Gray'],
    ['cyan', 'Cyan'],
    ['purple', 'Purple'],
    ['blue', 'Blue'],
    ['brown', 'Brown'],
    ['green', 'Green'],
    ['red', 'Red'],
    ['black', 'Black'],
];

export const candleMaterials = [
    { id: 'brass', name: 'Brass', pairValue: 0.1 },
    { id: 'thaumium', name: 'Thaumium', pairValue: 0.15 },
    { id: 'void', name: 'Void', pairValue: 0.2 },
];

export const pillarOptions = [
    { id: 'arcane', name: 'Arcane Pillars', stability: 0 },
    { id: 'ancient', name: 'Ancient Pillars', stability: -0.1 },
    { id: 'eldritch', name: 'Eldritch Pillars', stability: 0.2 },
];

const availableCount = (counts, id) => {
    const count = Number.parseInt(counts[id], 10);
    return Number.isFinite(count) ? Math.max(0, count) : 0;
};

function optimizeIdentity(candidates) {
    const ordered = candidates
        .filter(candidate => candidate.pairs > 0)
        .sort((a, b) => b.pairValue - a.pairValue || a.name.localeCompare(b.name));
    let total = 0;
    let rank = 0;
    const plan = [];

    for (const candidate of ordered) {
        const value = Array.from({ length: candidate.pairs }, (_, index) =>
            candidate.pairValue * DIMINISHING_FACTOR ** (rank + index)
        ).reduce((sum, item) => sum + item, 0);
        total += value;
        rank += candidate.pairs;
        plan.push({ ...candidate, value });
    }

    return { total, plan };
}

export function optimizeInfusionStability(counts) {
    let total = 0;
    const plan = [];

    for (const [colorId, colorName] of candleColors) {
        const brassCount = availableCount(counts, `candle:brass:${colorId}`);
        const looseCandleCount = availableCount(counts, `candle:loose:${colorId}`);
        const candidates = [
            {
                id: `candle:loose:${colorId}`,
                name: `${colorName} standalone Tallow Candles`,
                pairs: Math.floor(looseCandleCount / 2),
                pairValue: 0.1,
            },
            {
                id: `candle:brass:${colorId}`,
                name: `Brass holders with ${colorName} candles`,
                pairs: Math.floor(brassCount / 2),
                pairValue: 0.1,
            },
            ...candleMaterials.filter(material => material.id !== 'brass').map(material => {
                const id = `candle:${material.id}:${colorId}`;
                return {
                    id,
                    name: `${material.name} Candle Holder with ${colorName} Candle`,
                    pairs: Math.floor(availableCount(counts, id) / 2),
                    pairValue: material.pairValue,
                };
            }),
        ];
        const result = optimizeIdentity(candidates);
        total += result.total;
        plan.push(...result.plan);
    }

    const headPairs = Math.floor(availableCount(counts, 'skulls') / 2);
    const headResult = optimizeIdentity([{ id: 'skulls', name: 'Vanilla skulls/heads', pairs: headPairs, pairValue: STANDARD_PAIR_VALUE }]);
    total += headResult.total;
    plan.push(...headResult.plan);

    const inlayPairs = Math.floor(availableCount(counts, 'inlays') / 2);
    const inlayResult = optimizeIdentity([{ id: 'inlays', name: 'Infusion Inlays', pairs: inlayPairs, pairValue: INLAY_PAIR_VALUE }]);
    total += inlayResult.total;
    plan.push(...inlayResult.plan);

    const availablePillars = pillarOptions
        .filter(option => availableCount(counts, `pillar:${option.id}`) >= 4)
        .sort((a, b) => b.stability - a.stability);
    const pillar = availablePillars[0] ?? null;
    if (pillar) {
        total += pillar.stability;
    }

    return {
        total,
        plan,
        pillar,
        hasValidPillarSet: pillar !== null,
        unusedOddItems: [
            ...candleColors.flatMap(([colorId]) => {
                return [
                    { id: `candle:loose:${colorId}`, count: availableCount(counts, `candle:loose:${colorId}`) % 2 },
                    { id: `candle:brass:${colorId}`, count: availableCount(counts, `candle:brass:${colorId}`) % 2 },
                    ...candleMaterials.filter(material => material.id !== 'brass').map(material => {
                        const id = `candle:${material.id}:${colorId}`;
                        return { id, count: availableCount(counts, id) % 2 };
                    }),
                ];
            }),
            { id: 'skulls', count: availableCount(counts, 'skulls') % 2 },
            { id: 'inlays', count: availableCount(counts, 'inlays') % 2 },
        ].filter(item => item.count > 0),
    };
}
