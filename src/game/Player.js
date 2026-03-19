import { Entity } from './Entity.js';

export class Player extends Entity {
    constructor(x, y) {
        super(x, y, 32, 48, '#00d2ff');
        this.vx = 0;
        this.vy = 0;
        
        this.accel = 0.6;
        this.friction = 0.25;
        this.maxSpeed = 5.5;
        this.jumpForce = -13;
        this.baseGravity = 0.52;
        this.glideGravity = 0.1;
        
        this.gravity = this.baseGravity;
        this.onGround = false;
        this.parachuteActive = false;
        this.dead = false;
        this.faceDir = 1;

        this.hookActive = false;
        this.hookPoint = null;
        this.hookTarget = null;
        this.hookSpeed = 12;
        this.hookRange = 400; // Increased range
    }

    update(input, particles, platforms, bubbles, sound) {
        if (this.dead) return;

        // Grappling Hook (X Key)
        if (input.isPressed('KeyX')) {
            if (!this.hookActive) {
                this.fireHook(platforms, bubbles);
            }
        } else {
            this.hookActive = false;
            this.hookPoint = null;
            this.hookTarget = null;
        }

        if (this.hookActive && this.hookPoint) {
            const dx = this.hookPoint.x - (this.x + this.width / 2);
            const dy = this.hookPoint.y - (this.y + this.height / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 15) {
                this.vx = (dx / dist) * this.hookSpeed;
                this.vy = (dy / dist) * this.hookSpeed;
                this.x += this.vx;
                this.y += this.vy;
            } else {
                this.hookActive = false;
                this.vx *= 0.5;
                this.vy *= 0.5;
            }
            
            if (this.hookTarget && this.hookTarget.vy) {
                this.hookPoint.y += this.hookTarget.vy;
            }
            return;
        }

        let moving = false;
        if (input.isPressed('ArrowLeft')) {
            this.vx -= this.accel;
            this.faceDir = -1;
            moving = true;
        } else if (input.isPressed('ArrowRight')) {
            this.vx += this.accel;
            this.faceDir = 1;
            moving = true;
        }

        if (!moving) {
            if (Math.abs(this.vx) < this.friction) this.vx = 0;
            else this.vx -= Math.sign(this.vx) * this.friction;
        }

        if (Math.abs(this.vx) > this.maxSpeed) this.vx = Math.sign(this.vx) * this.maxSpeed;

        if (input.isPressed('ArrowUp') && this.onGround) {
            this.vy = this.jumpForce;
            this.onGround = false;
            if (sound) sound.jump();
            if (particles) particles.emit(this.x + this.width/2, this.y + this.height, '#fff', 8, 3, 0.5);
        }

        if (input.isPressed('KeyC') && this.vy > 0) {
            this.parachuteActive = true;
            this.gravity = this.glideGravity;
        } else {
            this.parachuteActive = false;
            this.gravity = this.baseGravity;
        }

        this.vy += this.gravity;
        if (this.vy > 18) this.vy = 18;

        this.x += this.vx;
        this.y += this.vy;
        this.onGround = false;
        
        // Bounds safety
        if (this.x < -1000) this.x = -1000;
        if (this.x > 8000) this.x = 8000;
    }

    fireHook(platforms, bubbles) {
        const allTargets = [...platforms, ...bubbles];
        let closestDist = this.hookRange;
        let bestPoint = null;
        let bestTarget = null;

        allTargets.forEach(t => {
            if (!t.active) return;
            const tx = t.x + t.width / 2;
            const ty = t.y + t.height / 2;
            const dx = tx - (this.x + this.width / 2);
            const dy = ty - (this.y + this.height / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Hook must be above and in face direction (roughly)
            const horizontalOk = (this.faceDir === 1 && dx > -20) || (this.faceDir === -1 && dx < 20);
            if (dist < closestDist && dy < -50 && horizontalOk) {
                bestPoint = { x: tx, y: ty };
                bestTarget = t;
                closestDist = dist;
            }
        });

        if (bestPoint) {
            this.hookActive = true;
            this.hookPoint = bestPoint;
            this.hookTarget = bestTarget;
        }
    }

    handlePlatformCollision(platform) {
        if (this.vy < 0 || this.hookActive) return;

        const playerBounds = this.getBounds();
        const platBounds = platform.getBounds();
        
        if (playerBounds.right > platBounds.left && 
            playerBounds.left < platBounds.right &&
            playerBounds.bottom >= platBounds.top && 
            playerBounds.bottom - this.vy <= platBounds.top + 20) {
            
            if (platform.danger) {
                this.dead = true;
                return;
            }

            this.y = platBounds.top - this.height;
            this.vy = 0;
            this.onGround = true;
        }
    }
}
