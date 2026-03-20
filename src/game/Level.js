import { Platform, Spike, LavaPool, Crystal, Door } from './Entities.js';

export class Level {
    constructor(id) {
        this.id = id;
        this.platforms = [];
        this.crystals = [];
        this.door = null;
        this.spawnPoint = { x: 50, y: 500 };
        this.requiredCrystals = 0;
        this.collectedCrystals = 0;
        this.load(id);
    }

    load(id) {
        const handCrafted = {
            1: { platforms: [[0, 580, 800, 20], [100, 480, 200, 20], [400, 380, 200, 20], [150, 280, 150, 20], [450, 180, 150, 20], [50, 50, 100, 20]], crystals: [[150, 450], [450, 350], [200, 250]], door: [60, 10], required: 3, spawn: [50, 500] },
            2: { platforms: [[0, 580, 300, 20], [500, 580, 300, 20], [300, 580, 200, 20, 'LAVA_POOL'], [350, 450, 200, 20], [100, 350, 150, 20], [550, 250, 200, 20], [300, 100, 200, 20]], crystals: [[120, 320], [600, 220], [350, 70]], door: [350, 40], required: 3, spawn: [50, 500] },
            3: { platforms: [[0, 580, 200, 20], [250, 500, 200, 20], [500, 420, 200, 20], [750, 350, 200, 20], [1000, 280, 200, 20], [1250, 210, 200, 20], [1500, 150, 250, 20]], crystals: [[300, 470], [550, 390], [800, 320]], door: [1550, 100], required: 3, spawn: [50, 500] },
            4: { platforms: [[0, 500, 300, 20], [400, 550, 200, 10, 'SPIKE'], [400, 400, 200, 20], [700, 450, 250, 20], [1000, 550, 300, 20, 'LAVA_POOL'], [1000, 350, 300, 20], [1400, 400, 200, 20], [1700, 300, 200, 20]], crystals: [[450, 370], [750, 420], [1100, 320], [1450, 370]], door: [1750, 230], required: 4, spawn: [50, 450] },
            5: { platforms: [[0, 500, 200, 20], [300, 450, 50, 10], [450, 400, 50, 10], [600, 350, 50, 10], [750, 300, 50, 10], [900, 250, 50, 10], [1100, 300, 300, 20], [1400, 500, 400, 20, 'LAVA_POOL'], [1800, 300, 300, 20]], crystals: [[450, 370], [900, 220], [1200, 270], [1950, 270]], door: [1900, 230], required: 4, spawn: [50, 450] },
            6: { platforms: [[0, 500, 200, 20], [250, 500, 300, 10, 'SPIKE'], [600, 500, 200, 20], [850, 500, 300, 10, 'SPIKE'], [1200, 500, 200, 20], [1450, 500, 300, 10, 'SPIKE'], [1800, 400, 200, 20]], crystals: [[100, 470], [700, 470], [1300, 470], [1850, 370]], door: [1850, 330], required: 4, spawn: [50, 450] },
            7: { platforms: [[0, 580, 200, 20], [300, 400, 200, 20], [600, 250, 200, 20], [900, 150, 200, 20], [1200, 250, 200, 20], [1500, 400, 300, 20]], crystals: [[350, 370], [650, 220], [1250, 220], [1550, 370]], door: [1600, 330], required: 3, spawn: [50, 540] },
            8: { platforms: [[0, 400, 150, 20], [200, 300, 150, 20], [400, 200, 150, 20], [600, 100, 150, 20], [800, 200, 150, 20], [1000, 300, 150, 20], [1200, 200, 300, 20]], crystals: [[250, 270], [650, 70], [1050, 270]], door: [1300, 130], required: 3, spawn: [20, 350], rising: true },
            9: { platforms: [[0, 580, 2000, 10, 'LAVA_POOL'], [50, 450, 100, 20], [250, 350, 100, 20], [450, 250, 100, 20], [650, 350, 100, 20], [850, 450, 100, 20], [1050, 350, 100, 20], [1250, 250, 100, 20]], crystals: [[100, 420], [500, 220], [1300, 220]], door: [1270, 180], required: 3, spawn: [20, 400], rising: true },
            10: { platforms: [[0, 500, 100, 20], [150, 450, 100, 20], [300, 400, 100, 20], [450, 350, 100, 20], [650, 450, 100, 10, 'SPIKE'], [800, 350, 100, 20], [1000, 250, 100, 20], [1200, 150, 400, 20]], crystals: [[200, 420], [350, 370], [850, 320], [1300, 120]], door: [1400, 80], required: 4, spawn: [20, 450], rising: true },
            11: { platforms: [[0, 500, 100, 20], [400, 300, 100, 20], [800, 500, 100, 20], [1200, 300, 100, 20], [1600, 500, 200, 20]], crystals: [[450, 270], [850, 470], [1250, 270]], door: [1700, 430], required: 3, spawn: [50, 450] },
            12: { platforms: [[0, 580, 3000, 20, 'LAVA_POOL'], [100, 400, 50, 10], [400, 300, 50, 10], [700, 400, 50, 10], [1000, 300, 50, 10], [1300, 400, 50, 10], [1600, 300, 200, 20]], crystals: [[120, 370], [720, 370], [1320, 370]], door: [1700, 230], required: 3, spawn: [50, 500] },
            13: { platforms: [[0, 1000, 800, 20], [100, 800, 100, 20], [600, 700, 100, 20], [100, 600, 100, 20], [600, 500, 100, 20], [100, 400, 100, 20], [600, 300, 100, 20], [350, 100, 100, 20]], crystals: [[150, 770], [650, 670], [150, 370]], door: [380, 30], required: 3, spawn: [50, 950] },
            14: { platforms: [[0, 580, 800, 20, 'SPIKE'], [50, 450, 50, 20], [700, 450, 50, 20], [350, 10, 100, 20]], crystals: [[70, 420], [720, 420], [400, 50]], door: [380, -50], required: 3, spawn: [75, 400], rising: true },
            15: { platforms: [[0, 580, 4000, 20, 'LAVA_POOL'], [100, 450, 50, 10], [300, 350, 50, 10, 'SPIKE'], [500, 450, 50, 10], [700, 350, 50, 10, 'SPIKE'], [900, 450, 50, 10], [1200, 200, 400, 20]], crystals: [[120, 420], [520, 420], [920, 420], [1400, 170]], door: [1400, 130], required: 4, spawn: [120, 400], rising: true }
        };

        let data;
        if (handCrafted[id]) {
            data = handCrafted[id];
        } else {
            data = this.generate(id);
        }

        this.risingLava = !!data.rising;
        this.platforms = data.platforms.map(p => {
            if (p[4] === 'SPIKE') return new Spike(p[0], p[1], p[2], p[3]);
            if (p[4] === 'LAVA_POOL') return new LavaPool(p[0], p[1], p[2], p[3]);
            return new Platform(p[0], p[1], p[2], p[3]);
        });
        this.crystals = data.crystals.map(c => new Crystal(...c));
        this.door = new Door(...data.door);
        this.requiredCrystals = data.required;
        this.spawnPoint = { x: data.spawn[0], y: data.spawn[1] };
    }

