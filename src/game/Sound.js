export class Sound {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.lavaGain = this.ctx.createGain();
        this.lavaGain.connect(this.ctx.destination);
        this.lavaOsc = null;
    }

    play(freq, type, duration, vol = 0.1) {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    jump() {
        this.play(180, 'square', 0.1, 0.05);
    }

    collect() {
        this.play(800, 'sine', 0.2, 0.1);
        setTimeout(() => this.play(1200, 'sine', 0.2, 0.1), 50);
    }

    bubble() {
        this.play(Math.random() * 200 + 1000, 'sine', 0.15, 0.03);
    }

    death() {
        this.play(100, 'sawtooth', 0.8, 0.2);
    }

    win() {
        this.play(600, 'square', 0.1, 0.1);
        setTimeout(() => this.play(800, 'square', 0.1, 0.1), 100);
        setTimeout(() => this.play(1000, 'square', 0.4, 0.1), 200);
    }

    updateLava(proximity) {
        // Disabled per user request (too much buzzing)
        return;
    }
    
    stopLava() {
        if (this.lavaOsc) {
            this.lavaOsc.stop();
            this.lavaOsc = null;
        }
    }
}
