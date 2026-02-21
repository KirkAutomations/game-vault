// sprites.js - Procedural pixel art sprite system
const SpriteGen = {
    cache: {},

    // Draw a pixel art sprite from a template
    drawSprite(ctx, type, x, y, size, opts = {}) {
        const key = `${type}_${size}_${opts.color || ''}_${opts.variant || 0}`;
        if (!this.cache[key]) {
            const offscreen = document.createElement('canvas');
            offscreen.width = size;
            offscreen.height = size;
            const octx = offscreen.getContext('2d');
            this['draw_' + type](octx, size, opts);
            this.cache[key] = offscreen;
        }
        ctx.drawImage(this.cache[key], x, y);
    },

    // Helper to draw a pixel block
    px(ctx, x, y, s, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x * s, y * s, s, s);
    },

    // Player character
    draw_player(ctx, size, opts) {
        const s = size / 16;
        const c = opts.color || '#4af';
        const dark = this.darken(c, 0.6);
        const light = this.lighten(c, 0.3);
        // Head
        for (let x = 6; x <= 9; x++) for (let y = 1; y <= 3; y++) this.px(ctx, x, y, s, c);
        // Eyes
        this.px(ctx, 7, 2, s, '#fff'); this.px(ctx, 8, 2, s, '#fff');
        // Body
        for (let x = 5; x <= 10; x++) for (let y = 4; y <= 8; y++) this.px(ctx, x, y, s, dark);
        // Cape
        for (let y = 4; y <= 9; y++) { this.px(ctx, 4, y, s, light); this.px(ctx, 11, y, s, light); }
        // Arms
        for (let y = 5; y <= 7; y++) { this.px(ctx, 4, y, s, c); this.px(ctx, 11, y, s, c); }
        // Legs
        for (let y = 9; y <= 12; y++) { this.px(ctx, 6, y, s, dark); this.px(ctx, 9, y, s, dark); }
        // Boots
        this.px(ctx, 5, 13, s, '#333'); this.px(ctx, 6, 13, s, '#333');
        this.px(ctx, 9, 13, s, '#333'); this.px(ctx, 10, 13, s, '#333');
        // Sword (right hand)
        for (let y = 2; y <= 7; y++) this.px(ctx, 12, y, s, '#ddd');
        this.px(ctx, 12, 1, s, '#ff4');
    },

    // Enemy monster variants
    draw_enemy(ctx, size, opts) {
        const s = size / 16;
        const v = (opts.variant || 0) % 5;
        const c = opts.color || '#f44';
        const dark = this.darken(c, 0.5);
        if (v === 0) this._drawSlime(ctx, s, c, dark);
        else if (v === 1) this._drawSkeleton(ctx, s, c, dark);
        else if (v === 2) this._drawBat(ctx, s, c, dark);
        else if (v === 3) this._drawGolem(ctx, s, c, dark);
        else this._drawGhost(ctx, s, c, dark);
    },

    _drawSlime(ctx, s, c, dark) {
        for (let x = 4; x <= 11; x++) for (let y = 8; y <= 13; y++) this.px(ctx, x, y, s, c);
        for (let x = 5; x <= 10; x++) this.px(ctx, x, 7, s, c);
        for (let x = 6; x <= 9; x++) this.px(ctx, x, 6, s, c);
        this.px(ctx, 6, 9, s, '#fff'); this.px(ctx, 9, 9, s, '#fff');
        this.px(ctx, 6, 10, s, '#111'); this.px(ctx, 9, 10, s, '#111');
        // Drip
        this.px(ctx, 4, 14, s, dark); this.px(ctx, 11, 14, s, dark);
    },

    _drawSkeleton(ctx, s, c, dark) {
        // Skull
        for (let x = 6; x <= 9; x++) for (let y = 1; y <= 4; y++) this.px(ctx, x, y, s, '#eee');
        this.px(ctx, 7, 2, s, '#111'); this.px(ctx, 8, 2, s, '#111');
        this.px(ctx, 7, 4, s, '#111'); this.px(ctx, 8, 4, s, '#111');
        // Spine
        for (let y = 5; y <= 9; y++) this.px(ctx, 7, y, s, '#ddd');
        // Ribs
        for (let y = 5; y <= 7; y++) { this.px(ctx, 6, y, s, c); this.px(ctx, 9, y, s, c); }
        // Legs
        for (let y = 10; y <= 13; y++) { this.px(ctx, 6, y, s, '#ccc'); this.px(ctx, 9, y, s, '#ccc'); }
    },

    _drawBat(ctx, s, c, dark) {
        // Body
        for (let x = 6; x <= 9; x++) for (let y = 6; y <= 9; y++) this.px(ctx, x, y, s, c);
        // Wings
        for (let x = 1; x <= 5; x++) { this.px(ctx, x, 6, s, dark); this.px(ctx, x, 7, s, c); }
        for (let x = 10; x <= 14; x++) { this.px(ctx, x, 6, s, dark); this.px(ctx, x, 7, s, c); }
        // Eyes
        this.px(ctx, 7, 7, s, '#f00'); this.px(ctx, 8, 7, s, '#f00');
        // Ears
        this.px(ctx, 6, 5, s, c); this.px(ctx, 9, 5, s, c);
    },

    _drawGolem(ctx, s, c, dark) {
        // Big body
        for (let x = 4; x <= 11; x++) for (let y = 3; y <= 12; y++) this.px(ctx, x, y, s, c);
        for (let x = 5; x <= 10; x++) for (let y = 2; y <= 3; y++) this.px(ctx, x, y, s, c);
        // Eyes
        this.px(ctx, 6, 4, s, '#ff0'); this.px(ctx, 9, 4, s, '#ff0');
        // Arms
        for (let y = 5; y <= 10; y++) { this.px(ctx, 3, y, s, dark); this.px(ctx, 12, y, s, dark); }
        // Legs
        for (let y = 13; y <= 14; y++) { this.px(ctx, 5, y, s, dark); this.px(ctx, 6, y, s, dark); this.px(ctx, 9, y, s, dark); this.px(ctx, 10, y, s, dark); }
        // Cracks
        this.px(ctx, 7, 7, s, dark); this.px(ctx, 8, 8, s, dark); this.px(ctx, 6, 9, s, dark);
    },

    _drawGhost(ctx, s, c, dark) {
        // Translucent body
        for (let x = 5; x <= 10; x++) for (let y = 3; y <= 11; y++) this.px(ctx, x, y, s, c);
        for (let x = 6; x <= 9; x++) this.px(ctx, x, 2, s, c);
        // Eyes
        this.px(ctx, 6, 5, s, '#fff'); this.px(ctx, 9, 5, s, '#fff');
        // Mouth
        this.px(ctx, 7, 7, s, '#000'); this.px(ctx, 8, 7, s, '#000');
        // Wavy bottom
        this.px(ctx, 5, 12, s, c); this.px(ctx, 7, 12, s, c); this.px(ctx, 9, 12, s, c);
    },

    // Treasure chest
    draw_chest(ctx, size, opts) {
        const s = size / 16;
        const c = opts.color || '#a74';
        // Body
        for (let x = 3; x <= 12; x++) for (let y = 6; y <= 12; y++) this.px(ctx, x, y, s, c);
        // Lid
        for (let x = 3; x <= 12; x++) for (let y = 4; y <= 5; y++) this.px(ctx, x, y, s, this.darken(c, 0.7));
        // Lock
        this.px(ctx, 7, 7, s, '#ff0'); this.px(ctx, 8, 7, s, '#ff0');
        this.px(ctx, 7, 8, s, '#ff0'); this.px(ctx, 8, 8, s, '#ff0');
        // Edges
        for (let y = 4; y <= 12; y++) { this.px(ctx, 3, y, s, '#531'); this.px(ctx, 12, y, s, '#531'); }
    },

    // Potion
    draw_potion(ctx, size, opts) {
        const s = size / 16;
        const c = opts.color || '#4f4';
        // Cork
        this.px(ctx, 7, 3, s, '#a74'); this.px(ctx, 8, 3, s, '#a74');
        // Neck
        this.px(ctx, 7, 4, s, '#aaf'); this.px(ctx, 8, 4, s, '#aaf');
        this.px(ctx, 7, 5, s, '#aaf'); this.px(ctx, 8, 5, s, '#aaf');
        // Body
        for (let x = 5; x <= 10; x++) for (let y = 6; y <= 12; y++) this.px(ctx, x, y, s, '#88c');
        // Liquid
        for (let x = 6; x <= 9; x++) for (let y = 8; y <= 11; y++) this.px(ctx, x, y, s, c);
    },

    // Wall tile
    draw_wall(ctx, size, opts) {
        const s = size / 16;
        const c = opts.color || '#556';
        const c2 = this.darken(c, 0.7);
        for (let x = 0; x < 16; x++) for (let y = 0; y < 16; y++) {
            this.px(ctx, x, y, s, (x + y) % 4 === 0 ? c2 : c);
        }
        // Brick lines
        for (let x = 0; x < 16; x++) { this.px(ctx, x, 4, s, c2); this.px(ctx, x, 8, s, c2); this.px(ctx, x, 12, s, c2); }
    },

    // Floor tile
    draw_floor(ctx, size, opts) {
        const s = size / 16;
        const c = opts.color || '#332';
        const c2 = this.lighten(c, 0.15);
        for (let x = 0; x < 16; x++) for (let y = 0; y < 16; y++) {
            this.px(ctx, x, y, s, ((x * 7 + y * 13) % 5 === 0) ? c2 : c);
        }
    },

    // Stairs
    draw_stairs(ctx, size, opts) {
        const s = size / 16;
        this.draw_floor(ctx, size, { color: '#332' });
        for (let i = 0; i < 5; i++) {
            const c = this.lighten('#555', i * 0.08);
            for (let x = 3 + i; x <= 12 - i; x++) this.px(ctx, x, 12 - i * 2, s, c);
            for (let x = 3 + i; x <= 12 - i; x++) this.px(ctx, x, 11 - i * 2, s, c);
        }
    },

    // Door
    draw_door(ctx, size, opts) {
        const s = size / 16;
        const c = opts.color || '#864';
        for (let x = 4; x <= 11; x++) for (let y = 2; y <= 14; y++) this.px(ctx, x, y, s, c);
        this.px(ctx, 10, 8, s, '#ff0'); // doorknob
        for (let x = 4; x <= 11; x++) { this.px(ctx, x, 2, s, '#642'); this.px(ctx, x, 14, s, '#642'); }
        for (let y = 2; y <= 14; y++) { this.px(ctx, 4, y, s, '#642'); this.px(ctx, 11, y, s, '#642'); }
    },

    // Element orb - glowing element pickup
    draw_element_orb(ctx, size, opts) {
        const s = size / 16;
        const c = opts.color || '#4af';
        const light = this.lighten(c, 0.5);
        // Outer glow
        for (let x = 5; x <= 10; x++) for (let y = 4; y <= 11; y++) this.px(ctx, x, y, s, c);
        for (let x = 6; x <= 9; x++) { this.px(ctx, x, 3, s, c); this.px(ctx, x, 12, s, c); }
        // Inner glow
        for (let x = 6; x <= 9; x++) for (let y = 5; y <= 10; y++) this.px(ctx, x, y, s, light);
        // Highlight
        this.px(ctx, 7, 6, s, '#fff'); this.px(ctx, 8, 6, s, '#fff');
    },

    // Boss monster
    draw_boss(ctx, size, opts) {
        const s = size / 16;
        const c = opts.color || '#f44';
        const dark = this.darken(c, 0.5);
        // Crown
        this.px(ctx, 5, 0, s, '#ff0'); this.px(ctx, 7, 0, s, '#ff0'); this.px(ctx, 9, 0, s, '#ff0');
        for (let x = 5; x <= 10; x++) this.px(ctx, x, 1, s, '#ff0');
        // Head
        for (let x = 4; x <= 11; x++) for (let y = 2; y <= 5; y++) this.px(ctx, x, y, s, c);
        // Eyes
        this.px(ctx, 6, 3, s, '#ff0'); this.px(ctx, 9, 3, s, '#ff0');
        this.px(ctx, 6, 4, s, '#f00'); this.px(ctx, 9, 4, s, '#f00');
        // Body
        for (let x = 3; x <= 12; x++) for (let y = 6; y <= 12; y++) this.px(ctx, x, y, s, dark);
        for (let x = 4; x <= 11; x++) for (let y = 6; y <= 11; y++) this.px(ctx, x, y, s, c);
        // Arms
        for (let y = 7; y <= 11; y++) { this.px(ctx, 2, y, s, c); this.px(ctx, 13, y, s, c); }
        // Legs
        for (let y = 13; y <= 15; y++) {
            this.px(ctx, 5, y, s, dark); this.px(ctx, 6, y, s, dark);
            this.px(ctx, 9, y, s, dark); this.px(ctx, 10, y, s, dark);
        }
    },

    // NPC character
    draw_npc(ctx, size, opts) {
        const s = size / 16;
        const c = opts.color || '#4f4';
        // Head
        for (let x = 6; x <= 9; x++) for (let y = 2; y <= 4; y++) this.px(ctx, x, y, s, '#fda');
        // Hat
        for (let x = 5; x <= 10; x++) this.px(ctx, x, 1, s, c);
        for (let x = 6; x <= 9; x++) this.px(ctx, x, 0, s, c);
        // Eyes
        this.px(ctx, 7, 3, s, '#111'); this.px(ctx, 8, 3, s, '#111');
        // Body
        for (let x = 5; x <= 10; x++) for (let y = 5; y <= 10; y++) this.px(ctx, x, y, s, c);
        // Legs
        for (let y = 11; y <= 13; y++) { this.px(ctx, 6, y, s, '#446'); this.px(ctx, 9, y, s, '#446'); }
    },

    // Color helpers
    darken(hex, factor) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgb(${Math.floor(r * factor)},${Math.floor(g * factor)},${Math.floor(b * factor)})`;
    },

    lighten(hex, factor) {
        let r, g, b;
        if (hex.startsWith('#')) {
            r = parseInt(hex.slice(1, 3), 16);
            g = parseInt(hex.slice(3, 5), 16);
            b = parseInt(hex.slice(5, 7), 16);
        } else return hex;
        return `rgb(${Math.min(255, Math.floor(r + (255 - r) * factor))},${Math.min(255, Math.floor(g + (255 - g) * factor))},${Math.min(255, Math.floor(b + (255 - b) * factor))})`;
    },

    // Particle effects
    drawParticle(ctx, x, y, radius, color, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    },

    // Draw element symbol text on canvas
    drawElementSymbol(ctx, symbol, x, y, size, color) {
        ctx.save();
        ctx.fillStyle = color || '#fff';
        ctx.font = `bold ${size}px 'Courier New', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(symbol, x, y);
        ctx.restore();
    },

    // Animated glow effect
    drawGlow(ctx, x, y, radius, color, time) {
        const pulse = 0.6 + Math.sin(time * 3) * 0.4;
        ctx.save();
        ctx.globalAlpha = 0.3 * pulse;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
        grad.addColorStop(0, color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
};