    // Seeded random for deterministic level generation
    seededRandom(seed) {
        let s = seed;
        return () => {
            s = (s * 16807 + 0) % 2147483647;
            return (s - 1) / 2147483646;
        };
    }

    generate(id) {
        const rng = this.seededRandom(id * 9973 + 42);

        // Difficulty scaling
        const tier = id <= 20 ? 0 : id <= 50 ? 1 : id <= 80 ? 2 : 3;
        const diff = Math.min((id - 16) / 84, 1); // 0..1

        // Parameters
        const numPlatforms = Math.floor(6 + diff * 12);
        const numCrystals = Math.floor(3 + diff * 3);
        const spikeChance = 0.05 + diff * 0.25;
        const lavaChance = 0.02 + diff * 0.15;
        const rising = diff > 0.4 && rng() < (diff - 0.3);
        const platWidth = () => Math.floor(60 + rng() * (150 - diff * 80));
        const gapX = () => Math.floor(100 + rng() * (200 + diff * 100));

        const platforms = [];
        const crystals = [];

        // Start platform
        platforms.push([0, 550, 150, 20]);

        let cx = 200;
        let cy = 500;

        for (let i = 0; i < numPlatforms; i++) {
            const w = platWidth();
            const dy = Math.floor(rng() * 120 - 80); // -80 to +40 (tends upward)
            cy = Math.max(80, Math.min(550, cy + dy));

            let type = null;
            const r = rng();
            if (r < spikeChance && i > 0 && i < numPlatforms - 1) {
                type = 'SPIKE';
                platforms.push([cx, cy, w, 10, 'SPIKE']);
            } else if (r < spikeChance + lavaChance && i > 0 && i < numPlatforms - 1) {
                type = 'LAVA_POOL';
                platforms.push([cx, cy, w, 20, 'LAVA_POOL']);
            } else {
                platforms.push([cx, cy, w, 20]);
            }

            // Crystal on some safe platforms
            if (!type && crystals.length < numCrystals && rng() < 0.5) {
                crystals.push([cx + w / 2 - 10, cy - 30]);
            }

            cx += w + gapX();
        }

        // Ensure enough crystals
        while (crystals.length < numCrystals) {
            const pi = Math.floor(rng() * platforms.length);
            const p = platforms[pi];
            if (!p[4]) {
                crystals.push([p[0] + p[2] / 2 - 10, p[1] - 30]);
            }
        }

        // End platform with door
        const endW = 200;
        cy = Math.max(100, Math.min(400, cy - 50));
        platforms.push([cx, cy, endW, 20]);
        const door = [cx + 70, cy - 80];

        // If rising lava, add a lava floor
        if (rising) {
            platforms.unshift([0, 600, cx + endW + 500, 20, 'LAVA_POOL']);
        }

        return {
            platforms,
            crystals,
            door,
            required: numCrystals,
            spawn: [50, 500],
            rising
        };
    }

    // Target times for rank calculation (seconds)
    static getTargetTime(id) {
        if (id <= 10) return 25 + id * 3;
        if (id <= 20) return 40 + (id - 10) * 4;
        if (id <= 50) return 60 + (id - 20) * 3;
        if (id <= 80) return 100 + (id - 50) * 4;
        return 150 + (id - 80) * 5;
    }

    static getRank(id, timeSeconds) {
        const target = Level.getTargetTime(id);
        if (timeSeconds <= target * 0.5) return 'S';
        if (timeSeconds <= target * 0.75) return 'A';
        if (timeSeconds <= target) return 'B';
        return 'C';
    }
}
