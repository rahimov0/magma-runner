export class Input {
    constructor() {
        this.keys = new Set();
        this.keyMap = {
            'arrowup': 'ArrowUp', 'w': 'ArrowUp',
            'arrowdown': 'ArrowDown', 's': 'ArrowDown',
            'arrowleft': 'ArrowLeft', 'a': 'ArrowLeft',
            'arrowright': 'ArrowRight', 'd': 'ArrowRight',
            ' ': 'Space', 'c': 'KeyC', 'x': 'KeyX',
            'escape': 'Escape'
        };

        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            const mapped = this.keyMap[key];
            if (mapped) this.keys.add(mapped);
            this.keys.add(e.code); // Always add code for fallback
        });

        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            const mapped = this.keyMap[key];
            if (mapped) this.keys.delete(mapped);
            this.keys.delete(e.code);
        });

        // Touch Controls
        this.bindTouch('btn-left', 'ArrowLeft');
        this.bindTouch('btn-right', 'ArrowRight');
        this.bindTouch('btn-jump', 'ArrowUp');
        this.bindTouch('btn-glide', 'KeyC');
        this.bindTouch('btn-hook', 'KeyX');
    }

    bindTouch(id, key) {
        const btn = document.getElementById(id);
        if (!btn) return;

        const start = (e) => {
            e.preventDefault();
            this.keys.add(key);
        };
        const end = (e) => {
            e.preventDefault();
            this.keys.delete(key);
        };

        btn.addEventListener('touchstart', start);
        btn.addEventListener('touchend', end);
        btn.addEventListener('touchcancel', end);
        
        // Also support mouse for testing in devtools
        btn.addEventListener('mousedown', start);
        btn.addEventListener('mouseup', end);
        btn.addEventListener('mouseleave', end);
    }

    isPressed(key) {
        return this.keys.has(key);
    }
}
