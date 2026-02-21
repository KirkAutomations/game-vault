// engine.js - Core game engine: loop, input, screen management, save/load
const Engine = {
    canvas: null,
    ctx: null,
    width: 960,
    height: 640,
    screens: {},
    activeScreen: null,
    prevScreen: null,
    keys: {},
    keysJustPressed: {},
    mouse: { x: 0, y: 0, down: false, clicked: false },
    time: 0,
    dt: 0,
    lastTime: 0,
    particles: [],
    notifications: [],
    shakeAmount: 0,
    shakeTime: 0,

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;

        // Input
        window.addEventListener('keydown', e => {
            if (!this.keys[e.code]) this.keysJustPressed[e.code] = true;
            this.keys[e.code] = true;
            if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
        });
        window.addEventListener('keyup', e => { this.keys[e.code] = false; });
        this.canvas.addEventListener('mousemove', e => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        this.canvas.addEventListener('mousedown', e => { this.mouse.down = true; this.mouse.clicked = true; });
        this.canvas.addEventListener('mouseup', e => { this.mouse.down = false; });

        this.lastTime = performance.now();
        this.loop();
    },

    loop() {
        const now = performance.now();
        this.dt = Math.min((now - this.lastTime) / 1000, 0.05);
        this.time += this.dt;
        this.lastTime = now;

        // Update
        if (this.onTick) this.onTick(this.dt);
        if (this.activeScreen && this.screens[this.activeScreen]) {
            this.screens[this.activeScreen].update(this.dt);
        }
        this.updateParticles(this.dt);
        this.updateNotifications(this.dt);
        this.updateShake(this.dt);

        // Draw
        this.ctx.save();
        if (this.shakeAmount > 0) {
            this.ctx.translate(
                Math.random() * this.shakeAmount * 2 - this.shakeAmount,
                Math.random() * this.shakeAmount * 2 - this.shakeAmount
            );
        }
        this.ctx.fillStyle = '#0a0a1a';
        this.ctx.fillRect(0, 0, this.width, this.height);
        if (this.activeScreen && this.screens[this.activeScreen]) {
            this.screens[this.activeScreen].draw(this.ctx);
        }
        this.drawParticles(this.ctx);
        this.drawNotifications(this.ctx);
        this.ctx.restore();

        // Clear per-frame input
        this.keysJustPressed = {};
        this.mouse.clicked = false;

        requestAnimationFrame(() => this.loop());
    },

    registerScreen(name, screen) {
        this.screens[name] = screen;
    },

    switchScreen(name) {
        if (this.activeScreen && this.screens[this.activeScreen].onExit) {
            this.screens[this.activeScreen].onExit();
        }
        this.prevScreen = this.activeScreen;
        this.activeScreen = name;
        if (this.screens[name].onEnter) this.screens[name].onEnter();
    },

    // Particle system
    spawnParticle(x, y, vx, vy, color, life, size) {
        this.particles.push({ x, y, vx, vy, color, life, maxLife: life, size: size || 3 });
    },

    spawnBurst(x, y, color, count, speed) {
        for (let i = 0; i < (count || 10); i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = (speed || 100) * (0.5 + Math.random());
            this.spawnParticle(x, y, Math.cos(angle) * spd, Math.sin(angle) * spd, color, 0.5 + Math.random() * 0.5, 2 + Math.random() * 3);
        }
    },

    updateParticles(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 200 * dt; // gravity
            p.life -= dt;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    },

    drawParticles(ctx) {
        this.particles.forEach(p => {
            SpriteGen.drawParticle(ctx, p.x, p.y, p.size * (p.life / p.maxLife), p.color, p.life / p.maxLife);
        });
    },

    // Notifications
    notify(text, color) {
        this.notifications.push({ text, color: color || '#fff', life: 3, y: 0 });
    },

    updateNotifications(dt) {
        for (let i = this.notifications.length - 1; i >= 0; i--) {
            this.notifications[i].life -= dt;
            this.notifications[i].y += 30 * dt;
            if (this.notifications[i].life <= 0) this.notifications.splice(i, 1);
        }
    },

    drawNotifications(ctx) {
        this.notifications.forEach((n, i) => {
            ctx.save();
            ctx.globalAlpha = Math.min(1, n.life);
            ctx.fillStyle = n.color;
            ctx.font = 'bold 16px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(n.text, this.width / 2, 80 - n.y + i * 25);
            ctx.restore();
        });
    },

    // Screen shake
    shake(amount, duration) {
        this.shakeAmount = amount;
        this.shakeTime = duration || 0.3;
    },

    updateShake(dt) {
        if (this.shakeTime > 0) {
            this.shakeTime -= dt;
            if (this.shakeTime <= 0) this.shakeAmount = 0;
        }
    },

    // Simple button helper
    drawButton(ctx, x, y, w, h, text, hovered) {
        ctx.fillStyle = hovered ? '#2a4a7a' : '#1a2a4a';
        ctx.strokeStyle = hovered ? '#6cf' : '#4af';
        ctx.lineWidth = 2;
        ctx.fillRect(x, y, w, h);
        ctx.strokeRect(x, y, w, h);
        ctx.fillStyle = hovered ? '#fff' : '#4af';
        ctx.font = '14px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x + w / 2, y + h / 2);
    },

    isMouseOver(x, y, w, h) {
        return this.mouse.x >= x && this.mouse.x <= x + w && this.mouse.y >= y && this.mouse.y <= y + h;
    },

    clickedIn(x, y, w, h) {
        return this.mouse.clicked && this.isMouseOver(x, y, w, h);
    },

    // Save/Load
    saveGame() {
        const data = {
            player: Game.player,
            idle: Game.idle,
            discoveredElements: Array.from(Game.discoveredElements),
            inventory: Game.inventory,
            dungeonLevel: Game.dungeonLevel,
            totalGold: Game.totalGold,
            stats: Game.stats,
        };
        localStorage.setItem('elementquest_save', JSON.stringify(data));
        this.notify('Game Saved!', '#4f4');
    },

    loadGame() {
        const raw = localStorage.getItem('elementquest_save');
        if (!raw) return false;
        try {
            const data = JSON.parse(raw);
            Game.player = data.player;
            Game.idle = data.idle;
            Game.discoveredElements = new Set(data.discoveredElements);
            Game.inventory = data.inventory;
            Game.dungeonLevel = data.dungeonLevel;
            Game.totalGold = data.totalGold;
            Game.stats = data.stats;
            return true;
        } catch (e) { return false; }
    },

    hasSave() {
        return !!localStorage.getItem('elementquest_save');
    }
};
