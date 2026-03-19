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
        this.type = 'SOLID'; // SOLID, SPIKE, LAVA_POOL
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
