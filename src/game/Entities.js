import { Entity } from './Entity.js';

export class Bubble extends Entity {
    constructor(x, y, width = 60) {
        super(x, y, width, 20, 'rgba(0, 242, 255, 0.3)');
        this.vy = -1.2;
        this.isPlatform = true;
    }

    update() {
        this.y += this.vy;
        if (this.y + this.height < -100) {
            this.active = false;
        }
    }
}

export class Platform extends Entity {
    constructor(x, y, width, height, color = '#444') {
        super(x, y, width, height, color);
        this.isPlatform = true;
        this.danger = false;
        this.type = 'SOLID';
    }
}

export class Spike extends Platform {
    constructor(x, y, width, height) {
        super(x, y, width, height, '#ff0000');
        this.danger = true;
        this.type = 'SPIKE';
    }
}

export class LavaPool extends Platform {
    constructor(x, y, width, height) {
        super(x, y, width, height, '#ff4400');
        this.danger = true;
        this.type = 'LAVA_POOL';
    }
}

// NEW: Platform that crumbles after being stepped on
export class CrumblingPlatform extends Platform {
    constructor(x, y, width, height) {
        super(x, y, width, height, '#8B7355');
        this.type = 'CRUMBLING';
        this.crumbleTimer = 0;
        this.crumbling = false;
        this.crumbleDelay = 40; // frames before it falls
        this.fallen = false;
        this.originalY = y;
        this.shakeAmount = 0;
    }

    startCrumble() {
        if (!this.crumbling && !this.fallen) {
            this.crumbling = true;
            this.crumbleTimer = 0;
        }
    }

    update() {
        if (this.crumbling && !this.fallen) {
            this.crumbleTimer++;
            this.shakeAmount = Math.sin(this.crumbleTimer * 0.8) * 3;
            if (this.crumbleTimer >= this.crumbleDelay) {
                this.fallen = true;
                this.active = false;
            }
        }
    }
}

// NEW: Moving platform that travels between two points
export class MovingPlatform extends Platform {
    constructor(x, y, width, height, rangeX = 0, rangeY = 0, speed = 1) {
        super(x, y, width, height, '#5577aa');
        this.type = 'MOVING';
        this.startX = x;
        this.startY = y;
        this.rangeX = rangeX;
        this.rangeY = rangeY;
        this.speed = speed;
        this.progress = 0;
        this.direction = 1;
    }

    update() {
        this.progress += this.speed * this.direction * 0.01;
        if (this.progress >= 1) { this.progress = 1; this.direction = -1; }
        if (this.progress <= 0) { this.progress = 0; this.direction = 1; }
        this.x = this.startX + this.rangeX * this.progress;
        this.y = this.startY + this.rangeY * this.progress;
    }
}

// NEW: Meteor that falls from the sky
export class Meteor extends Entity {
    constructor(x, y) {
        super(x, y, 20, 20, '#ff6600');
        this.vy = 4 + Math.random() * 3;
        this.danger = true;
        this.type = 'METEOR';
        this.trail = [];
    }

    update() {
        this.trail.push({ x: this.x + this.width/2, y: this.y + this.height/2, life: 15 });
        if (this.trail.length > 8) this.trail.shift();
        this.trail.forEach(t => t.life--);
        this.y += this.vy;
        if (this.y > 2000) this.active = false;
    }
}

export class Crystal extends Entity {
    constructor(x, y) {
        super(x, y, 20, 25, '#00f2ff');
        this.bob = Math.random() * Math.PI * 2;
    }

    update() {
        this.bob += 0.1;
        this.yOffset = Math.sin(this.bob) * 5;
    }
}

export class RisingLava extends Entity {
    constructor(x, y, width, height) {
        super(x, y, width, height, '#ff3300');
        this.danger = true;
    }

    update(risingSpeed) {
        this.y -= risingSpeed;
    }
}

export class Door extends Entity {
    constructor(x, y) {
        super(x, y, 60, 80, '#ffcc00');
        this.unlocked = false;
    }
}
