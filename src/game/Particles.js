export class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    burst(x, y, color, count = 10, speed = 5, life = 1) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * speed,
                vy: (Math.random() - 0.5) * speed,
                color,
                life,
                maxLife: life,
                size: Math.random() * 4 + 2
            });
        }
    }

    emit(x, y, color, count = 5, speed = 2, life = 1) {
        this.burst(x, y, color, count, speed, life);
    }

    clear() {
        this.particles = [];
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        this.particles.forEach(p => {
            const alpha = p.life / p.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        });
        ctx.globalAlpha = 1.0;
    }
}
