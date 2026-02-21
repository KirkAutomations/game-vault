// dungeon.js - Procedural dungeon generation and crawler screen
const DungeonGenerator = {
    generate(width, height, level) {
        const map = [];
        for (let y = 0; y < height; y++) {
            map[y] = [];
            for (let x = 0; x < width; x++) map[y][x] = 1; // wall
        }

        const rooms = [];
        const maxRooms = 8 + Math.floor(level / 2);
        const minSize = 4, maxSize = 8;

        for (let i = 0; i < maxRooms * 3; i++) {
            if (rooms.length >= maxRooms) break;
            const w = minSize + Math.floor(Math.random() * (maxSize - minSize));
            const h = minSize + Math.floor(Math.random() * (maxSize - minSize));
            const x = 1 + Math.floor(Math.random() * (width - w - 2));
            const y = 1 + Math.floor(Math.random() * (height - h - 2));

            let overlap = false;
            for (const r of rooms) {
                if (x < r.x + r.w + 1 && x + w + 1 > r.x && y < r.y + r.h + 1 && y + h + 1 > r.y) {
                    overlap = true; break;
                }
            }
            if (overlap) continue;

            // Carve room
            for (let ry = y; ry < y + h; ry++)
                for (let rx = x; rx < x + w; rx++) map[ry][rx] = 0;

            rooms.push({ x, y, w, h, cx: Math.floor(x + w / 2), cy: Math.floor(y + h / 2) });
        }

        // Connect rooms with corridors
        for (let i = 1; i < rooms.length; i++) {
            const a = rooms[i - 1], b = rooms[i];
            let cx = a.cx, cy = a.cy;
            while (cx !== b.cx) {
                if (cy >= 0 && cy < height && cx >= 0 && cx < width) map[cy][cx] = 0;
                cx += cx < b.cx ? 1 : -1;
            }
            while (cy !== b.cy) {
                if (cy >= 0 && cy < height && cx >= 0 && cx < width) map[cy][cx] = 0;
                cy += cy < b.cy ? 1 : -1;
            }
        }

        // Place entities
        const entities = [];
        const startRoom = rooms[0];
        const endRoom = rooms[rooms.length - 1];

        // Stairs in last room
        entities.push({ type: 'stairs', x: endRoom.cx, y: endRoom.cy });

        // Enemies in other rooms
        const enemyCount = 3 + level;
        for (let i = 0; i < enemyCount; i++) {
            const room = rooms[1 + Math.floor(Math.random() * (rooms.length - 1))];
            const ex = room.x + 1 + Math.floor(Math.random() * (room.w - 2));
            const ey = room.y + 1 + Math.floor(Math.random() * (room.h - 2));
            if (map[ey][ex] === 0) {
                // Pick an element for this enemy based on dungeon level
                const maxElement = Math.min(118, level * 5 + 10);
                const elNum = 1 + Math.floor(Math.random() * maxElement);
                const el = ELEMENTS_BY_NUMBER[elNum];
                entities.push({
                    type: 'enemy', x: ex, y: ey,
                    element: el,
                    hp: Math.floor(el.hp * (1 + level * 0.2)),
                    maxHp: Math.floor(el.hp * (1 + level * 0.2)),
                    power: Math.floor(el.power * (1 + level * 0.15)),
                    defense: Math.floor(el.defense * (1 + level * 0.1)),
                    variant: Math.floor(Math.random() * 5),
                    isBoss: false
                });
            }
        }

        // Boss in the room before stairs (every 5 levels)
        if (level % 5 === 0 && rooms.length > 2) {
            const bossRoom = rooms[rooms.length - 2];
            const bossElNum = Math.min(118, level * 3);
            const bossEl = ELEMENTS_BY_NUMBER[bossElNum] || ELEMENTS_BY_NUMBER[1];
            entities.push({
                type: 'enemy', x: bossRoom.cx, y: bossRoom.cy,
                element: bossEl,
                hp: Math.floor(bossEl.hp * (3 + level * 0.5)),
                maxHp: Math.floor(bossEl.hp * (3 + level * 0.5)),
                power: Math.floor(bossEl.power * (2 + level * 0.3)),
                defense: Math.floor(bossEl.defense * (2 + level * 0.2)),
                variant: 3,
                isBoss: true
            });
        }

        // Element orbs (collectibles)
        const orbCount = 2 + Math.floor(level / 2);
        for (let i = 0; i < orbCount; i++) {
            const room = rooms[Math.floor(Math.random() * rooms.length)];
            const ox = room.x + 1 + Math.floor(Math.random() * (room.w - 2));
            const oy = room.y + 1 + Math.floor(Math.random() * (room.h - 2));
            if (map[oy][ox] === 0) {
                const maxEl = Math.min(118, level * 5 + 10);
                const elNum = 1 + Math.floor(Math.random() * maxEl);
                entities.push({ type: 'element_orb', x: ox, y: oy, element: ELEMENTS_BY_NUMBER[elNum] });
            }
        }

        // Chests
        const chestCount = 1 + Math.floor(level / 3);
        for (let i = 0; i < chestCount; i++) {
            const room = rooms[1 + Math.floor(Math.random() * (rooms.length - 1))];
            const cx = room.x + 1 + Math.floor(Math.random() * (room.w - 2));
            const cy = room.y + 1 + Math.floor(Math.random() * (room.h - 2));
            if (map[cy][cx] === 0) {
                entities.push({ type: 'chest', x: cx, y: cy, opened: false });
            }
        }

        return { map, rooms, entities, startX: startRoom.cx, startY: startRoom.cy, width, height };
    }
};

