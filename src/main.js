import './style.css';
import { Game } from './game/Game.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const game = new Game(canvas, ctx);

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/public/sw.js')
            .then(reg => console.log('🚀 Service Worker Registered!', reg.scope))
            .catch(err => console.log('❌ SW Registration Failed', err));
    });
}

function resize() {
    const container = document.getElementById('game-container');
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Maintain 4:3 aspect ratio but fit within screen
    const targetRatio = 800 / 600;
    const currentRatio = width / height;
    
    if (currentRatio > targetRatio) {
        // Wider than 4:3
        canvas.style.height = '100%';
        canvas.style.width = 'auto';
    } else {
        // Taller than 4:3
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
    }
}

window.addEventListener('resize', resize);
resize();

// UI Event Listeners
document.getElementById('start-btn').onclick = () => {
    // Attempt fullscreen on mobile
    if (document.documentElement.requestFullscreen && window.innerWidth < 768) {
        document.documentElement.requestFullscreen().catch(() => {});
    }
    game.start();
};

document.getElementById('restart-btn').onclick = () => {
    game.restart();
};

document.getElementById('next-level-btn').onclick = () => {
    game.nextLevel();
};

// Handle Keyboard for Menu
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && game.state === 'PLAYING') {
        game.showMenu();
    }
});

function gameLoop(timestamp) {
    game.update(timestamp);
    game.draw();
    requestAnimationFrame(gameLoop);
}

// Ensure first frame is drawn
game.draw();
requestAnimationFrame(gameLoop);
