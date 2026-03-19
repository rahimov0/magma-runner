import { Level } from './Level.js';
import { Player } from './Player.js';
import { Renderer } from './Renderer.js';
import { Input } from './Input.js';
import { Camera } from './Camera.js';
import { Sound } from './Sound.js';
import { ParticleSystem } from './Particles.js';
import { Bubble, Crystal, Door } from './Entities.js';

export class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.renderer = new Renderer(ctx);
        this.input = new Input();
        this.camera = new Camera(canvas.width, canvas.height);
        this.sound = new Sound();
        this.particles = new ParticleSystem();

        this.state = 'MENU'; // MENU, PLAYING, PAUSED, GAME_OVER, WIN
        this.currentLevelId = 1;
        this.unlockedLevels = parseInt(localStorage.getItem('magma_runner_unlocked')) || 1;
        this.totalCrystals = 0;
        
        this.bubbles = [];
        this.bubbleSpawnTimer = 0;
        this.lavaRisingSpeed = 0.5;
        this.lastEscTime = 0;

        this.setupMenu();
        this.setupPauseMenu();
        this.setupGameOver();
    }

    setupMenu() {
        const levelSelect = document.getElementById('level-select');
        if (!levelSelect) return;
        
        levelSelect.innerHTML = '';
        for (let i = 1; i <= 15; i++) {
            const btn = document.createElement('div');
            btn.className = `level-btn ${i > this.unlockedLevels ? 'locked' : ''}`;
            btn.innerHTML = `<span>${i}</span>`;
            if (i <= this.unlockedLevels) {
                btn.onclick = () => {
                    this.currentLevelId = i;
                    document.getElementById('menu').style.display = 'none';
                    this.startLevel(i);
                };
            }
            levelSelect.appendChild(btn);
        }

        document.getElementById('start-btn').onclick = () => {
            document.getElementById('menu').style.display = 'none';
            this.startLevel(this.unlockedLevels);
        };
    }

    setupPauseMenu() {
        const pBtn = document.getElementById('pause-btn');
        if (pBtn) {
            pBtn.onclick = (e) => {
                e.stopPropagation();
                if (this.state === 'PLAYING') this.togglePause();
            };
        }

        const resBtn = document.getElementById('resume-btn');
        if (resBtn) resBtn.onclick = () => this.togglePause();
        
        const rstBtn = document.getElementById('restart-btn');
        if (rstBtn) rstBtn.onclick = () => {
            this.togglePause();
            this.startLevel(this.currentLevelId);
        };

        const qpBtn = document.getElementById('quit-pause-btn');
        if (qpBtn) qpBtn.onclick = () => {
            this.togglePause();
            this.showLevelSelect();
        };
    }

    setupGameOver() {
        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) retryBtn.onclick = () => {
            document.getElementById('game-over').style.display = 'none';
            this.startLevel(this.currentLevelId);
        };
        const quitBtn = document.getElementById('quit-btn');
        if (quitBtn) quitBtn.onclick = () => {
            document.getElementById('game-over').style.display = 'none';
            this.showLevelSelect();
        };
    }

    showLevelSelect() {
        this.state = 'MENU';
        this.sound.stopLava();
        document.getElementById('menu').style.display = 'flex';
        document.getElementById('hud').style.display = 'none';
        document.getElementById('pause-menu').style.display = 'none';
        this.setupMenu();
    }

    startLevel(id) {
        this.state = 'PLAYING';
        this.currentLevelId = id;
        this.level = new Level(id);
        this.player = new Player(this.level.spawnPoint.x, this.level.spawnPoint.y);
        this.bubbles = [];
        this.particles.clear();
        this.totalCrystals = this.level.crystals.length;
        
        const lavaY = this.level.risingLava ? 600 + 200 : 2500;
        this.lava = { x: -1000, y: lavaY, width: 10000, height: 2000, update: (s) => this.lava.y -= s };

        document.getElementById('hud').style.display = 'flex';
        document.getElementById('game-over').style.display = 'none';
        document.getElementById('win-screen').style.display = 'none';
        document.getElementById('pause-menu').style.display = 'none';
        this.updateHUD();
    }

    togglePause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
            document.getElementById('pause-menu').style.display = 'flex';
        } else if (this.state === 'PAUSED') {
            this.state = 'PLAYING';
            document.getElementById('pause-menu').style.display = 'none';
        }
    }

    update() {
        const now = Date.now();
        if (this.state === 'MENU' || this.state === 'PAUSED') {
            if (this.state === 'PAUSED' && this.input.isPressed('Escape')) {
                if (now - this.lastEscTime > 200) {
                    this.togglePause();
                    this.lastEscTime = now;
                }
            }
            return;
        }

        if (this.state === 'WIN' || this.state === 'GAME_OVER') return;

        if (this.input.isPressed('Escape')) {
            if (now - this.lastEscTime > 200) {
                this.togglePause();
                this.lastEscTime = now;
            }
            return;
        }

        this.player.update(this.input, this.particles, this.level.platforms, this.bubbles, this.sound);
        this.camera.update(this.player);
        this.particles.update();

        if (this.level.risingLava) {
            this.lava.update(this.lavaRisingSpeed);
        }

        if (this.player.y > (this.level.risingLava ? this.lava.y : 3000)) {
            this.death('Fell into the void!');
        }

        if (this.player.y + this.player.height > this.lava.y && this.level.risingLava) {
           this.death('Consumed by rising magma!');
        }

        this.level.platforms.forEach(p => this.player.handlePlatformCollision(p));
        
        this.bubbles.forEach((b, index) => {
            b.update();
            if (!b.active) {
                this.bubbles.splice(index, 1);
                return;
            }
            this.player.handlePlatformCollision(b);
        });

        this.level.crystals.forEach((c, index) => {
            if (c.active && this.player.collidesWith(c)) {
                c.active = false;
                this.level.collectedCrystals++;
                this.sound.collect();
                this.particles.burst(c.x + c.width/2, c.y + c.height/2, '#00f2ff', 15);
                this.updateHUD();

                if (this.level.collectedCrystals >= this.totalCrystals) {
                    this.level.door.unlocked = true;
                    this.particles.burst(this.level.door.x + 30, this.level.door.y + 40, '#00ff88', 30);
                }
            }
        });

        if (this.level.door.active && this.level.door.unlocked && this.player.collidesWith(this.level.door)) {
            this.win();
        }

        if (this.player.dead) {
            this.death('Struck a deadly hazard!');
        }

        this.bubbleSpawnTimer++;
        if (this.bubbleSpawnTimer > 60) {
            const x = this.player.x + (Math.random() - 0.5) * 600;
            const y = this.player.y + 600;
            this.bubbles.push(new Bubble(x, y));
            this.sound.bubble();
            this.bubbleSpawnTimer = 0;
        }
    }

    draw() {
        this.renderer.clear(this.camera);
        this.camera.apply(this.ctx);

        if (this.state === 'PLAYING' || this.state === 'PAUSED' || this.state === 'GAME_OVER' || this.state === 'WIN') {
            this.level.platforms.forEach(p => this.renderer.drawPlatform(p));
            this.level.crystals.forEach(c => { if (c.active) this.renderer.drawCrystal(c); });
            this.renderer.drawDoor(this.level.door);
            this.bubbles.forEach(b => this.renderer.drawBubble(b));
            this.renderer.drawLava(this.lava);
            this.renderer.drawPlayer(this.player);
            this.particles.draw(this.ctx);
        }

        this.camera.release(this.ctx);
    }

    updateHUD() {
        const el = document.getElementById('crystal-count');
        if (el) el.innerText = `${this.level.collectedCrystals} / ${this.totalCrystals}`;
    }

    death(msg) {
        this.state = 'GAME_OVER';
        this.sound.death();
        this.sound.stopLava();
        this.camera.triggerShake(15);
        document.getElementById('game-over').style.display = 'flex';
        document.getElementById('game-over-msg').innerText = msg;
    }

    win() {
        this.state = 'WIN';
        this.sound.win();
        this.sound.stopLava();
        if (this.currentLevelId === this.unlockedLevels && this.unlockedLevels < 15) {
            this.unlockedLevels++;
            localStorage.setItem('magma_runner_unlocked', this.unlockedLevels);
        }
        document.getElementById('win-screen').style.display = 'flex';
        document.getElementById('win-level').innerText = `Level ${this.currentLevelId} Clear!`;
        
        const nextBtn = document.getElementById('next-level-btn');
        if (nextBtn) {
            nextBtn.onclick = () => {
                document.getElementById('win-screen').style.display = 'none';
                if (this.currentLevelId < 15) {
                    this.startLevel(this.currentLevelId + 1);
                } else {
                    this.showLevelSelect();
                }
            };
        }
    }
}
