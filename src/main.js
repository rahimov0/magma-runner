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
    const width = window.innerWidth;
    const height = window.innerHeight;
    const targetRatio = 800 / 600;
    const currentRatio = width / height;
    
    if (currentRatio > targetRatio) {
        canvas.style.height = '100%';
        canvas.style.width = 'auto';
    } else {
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
    }
}

window.addEventListener('resize', resize);
resize();

function gameLoop() {
    game.update();
    game.draw();
    requestAnimationFrame(gameLoop);
}

game.draw();
requestAnimationFrame(gameLoop);
