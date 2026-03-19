export class Renderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.frame = 0;
    }

    clear(camera) {
        this.frame++;
        this.ctx.globalAlpha = 1.0;
        this.ctx.shadowBlur = 0;
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        
        // Deep Cave Background
        const grad = this.ctx.createLinearGradient(0, 0, 0, this.ctx.canvas.height);
        grad.addColorStop(0, '#0d0008');
        grad.addColorStop(0.5, '#1a0505');
        grad.addColorStop(1, '#050002');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // Parallax Dust
        this.ctx.save();
        this.ctx.translate(-camera.x * 0.1, -camera.y * 0.1);
        this.ctx.fillStyle = 'rgba(255, 50, 0, 0.15)';
        for (let i = 0; i < 40; i++) {
            const x = (i * 1532.7) % 3000;
            const y = (i * 847.2) % 3000;
            this.ctx.fillRect(x, y, 2, 2);
        }
        this.ctx.restore();
    }

    drawRect(x, y, w, h, color, glow = 0) {
        this.ctx.save();
        if (glow > 0) {
            this.ctx.shadowBlur = glow;
            this.ctx.shadowColor = (typeof color === 'string') ? color : '#ff4400';
        }
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, w, h);
        this.ctx.restore();
    }

    drawCircle(x, y, r, color, glow = 0) {
        this.ctx.save();
        if (glow > 0) {
            this.ctx.shadowBlur = glow;
            this.ctx.shadowColor = (typeof color === 'string') ? color : '#00f2ff';
        }
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }

    drawPlatform(p) {
        const { x, y, width, height, type } = p;
        if (type === 'SPIKE') {
            this.drawSpikes(x, y, width, height);
        } else if (type === 'LAVA_POOL') {
            this.drawRealisticLava(x, y + 5, width, height - 5);
        } else {
            const grad = this.ctx.createLinearGradient(x, y, x, y + height);
            grad.addColorStop(0, '#3a2a2a');
            grad.addColorStop(1, '#110d0d');
            this.drawRect(x, y, width, height, grad);
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x, y, width, height);
            
            // Rock texture detail
            this.ctx.globalAlpha = 0.05;
            this.ctx.fillStyle = '#fff';
            this.ctx.fillRect(x + 5, y + 5, 20, 2);
            this.ctx.fillRect(x + width - 25, y + height - 5, 20, 2);
            this.ctx.globalAlpha = 1.0;
        }
    }

    drawSpikes(x, y, w, h) {
        this.ctx.fillStyle = '#444';
        this.ctx.beginPath();
        for (let i = 0; i < w; i += 12) {
            this.ctx.moveTo(x + i, y + h);
            this.ctx.lineTo(x + i + 6, y);
            this.ctx.lineTo(x + i + 12, y + h);
        }
        this.ctx.fill();
        this.ctx.strokeStyle = '#111';
        this.ctx.stroke();
    }

    drawRealisticLava(x, y, w, h) {
        this.ctx.save();
        const t = this.frame * 0.05;
        
        // Multi-layered wavy surface
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + h);
        this.ctx.lineTo(x, y);
        for (let i = 0; i <= w; i += 10) {
            const wave = Math.sin(t + i * 0.05) * 6 + Math.cos(t * 0.5 + i * 0.02) * 4;
            this.ctx.lineTo(x + i, y + wave + 5);
        }
        this.ctx.lineTo(x + w, y + h);
        this.ctx.closePath();

        // 1st layer (Core Heat)
        const grad = this.ctx.createLinearGradient(x, y, x, y + h);
        grad.addColorStop(0, '#ffcc00');
        grad.addColorStop(0.2, '#ff6600');
        grad.addColorStop(1, '#660000');
        this.ctx.fillStyle = grad;
        this.ctx.fill();

        // 2nd layer (Ripples)
        this.ctx.globalAlpha = 0.3;
        this.ctx.fillStyle = '#ffaa00';
        for(let j=0; j<3; j++) {
            this.ctx.beginPath();
            const yOffset = j * 20;
            const tOffset = j * 1.5;
            this.ctx.moveTo(x, y + h);
            for (let i = 0; i <= w; i += 20) {
                const wave = Math.sin(t + tOffset + i * 0.1) * 8;
                this.ctx.lineTo(x + i, y + yOffset + wave + 10);
            }
            this.ctx.lineTo(x + w, y + h);
            this.ctx.fill();
        }

        this.ctx.restore();
    }

    drawCrystal(c) {
        const cx = c.x + c.width / 2;
        const cy = c.y + c.height / 2 + (c.yOffset || 0);
        this.drawCircle(cx, cy, 12, '#00f2ff', 20);
        this.drawCircle(cx, cy, 6, '#fff', 0);
    }

    drawBubble(b) {
        // High-fidelity Glassy Bubble
        const cx = b.x + b.width / 2;
        const cy = b.y + b.height / 2;
        const r = b.width / 2;

        this.ctx.save();
        
        // 1. Outer cyan glow
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = 'rgba(0, 242, 255, 0.4)';

        // 2. Base radial gradient (glass body)
        const grad = this.ctx.createRadialGradient(cx - r*0.3, cy - r*0.3, r*0.1, cx, cy, r);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        grad.addColorStop(0.3, 'rgba(0, 242, 255, 0.2)');
        grad.addColorStop(1, 'rgba(0, 100, 255, 0.1)');
        
        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
        this.ctx.fill();

        // 3. Crisp white highlights (Specularity)
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.beginPath();
        this.ctx.ellipse(cx - r*0.4, cy - r*0.4, r*0.3, r*0.15, -Math.PI/4, 0, Math.PI*2);
        this.ctx.fill();

        // 4. Subtle bottom reflection
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.beginPath();
        this.ctx.ellipse(cx + r*0.2, cy + r*0.6, r*0.4, r*0.1, 0, 0, Math.PI*2);
        this.ctx.fill();

        // 5. Thin crisp outline
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        this.ctx.restore();
    }

    drawLava(lava) {
        this.drawRealisticLava(lava.x, lava.y, lava.width, lava.height);
    }

    drawDoor(door) {
        const { x, y, width, height, unlocked } = door;
        
        // Frame
        this.ctx.fillStyle = '#4a2c00';
        this.ctx.fillRect(x, y, width, height);
        this.ctx.strokeStyle = unlocked ? '#00ff88' : '#ff4400';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x+4, y+4, width-8, height-4);

        // Door surface
        this.ctx.fillStyle = unlocked ? '#001a0d' : '#1a0d00';
        this.ctx.fillRect(x + 8, y + 8, width - 16, height - 8);

        // Glow (Exit portal effect)
        if (unlocked) {
            this.ctx.save();
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = '#00ff88';
            this.ctx.fillStyle = 'rgba(0, 255, 136, 0.4)';
            this.ctx.fillRect(x + 12, y + 12, width - 24, height - 12);
            this.ctx.restore();
        } else {
            // Locked icon/mark
            this.ctx.fillStyle = 'rgba(255, 68, 0, 0.3)';
            this.ctx.font = '20px Arial';
            this.ctx.fillText('✖', x + width/2 - 10, y + height/2 + 5);
        }

        // Handle
        this.ctx.fillStyle = unlocked ? '#00ff88' : '#666';
        this.ctx.beginPath();
        this.ctx.arc(x + width - 15, y + height/2 + 5, 3, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawPlayer(player) {
        const { x, y, width, height, faceDir, hookActive, hookPoint, parachuteActive, onGround } = player;
        const jump = onGround ? 0 : -3;

        // Rope Line
        if (hookActive && hookPoint) {
            this.ctx.save();
            this.ctx.strokeStyle = '#fff';
            this.ctx.setLineDash([4, 4]);
            this.ctx.shadowBlur = 5;
            this.ctx.shadowColor = '#fff';
            this.ctx.beginPath();
            this.ctx.moveTo(x + width/2, y + height/2);
            this.ctx.lineTo(hookPoint.x, hookPoint.y);
            this.ctx.stroke();
            this.ctx.restore();
        }

        this.ctx.save();
        this.ctx.translate(x + width/2, y + height/2);
        if (faceDir === -1) this.ctx.scale(-1, 1);
        
        const hw = width/2;
        const hh = height/2;

        // More detailed Character
        const shirt = '#e62e00';
        const pants = '#1a53ff';
        const skin = '#ffdbac';

        // Body with shadow
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.fillRect(-hw+6, -hh+17+jump, 24, 20);
        
        this.ctx.fillStyle = shirt;
        this.ctx.fillRect(-hw+4, -hh+15+jump, 24, 20);
        
        // Shirt detail (cross/vest)
        this.ctx.fillStyle = 'rgba(0,0,0,0.1)';
        this.ctx.fillRect(-hw+14, -hh+15+jump, 4, 20);

        // Head
        this.ctx.fillStyle = skin;
        this.ctx.fillRect(-hw+6, -hh+jump, 20, 16);
        this.ctx.fillStyle = '#333'; // Eyes
        this.ctx.fillRect(-hw+16, -hh+6+jump, 4, 4);
        this.ctx.fillStyle = '#5c3c10'; // Hair/Hat
        this.ctx.fillRect(-hw+6, -hh+jump, 20, 5);

        // Legs / Pants
        this.ctx.fillStyle = pants;
        const legH = 13;
        const legW = 10;
        // Animation for legs if not on ground
        const legOffset = onGround ? 0 : Math.sin(this.frame * 0.2) * 5;
        this.ctx.fillRect(-hw+4, -hh+35+jump, legW, legH + (onGround ? 0 : -Math.abs(legOffset)));
        this.ctx.fillRect(-hw+18, -hh+35+jump, legW, legH + (onGround ? 0 : Math.abs(legOffset)));

        // Feet
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(-hw+4, -hh+48+jump-2, legW, 4);
        this.ctx.fillRect(-hw+18, -hh+48+jump-2, legW, 4);

        // Glide effect
        if (parachuteActive) {
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(0, -hh-20, 45, Math.PI, 0);
            this.ctx.stroke();
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            this.ctx.fill();
        }

        this.ctx.restore();
    }
}
