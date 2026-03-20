import { Level } from './Level.js';
import { Player } from './Player.js';
import { Renderer } from './Renderer.js';
import { Input } from './Input.js';
import { Camera } from './Camera.js';
import { Sound } from './Sound.js';
import { ParticleSystem } from './Particles.js';
import { Bubble, Crystal, Door, Meteor, CrumblingPlatform, MovingPlatform } from './Entities.js';

const TOTAL_LEVELS = 100;
const LEVELS_PER_PAGE = 20;

export class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.renderer = new Renderer(ctx);
        this.input = new Input();
        this.camera = new Camera(canvas.width, canvas.height);
        this.sound = new Sound();
        this.particles = new ParticleSystem();

        this.state = 'MENU';
        this.currentLevelId = 1;
        this.unlockedLevels = parseInt(localStorage.getItem('magma_runner_unlocked')) || 1;
        this.totalCrystals = 0;
        this.currentPage = 0;
        
        this.bubbles = [];
        this.meteors = [];
        this.bubbleSpawnTimer = 0;
        this.meteorSpawnTimer = 0;
        this.lavaRisingSpeed = 0.5;
        this.lastEscTime = 0;

        // Timer
        this.levelStartTime = 0;
        this.levelElapsed = 0;
        this.timerRunning = false;

        // Best times & ranks
        this.bestTimes = JSON.parse(localStorage.getItem('magma_runner_times') || '{}');
        this.bestRanks = JSON.parse(localStorage.getItem('magma_runner_ranks') || '{}');

        // Settings
        this.controlStyle = localStorage.getItem('magma_runner_controls') || 'dpad';

        // Mini-map
        this.miniMapCanvas = document.getElementById('mini-map');
        this.miniMapCtx = this.miniMapCanvas ? this.miniMapCanvas.getContext('2d') : null;

        this.setupMenu();
        this.setupPauseMenu();
        this.setupGameOver();
        this.setupSettings();
        this.applyControlStyle();
    }

    // --- MENU ---
    setupMenu() {
        const levelSelect = document.getElementById('level-select');
        if (!levelSelect) return;
        this.renderLevelPage();

        document.getElementById('page-prev').onclick = () => {
            if (this.currentPage > 0) { this.currentPage--; this.renderLevelPage(); }
        };
        document.getElementById('page-next').onclick = () => {
            const maxPage = Math.ceil(TOTAL_LEVELS / LEVELS_PER_PAGE) - 1;
            if (this.currentPage < maxPage) { this.currentPage++; this.renderLevelPage(); }
        };

        document.getElementById('start-btn').onclick = () => {
            document.getElementById('menu').style.display = 'none';
            this.startLevel(this.unlockedLevels);
        };
    }

    renderLevelPage() {
        const levelSelect = document.getElementById('level-select');
        if (!levelSelect) return;
        levelSelect.innerHTML = '';

        const start = this.currentPage * LEVELS_PER_PAGE + 1;
        const end = Math.min(start + LEVELS_PER_PAGE - 1, TOTAL_LEVELS);

        for (let i = start; i <= end; i++) {
            const btn = document.createElement('div');
            const locked = i > this.unlockedLevels;
            btn.className = `level-btn ${locked ? 'locked' : ''}`;
            const rank = this.bestRanks[i];
            let rankHTML = rank ? `<span class="mini-rank rank-${rank.toLowerCase()}">${rank}</span>` : '';
            btn.innerHTML = `<span>${i}</span>${rankHTML}`;
            if (!locked) {
                btn.onclick = () => {
                    this.currentLevelId = i;
                    document.getElementById('menu').style.display = 'none';
                    this.startLevel(i);
                };
            }
            levelSelect.appendChild(btn);
        }

        const totalPages = Math.ceil(TOTAL_LEVELS / LEVELS_PER_PAGE);
        const info = document.getElementById('level-page-info');
        if (info) info.innerText = `Page ${this.currentPage + 1} / ${totalPages}`;
    }

    // --- SETTINGS ---
    setupSettings() {
        const settingsBtn = document.getElementById('settings-btn');
        const settingsBack = document.getElementById('settings-back');
        const toggleSound = document.getElementById('toggle-sound');
        const ctrlDpad = document.getElementById('ctrl-dpad');
        const ctrlJoystick = document.getElementById('ctrl-joystick');

        if (settingsBtn) settingsBtn.onclick = () => {
            document.getElementById('menu').style.display = 'none';
            document.getElementById('settings-menu').style.display = 'flex';
        };
        if (settingsBack) settingsBack.onclick = () => {
            document.getElementById('settings-menu').style.display = 'none';
            document.getElementById('menu').style.display = 'flex';
        };

        if (toggleSound) {
            if (this.sound.muted) toggleSound.classList.remove('active');
            toggleSound.onclick = () => {
                this.sound.setMuted(!this.sound.muted);
                toggleSound.classList.toggle('active');
            };
        }

        if (ctrlDpad) {
            ctrlDpad.onclick = () => {
                this.controlStyle = 'dpad';
                localStorage.setItem('magma_runner_controls', 'dpad');
                ctrlDpad.classList.add('active');
                if (ctrlJoystick) ctrlJoystick.classList.remove('active');
                this.applyControlStyle();
            };
        }
        if (ctrlJoystick) {
            ctrlJoystick.onclick = () => {
                this.controlStyle = 'joystick';
                localStorage.setItem('magma_runner_controls', 'joystick');
                ctrlJoystick.classList.add('active');
                if (ctrlDpad) ctrlDpad.classList.remove('active');
                this.applyControlStyle();
            };
        }

        // Init button states
        if (this.controlStyle === 'joystick') {
            if (ctrlJoystick) ctrlJoystick.classList.add('active');
            if (ctrlDpad) ctrlDpad.classList.remove('active');
        }
    }

    applyControlStyle() {
        const dpad = document.getElementById('dpad-controls');
        const joystick = document.getElementById('joystick-controls');
        if (this.controlStyle === 'joystick') {
            if (dpad) dpad.style.display = 'none';
            if (joystick) joystick.style.display = 'flex';
        } else {
            if (dpad) dpad.style.display = 'flex';
            if (joystick) joystick.style.display = 'none';
        }
    }

    // --- PAUSE ---
    setupPauseMenu() {
        const pBtn = document.getElementById('pause-btn');
        if (pBtn) pBtn.onclick = (e) => { e.stopPropagation(); if (this.state === 'PLAYING') this.togglePause(); };
        const resBtn = document.getElementById('resume-btn');
        if (resBtn) resBtn.onclick = () => this.togglePause();
        const rstBtn = document.getElementById('restart-btn');
        if (rstBtn) rstBtn.onclick = () => { this.togglePause(); this.startLevel(this.currentLevelId); };
        const qpBtn = document.getElementById('quit-pause-btn');
        if (qpBtn) qpBtn.onclick = () => { this.togglePause(); this.showLevelSelect(); };
    }

    setupGameOver() {
        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) retryBtn.onclick = () => { document.getElementById('game-over').style.display = 'none'; this.startLevel(this.currentLevelId); };
        const quitBtn = document.getElementById('quit-btn');
        if (quitBtn) quitBtn.onclick = () => { document.getElementById('game-over').style.display = 'none'; this.showLevelSelect(); };
    }

    // --- CONTROLS VISIBILITY ---
    showControls() {
        const vc = document.getElementById('virtual-controls');
        if (vc && window.innerWidth <= 768) vc.style.display = 'flex';
        const mm = document.getElementById('mini-map');
        if (mm) mm.style.display = 'block';
    }
    hideControls() {
        const vc = document.getElementById('virtual-controls');
        if (vc) vc.style.display = 'none';
        const mm = document.getElementById('mini-map');
        if (mm) mm.style.display = 'none';
    }

    showLevelSelect() {
        this.state = 'MENU';
        this.timerRunning = false;
        this.sound.stopLava();
        this.hideControls();
        document.getElementById('menu').style.display = 'flex';
        document.getElementById('hud').style.display = 'none';
        document.getElementById('pause-menu').style.display = 'none';
        this.renderLevelPage();
    }

    // --- START LEVEL ---
    startLevel(id) {
        this.state = 'PLAYING';
        this.currentLevelId = id;
        this.level = new Level(id);
        this.player = new Player(this.level.spawnPoint.x, this.level.spawnPoint.y);
        this.bubbles = [];
        this.meteors = [];
        this.particles.clear();
        this.totalCrystals = this.level.crystals.length;
        
        const lavaY = this.level.risingLava ? 600 + 200 : 2500;
        this.lava = { x: -1000, y: lavaY, width: 10000, height: 2000, update: (s) => this.lava.y -= s };

        this.levelStartTime = Date.now();
        this.levelElapsed = 0;
        this.timerRunning = true;

        this.lavaRisingSpeed = 0.3 + (id / 100) * 0.7;

        document.getElementById('hud').style.display = 'flex';
        document.getElementById('game-over').style.display = 'none';
        document.getElementById('win-screen').style.display = 'none';
        document.getElementById('pause-menu').style.display = 'none';
        this.showControls();
        this.applyControlStyle();
        this.updateHUD();
    }

    togglePause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
            this.timerRunning = false;
            this.hideControls();
            document.getElementById('pause-menu').style.display = 'flex';
        } else if (this.state === 'PAUSED') {
            this.state = 'PLAYING';
            this.timerRunning = true;
            this.levelStartTime = Date.now() - this.levelElapsed;
            this.showControls();
            document.getElementById('pause-menu').style.display = 'none';
        }
    }

    // --- UPDATE ---
    update() {
        const now = Date.now();

        if (this.timerRunning) {
            this.levelElapsed = now - this.levelStartTime;
            const el = document.getElementById('timer-display');
            if (el) el.innerText = this.formatTime(this.levelElapsed);
        }

        if (this.state === 'MENU' || this.state === 'PAUSED') {
            if (this.state === 'PAUSED' && this.input.isPressed('Escape')) {
                if (now - this.lastEscTime > 200) { this.togglePause(); this.lastEscTime = now; }
            }
            return;
        }

        if (this.state === 'WIN' || this.state === 'GAME_OVER') return;

        if (this.input.isPressed('Escape')) {
            if (now - this.lastEscTime > 200) { this.togglePause(); this.lastEscTime = now; }
            return;
        }

        this.player.update(this.input, this.particles, this.level.platforms, this.bubbles, this.sound);
        this.camera.update(this.player);
        this.particles.update();

        if (this.level.risingLava) this.lava.update(this.lavaRisingSpeed);

        if (this.player.y > (this.level.risingLava ? this.lava.y : 3000)) {
            this.death('Fell into the void!');
        }

        if (this.player.y + this.player.height > this.lava.y && this.level.risingLava) {
           this.death('Consumed by rising magma!');
        }

        // Update moving & crumbling platforms
        this.level.platforms.forEach(p => {
            if (p.type === 'MOVING' || p.type === 'CRUMBLING' || p.type === 'CRUMBLE') {
                p.update();
            }
        });

        // Remove fallen crumbling platforms
        this.level.platforms = this.level.platforms.filter(p => p.active);

        // Platform collisions
        this.level.platforms.forEach(p => {
            this.player.handlePlatformCollision(p);
            // Trigger crumble when player lands on it
            if (p.type === 'CRUMBLING' && this.player.onGround) {
                const pb = this.player.getBounds();
                const plb = p.getBounds();
                if (pb.right > plb.left && pb.left < plb.right && Math.abs(pb.bottom - plb.top) < 5) {
                    p.startCrumble();
                }
            }
        });
        
        // Bubbles
        this.bubbles.forEach((b, index) => {
            b.update();
            if (!b.active) { this.bubbles.splice(index, 1); return; }
            this.player.handlePlatformCollision(b);
        });

        // Meteors
        if (this.level.hasMeteors) {
            this.meteorSpawnTimer++;
            if (this.meteorSpawnTimer >= this.level.meteorInterval) {
                const mx = this.player.x + (Math.random() - 0.5) * 500;
                const my = this.camera.y - 100;
                this.meteors.push(new Meteor(mx, my));
                this.meteorSpawnTimer = 0;
            }
        }

        this.meteors.forEach((m, i) => {
            m.update();
            if (!m.active) { this.meteors.splice(i, 1); return; }
            if (this.player.collidesWith(m)) {
                this.death('Struck by a meteor!');
            }
        });

        // Crystals
        this.level.crystals.forEach((c) => {
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

        if (this.player.dead) this.death('Struck a deadly hazard!');

        this.bubbleSpawnTimer++;
        if (this.bubbleSpawnTimer > 60) {
            const x = this.player.x + (Math.random() - 0.5) * 600;
            const y = this.player.y + 600;
            this.bubbles.push(new Bubble(x, y));
            this.sound.bubble();
            this.bubbleSpawnTimer = 0;
        }
    }

    // --- DRAW ---
    draw() {
        this.renderer.clear(this.camera);
        this.camera.apply(this.ctx);

        if (this.state === 'PLAYING' || this.state === 'PAUSED' || this.state === 'GAME_OVER' || this.state === 'WIN') {
            this.level.platforms.forEach(p => this.renderer.drawPlatform(p));
            this.level.crystals.forEach(c => { if (c.active) this.renderer.drawCrystal(c); });
            this.renderer.drawDoor(this.level.door);
            this.bubbles.forEach(b => this.renderer.drawBubble(b));
            this.meteors.forEach(m => this.renderer.drawMeteor(m));
            this.renderer.drawLava(this.lava);
            this.renderer.drawPlayer(this.player);
            this.particles.draw(this.ctx);
        }

        this.camera.release(this.ctx);

        // Mini-map
        if (this.state === 'PLAYING' && this.miniMapCtx) {
            this.drawMiniMap();
        }
    }

    // --- MINI MAP ---
    drawMiniMap() {
        const mc = this.miniMapCtx;
        const mw = 120, mh = 90;
        mc.clearRect(0, 0, mw, mh);
        mc.fillStyle = 'rgba(0,0,0,0.6)';
        mc.fillRect(0, 0, mw, mh);
        mc.strokeStyle = 'rgba(255,255,255,0.2)';
        mc.strokeRect(0, 0, mw, mh);

        // Calculate bounds of the level
        let minX = 0, minY = -100, maxX = 1000, maxY = 700;
        this.level.platforms.forEach(p => {
            if (p.x + p.width > maxX) maxX = p.x + p.width;
            if (p.y + p.height > maxY) maxY = p.y + p.height;
            if (p.x < minX) minX = p.x;
            if (p.y < minY) minY = p.y;
        });
        if (this.level.door) {
            if (this.level.door.x + 60 > maxX) maxX = this.level.door.x + 60;
            if (this.level.door.y < minY) minY = this.level.door.y;
        }
        maxX += 100; maxY += 100;
        minX -= 50; minY -= 50;

        const scaleX = mw / (maxX - minX);
        const scaleY = mh / (maxY - minY);
        const scale = Math.min(scaleX, scaleY);

        const tx = (x) => (x - minX) * scale;
        const ty = (y) => (y - minY) * scale;

        // Draw platforms
        this.level.platforms.forEach(p => {
            mc.fillStyle = p.danger ? '#ff2200' : (p.type === 'CRUMBLING' ? '#8B7355' : (p.type === 'MOVING' ? '#5577aa' : '#555'));
            mc.fillRect(tx(p.x), ty(p.y), Math.max(p.width * scale, 1), Math.max(p.height * scale, 1));
        });

        // Draw crystals
        this.level.crystals.forEach(c => {
            if (!c.active) return;
            mc.fillStyle = '#00f2ff';
            mc.fillRect(tx(c.x), ty(c.y), 3, 3);
        });

        // Draw door
        if (this.level.door) {
            mc.fillStyle = this.level.door.unlocked ? '#00ff88' : '#ffcc00';
            mc.fillRect(tx(this.level.door.x), ty(this.level.door.y), 4, 5);
        }

        // Draw player
        mc.fillStyle = '#ff3e00';
        mc.fillRect(tx(this.player.x), ty(this.player.y), 4, 5);

        // Camera viewport indicator
        mc.strokeStyle = 'rgba(255,255,255,0.4)';
        mc.lineWidth = 0.5;
        mc.strokeRect(tx(this.camera.x), ty(this.camera.y), this.canvas.width * scale, this.canvas.height * scale);
    }

    // --- HUD ---
    updateHUD() {
        const el = document.getElementById('crystal-count');
        if (el) el.innerText = `${this.level.collectedCrystals} / ${this.totalCrystals}`;
    }

    formatTime(ms) {
        const totalSec = Math.floor(ms / 1000);
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;
        return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }

    death(msg) {
        this.state = 'GAME_OVER';
        this.timerRunning = false;
        this.sound.death();
        this.sound.stopLava();
        this.camera.triggerShake(15);
        this.hideControls();
        document.getElementById('game-over').style.display = 'flex';
        document.getElementById('game-over-msg').innerText = msg;
    }

    win() {
        this.state = 'WIN';
        this.timerRunning = false;
        this.sound.win();
        this.sound.stopLava();
        this.hideControls();

        const elapsed = this.levelElapsed;
        const timeSec = elapsed / 1000;
        const rank = Level.getRank(this.currentLevelId, timeSec);

        const prevBest = this.bestTimes[this.currentLevelId];
        if (!prevBest || elapsed < prevBest) {
            this.bestTimes[this.currentLevelId] = elapsed;
            this.bestRanks[this.currentLevelId] = rank;
            localStorage.setItem('magma_runner_times', JSON.stringify(this.bestTimes));
            localStorage.setItem('magma_runner_ranks', JSON.stringify(this.bestRanks));
        }

        if (this.currentLevelId === this.unlockedLevels && this.unlockedLevels < TOTAL_LEVELS) {
            this.unlockedLevels++;
            localStorage.setItem('magma_runner_unlocked', this.unlockedLevels);
        }

        document.getElementById('win-screen').style.display = 'flex';
        document.getElementById('win-level').innerText = `Level ${this.currentLevelId} Clear!`;
        document.getElementById('win-time').innerText = this.formatTime(elapsed);
        
        const rankEl = document.getElementById('win-rank');
        if (rankEl) {
            rankEl.innerText = rank;
            rankEl.className = `rank-badge rank-${rank.toLowerCase()}`;
        }

        const bestRow = document.getElementById('win-best-row');
        const bestEl = document.getElementById('win-best');
        if (prevBest && bestEl && bestRow) {
            bestRow.style.display = 'flex';
            bestEl.innerText = this.formatTime(Math.min(prevBest, elapsed));
        }

        setTimeout(() => this.sound.rank(), 400);

        const nextBtn = document.getElementById('next-level-btn');
        if (nextBtn) {
            nextBtn.onclick = () => {
                document.getElementById('win-screen').style.display = 'none';
                if (this.currentLevelId < TOTAL_LEVELS) {
                    this.startLevel(this.currentLevelId + 1);
                } else {
                    this.showLevelSelect();
                }
            };
        }
    }
}