// Dungeon crawling screen
const DungeonScreen = {
    dungeon: null,
    playerX: 0,
    playerY: 0,
    tileSize: 32,
    cameraX: 0,
    cameraY: 0,
    moveTimer: 0,
    fogOfWar: null,
    animTime: 0,

    onEnter() {
        if (!this.dungeon) this.generateNewDungeon();
    },

    generateNewDungeon() {
        const level = Game.dungeonLevel;
        this.dungeon = DungeonGenerator.generate(30, 20, level);
        this.playerX = this.dungeon.startX;
        this.playerY = this.dungeon.startY;
        // Init fog of war
        this.fogOfWar = [];
        for (let y = 0; y < this.dungeon.height; y++) {
            this.fogOfWar[y] = [];
            for (let x = 0; x < this.dungeon.width; x++) this.fogOfWar[y][x] = false;
        }
        this.revealAround(this.playerX, this.playerY, 4);
    },

    revealAround(px, py, radius) {
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const x = px + dx, y = py + dy;
                if (x >= 0 && x < this.dungeon.width && y >= 0 && y < this.dungeon.height) {
                    if (Math.abs(dx) + Math.abs(dy) <= radius + 1) {
                        this.fogOfWar[y][x] = true;
                    }
                }
            }
        }
    },

    update(dt) {
        this.animTime += dt;
        this.moveTimer -= dt;

        // Movement
        if (this.moveTimer <= 0) {
            let dx = 0, dy = 0;
            if (Engine.keys['ArrowUp'] || Engine.keys['KeyW']) dy = -1;
            if (Engine.keys['ArrowDown'] || Engine.keys['KeyS']) dy = 1;
            if (Engine.keys['ArrowLeft'] || Engine.keys['KeyA']) dx = -1;
            if (Engine.keys['ArrowRight'] || Engine.keys['KeyD']) dx = 1;

            if (dx !== 0 || dy !== 0) {
                const nx = this.playerX + dx;
                const ny = this.playerY + dy;
                if (this.canMove(nx, ny)) {
                    this.playerX = nx;
                    this.playerY = ny;
                    this.moveTimer = 0.12;
                    this.revealAround(nx, ny, 4);
                    this.checkTile(nx, ny);
                }
            }
        }

        // Camera follow
        const targetCX = this.playerX * this.tileSize - Engine.width / 2 + this.tileSize / 2;
        const targetCY = this.playerY * this.tileSize - Engine.height / 2 + this.tileSize / 2;
        this.cameraX += (targetCX - this.cameraX) * 5 * dt;
        this.cameraY += (targetCY - this.cameraY) * 5 * dt;

        // Hotkeys
        if (Engine.keysJustPressed['KeyI']) Engine.switchScreen('inventory');
        if (Engine.keysJustPressed['KeyP']) Engine.switchScreen('periodic_table');
        if (Engine.keysJustPressed['KeyU']) Engine.switchScreen('idle');
        if (Engine.keysJustPressed['Escape']) Engine.switchScreen('menu');
    },

    canMove(x, y) {
        if (x < 0 || x >= this.dungeon.width || y < 0 || y >= this.dungeon.height) return false;
        return this.dungeon.map[y][x] === 0;
    },

    checkTile(x, y) {
        const entities = this.dungeon.entities;
        for (let i = entities.length - 1; i >= 0; i--) {
            const e = entities[i];
            if (e.x !== x || e.y !== y) continue;

            if (e.type === 'stairs') {
                Game.dungeonLevel++;
                this.generateNewDungeon();
                Engine.notify('Descending to level ' + Game.dungeonLevel + '...', '#ff4');
                Game.stats.floorsCleared++;
                return;
            }
            if (e.type === 'element_orb') {
                Game.discoverElement(e.element.symbol);
                Game.addToInventory(e.element.symbol, 1);
                Engine.spawnBurst(
                    x * this.tileSize - this.cameraX + this.tileSize / 2,
                    y * this.tileSize - this.cameraY + this.tileSize / 2,
                    e.element.color, 15, 80
                );
                Engine.notify(`Found ${e.element.name} (${e.element.symbol})!`, e.element.color);
                entities.splice(i, 1);
                return;
            }
            if (e.type === 'chest' && !e.opened) {
                e.opened = true;
                const gold = 10 + Game.dungeonLevel * 5 + Math.floor(Math.random() * 20);
                Game.totalGold += gold;
                // Chance for element drop
                const maxEl = Math.min(118, Game.dungeonLevel * 5 + 10);
                const elNum = 1 + Math.floor(Math.random() * maxEl);
                const el = ELEMENTS_BY_NUMBER[elNum];
                Game.discoverElement(el.symbol);
                Game.addToInventory(el.symbol, 1 + Math.floor(Math.random() * 2));
                Engine.notify(`Chest: ${gold}g + ${el.name}!`, '#ff4');
                Engine.spawnBurst(
                    x * this.tileSize - this.cameraX + this.tileSize / 2,
                    y * this.tileSize - this.cameraY + this.tileSize / 2,
                    '#ff4', 20, 100
                );
                return;
            }
            if (e.type === 'enemy') {
                // Start combat
                Combat.startBattle(e, i);
                Engine.switchScreen('combat');
                return;
            }
        }
    },

    draw(ctx) {
        if (!this.dungeon) return;
        const ts = this.tileSize;
        const startX = Math.max(0, Math.floor(this.cameraX / ts) - 1);
        const startY = Math.max(0, Math.floor(this.cameraY / ts) - 1);
        const endX = Math.min(this.dungeon.width, startX + Math.ceil(Engine.width / ts) + 2);
        const endY = Math.min(this.dungeon.height, startY + Math.ceil(Engine.height / ts) + 2);

        // Draw tiles
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const sx = x * ts - this.cameraX;
                const sy = y * ts - this.cameraY;

                if (!this.fogOfWar[y][x]) {
                    ctx.fillStyle = '#050510';
                    ctx.fillRect(sx, sy, ts, ts);
                    continue;
                }

                if (this.dungeon.map[y][x] === 1) {
                    SpriteGen.drawSprite(ctx, 'wall', sx, sy, ts, { color: '#445' });
                } else {
                    SpriteGen.drawSprite(ctx, 'floor', sx, sy, ts, { color: '#221' });
                }
            }
        }

        // Draw entities
        this.dungeon.entities.forEach(e => {
            if (!this.fogOfWar[e.y] || !this.fogOfWar[e.y][e.x]) return;
            const sx = e.x * ts - this.cameraX;
            const sy = e.y * ts - this.cameraY;

            if (e.type === 'stairs') {
                SpriteGen.drawSprite(ctx, 'stairs', sx, sy, ts);
            } else if (e.type === 'element_orb') {
                SpriteGen.drawSprite(ctx, 'element_orb', sx, sy, ts, { color: e.element.color });
                SpriteGen.drawGlow(ctx, sx + ts / 2, sy + ts / 2, ts, e.element.color, this.animTime);
                SpriteGen.drawElementSymbol(ctx, e.element.symbol, sx + ts / 2, sy + ts / 2, 12, '#fff');
            } else if (e.type === 'chest') {
                if (!e.opened) {
                    SpriteGen.drawSprite(ctx, 'chest', sx, sy, ts);
                }
            } else if (e.type === 'enemy') {
                const sprType = e.isBoss ? 'boss' : 'enemy';
                SpriteGen.drawSprite(ctx, sprType, sx, sy, ts, { color: e.element.color, variant: e.variant });
                // HP bar
                const hpPct = e.hp / e.maxHp;
                ctx.fillStyle = '#300';
                ctx.fillRect(sx + 2, sy - 6, ts - 4, 4);
                ctx.fillStyle = hpPct > 0.5 ? '#0f0' : hpPct > 0.25 ? '#ff0' : '#f00';
                ctx.fillRect(sx + 2, sy - 6, (ts - 4) * hpPct, 4);
                // Element symbol
                SpriteGen.drawElementSymbol(ctx, e.element.symbol, sx + ts / 2, sy - 10, 9, e.element.color);
            }
        });

        // Draw player
        const px = this.playerX * ts - this.cameraX;
        const py = this.playerY * ts - this.cameraY;
        SpriteGen.drawSprite(ctx, 'player', px, py, ts, { color: '#4af' });

        // HUD
        this.drawHUD(ctx);
    },

    drawHUD(ctx) {
        // Top bar
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, Engine.width, 40);

        ctx.fillStyle = '#fff';
        ctx.font = '14px "Courier New", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`Floor ${Game.dungeonLevel}`, 10, 26);

        // HP bar
        const hpPct = Game.player.hp / Game.player.maxHp;
        ctx.fillStyle = '#300';
        ctx.fillRect(120, 12, 150, 16);
        ctx.fillStyle = hpPct > 0.5 ? '#0c0' : hpPct > 0.25 ? '#cc0' : '#c00';
        ctx.fillRect(120, 12, 150 * hpPct, 16);
        ctx.fillStyle = '#fff';
        ctx.fillText(`HP: ${Game.player.hp}/${Game.player.maxHp}`, 125, 26);

        // XP bar
        const xpPct = Game.player.xp / Game.player.xpToNext;
        ctx.fillStyle = '#003';
        ctx.fillRect(290, 12, 120, 16);
        ctx.fillStyle = '#44f';
        ctx.fillRect(290, 12, 120 * xpPct, 16);
        ctx.fillStyle = '#fff';
        ctx.fillText(`Lv${Game.player.level}`, 295, 26);

        ctx.fillText(`Gold: ${Game.totalGold}`, 430, 26);
        ctx.fillText(`Elements: ${Game.discoveredElements.size}/118`, 560, 26);

        // Bottom hints
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, Engine.height - 25, Engine.width, 25);
        ctx.fillStyle = '#888';
        ctx.font = '11px "Courier New", monospace';
        ctx.fillText('[WASD/Arrows] Move  [I] Inventory  [P] Periodic Table  [U] Lab  [ESC] Menu', 10, Engine.height - 8);
    }
};
