export class Camera {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.lerp = 0.1;
        this.shake = 0;
    }

    update(target) {
        // Follow player (centric)
        this.targetX = target.x + target.width / 2 - this.width / 2;
        this.targetY = target.y + target.height / 2 - this.height / 2;

        // Smooth interpolate
        this.x += (this.targetX - this.x) * this.lerp;
        this.y += (this.targetY - this.y) * this.lerp;

        // Apply screen shake
        if (this.shake > 0) {
            this.x += (Math.random() - 0.5) * this.shake;
            this.y += (Math.random() - 0.5) * this.shake;
            this.shake *= 0.9; // Decay
            if (this.shake < 0.1) this.shake = 0;
        }
    }

    apply(ctx) {
        ctx.save();
        ctx.translate(-this.x, -this.y);
    }

    release(ctx) {
        ctx.restore();
    }

    triggerShake(amount = 10) {
        this.shake = amount;
    }
}
