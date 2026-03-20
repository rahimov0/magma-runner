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
            this.keys.add(e.code);
        });

        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            const mapped = this.keyMap[key];
            if (mapped) this.keys.delete(mapped);
            this.keys.delete(e.code);
        });

        // D-Pad Touch Controls
        this.bindTouch('btn-left', 'ArrowLeft');
        this.bindTouch('btn-right', 'ArrowRight');
        this.bindTouch('btn-jump', 'ArrowUp');
        this.bindTouch('btn-glide', 'KeyC');
        this.bindTouch('btn-hook', 'KeyX');

        // Joystick
        this.joystickActive = false;
        this.joystickX = 0;
        this.joystickY = 0;
        this.setupJoystick();
    }

    setupJoystick() {
        const zone = document.getElementById('joystick-zone');
        const knob = document.getElementById('joystick-knob');
        if (!zone || !knob) return;

        let baseX = 0, baseY = 0, dragging = false;

        const start = (e) => {
            e.preventDefault();
            const touch = e.touches ? e.touches[0] : e;
            const rect = zone.getBoundingClientRect();
            baseX = rect.left + rect.width / 2;
            baseY = rect.top + rect.height / 2;
            dragging = true;
            this.joystickActive = true;
        };

        const move = (e) => {
            if (!dragging) return;
            e.preventDefault();
            const touch = e.touches ? e.touches[0] : e;
            const dx = touch.clientX - baseX;
            const dy = touch.clientY - baseY;
            const maxDist = 35;
            const dist = Math.min(Math.sqrt(dx*dx + dy*dy), maxDist);
            const angle = Math.atan2(dy, dx);
            const clampX = Math.cos(angle) * dist;
            const clampY = Math.sin(angle) * dist;
            
            knob.style.transform = `translate(${clampX}px, ${clampY}px)`;
            
            this.joystickX = clampX / maxDist;
            this.joystickY = clampY / maxDist;

            // Map to keys
            const deadzone = 0.3;
            if (this.joystickX < -deadzone) { this.keys.add('ArrowLeft'); this.keys.delete('ArrowRight'); }
            else if (this.joystickX > deadzone) { this.keys.add('ArrowRight'); this.keys.delete('ArrowLeft'); }
            else { this.keys.delete('ArrowLeft'); this.keys.delete('ArrowRight'); }

            if (this.joystickY < -deadzone) { this.keys.add('ArrowUp'); }
            else { this.keys.delete('ArrowUp'); }
        };

        const end = (e) => {
            dragging = false;
            this.joystickActive = false;
            this.joystickX = 0;
            this.joystickY = 0;
            knob.style.transform = 'translate(0px, 0px)';
            this.keys.delete('ArrowLeft');
            this.keys.delete('ArrowRight');
            this.keys.delete('ArrowUp');
        };

        zone.addEventListener('touchstart', start);
        zone.addEventListener('touchmove', move);
        zone.addEventListener('touchend', end);
        zone.addEventListener('touchcancel', end);

        zone.addEventListener('mousedown', start);
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', end);
    }

    bindTouch(id, key) {
        const btn = document.getElementById(id);
        if (!btn) return;

        const start = (e) => { e.preventDefault(); this.keys.add(key); };
        const end = (e) => { e.preventDefault(); this.keys.delete(key); };

        btn.addEventListener('touchstart', start);
        btn.addEventListener('touchend', end);
        btn.addEventListener('touchcancel', end);
        btn.addEventListener('mousedown', start);
        btn.addEventListener('mouseup', end);
        btn.addEventListener('mouseleave', end);
    }

    isPressed(key) {
        return this.keys.has(key);
    }
}
