// ui.js - Menu, inventory, periodic table viewer, and screen definitions

// ============ MAIN MENU ============
const MenuScreen = {
    buttons: [
        { label: 'Continue', action: 'continue' },
        { label: 'New Game', action: 'new' },
        { label: 'Periodic Table', action: 'table' },
        { label: 'Quiz Challenge', action: 'quiz' },
        { label: 'Element Matcher', action: 'matcher' },
    ],
    titleAnim: 0,

    onEnter() {
        if (!Engine.hasSave()) {
            this.buttons[0] = { label: 'New Game', action: 'new' };
        } else {
            this.buttons[0] = { label: 'Continue', action: 'continue' };
        }
    },

    update(dt) {
        this.titleAnim += dt;
        this.buttons.forEach((b, i) => {
            const y = 300 + i * 50;
            if (Engine.clickedIn(Engine.width / 2 - 120, y, 240, 38)) {
                this.doAction(b.action);
            }
        });
    },

    doAction(action) {
        switch (action) {
            case 'continue':
                Engine.loadGame();
                IdleScreen.applyUpgrades();
                DungeonScreen.generateNewDungeon();
                Engine.switchScreen('dungeon');
                break;
            case 'new':
                Game.reset();
                DungeonScreen.generateNewDungeon();
                Engine.switchScreen('dungeon');
                Engine.notify('Welcome to ElementQuest!', '#4af');
                break;
            case 'table':
                Engine.switchScreen('periodic_table');
                break;
            case 'quiz':
                Engine.switchScreen('quiz');
                break;
            case 'matcher':
                Engine.switchScreen('matcher');
                break;
        }
    },

    draw(ctx) {
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, Engine.width, Engine.height);

        // Animated background particles
        for (let i = 0; i < 30; i++) {
            const x = (i * 137 + this.titleAnim * 20 * (i % 3 + 1)) % Engine.width;
            const y = (i * 89 + this.titleAnim * 10 * ((i + 1) % 3 + 1)) % Engine.height;
            const el = ELEMENTS_BY_NUMBER[1 + (i % 20)];
            ctx.fillStyle = el ? el.color : '#444';
            ctx.globalAlpha = 0.15;
            ctx.font = '14px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(el ? el.symbol : '?', x, y);
        }
        ctx.globalAlpha = 1;

        // Title
        const glow = 0.7 + Math.sin(this.titleAnim * 2) * 0.3;
        ctx.fillStyle = `rgba(68, 170, 255, ${glow})`;
        ctx.font = 'bold 48px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ElementQuest', Engine.width / 2, 150);

        ctx.fillStyle = '#888';
        ctx.font = '16px "Courier New", monospace';
        ctx.fillText('A Periodic Table Dungeon Crawler', Engine.width / 2, 190);

        // Element decoration
        const decorEls = ['H', 'He', 'Li', 'C', 'N', 'O', 'Fe', 'Au'];
        decorEls.forEach((sym, i) => {
            const el = ELEMENTS[sym];
            const angle = this.titleAnim * 0.5 + (i / decorEls.length) * Math.PI * 2;
            const rx = 200, ry = 40;
            const ex = Engine.width / 2 + Math.cos(angle) * rx;
            const ey = 230 + Math.sin(angle) * ry;
            ctx.fillStyle = el.color;
            ctx.globalAlpha = 0.6;
            ctx.font = 'bold 16px "Courier New", monospace';
            ctx.fillText(el.symbol, ex, ey);
        });
        ctx.globalAlpha = 1;

        // Buttons
        this.buttons.forEach((b, i) => {
            const x = Engine.width / 2 - 120;
            const y = 300 + i * 50;
            const hovered = Engine.isMouseOver(x, y, 240, 38);
            Engine.drawButton(ctx, x, y, 240, 38, b.label, hovered);
        });

        // Footer
        ctx.fillStyle = '#555';
        ctx.font = '11px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Learn the periodic table through adventure!', Engine.width / 2, Engine.height - 20);
    }
};


// ============ PERIODIC TABLE VIEWER ============
const PeriodicTableScreen = {
    hoveredElement: null,
    cellSize: 46,
    startX: 15,
    startY: 60,
    scrollY: 0,

    // Standard periodic table layout [row, col] for each element
    layout: (() => {
        const pos = {};
        // Period 1
        pos[1] = [0, 0]; pos[2] = [0, 17];
        // Period 2
        pos[3] = [1, 0]; pos[4] = [1, 1];
        for (let i = 5; i <= 10; i++) pos[i] = [1, i + 8];
        // Period 3
        pos[11] = [2, 0]; pos[12] = [2, 1];
        for (let i = 13; i <= 18; i++) pos[i] = [2, i];
        // Period 4
        pos[19] = [3, 0]; pos[20] = [3, 1];
        for (let i = 21; i <= 36; i++) pos[i] = [3, i - 18];
        // Period 5
        pos[37] = [4, 0]; pos[38] = [4, 1];
        for (let i = 39; i <= 54; i++) pos[i] = [4, i - 36];
        // Period 6
        pos[55] = [5, 0]; pos[56] = [5, 1];
        for (let i = 72; i <= 86; i++) pos[i] = [5, i - 68];
        // Period 7
        pos[87] = [6, 0]; pos[88] = [6, 1];
        for (let i = 104; i <= 118; i++) pos[i] = [6, i - 100];
        // Lanthanides (row 8)
        for (let i = 57; i <= 71; i++) pos[i] = [8, i - 54];
        // Actinides (row 9)
        for (let i = 89; i <= 103; i++) pos[i] = [9, i - 86];
        return pos;
    })(),

    update(dt) {
        this.hoveredElement = null;

        // Find hovered element
        for (let num = 1; num <= 118; num++) {
            const p = this.layout[num];
            if (!p) continue;
            const x = this.startX + p[1] * this.cellSize;
            const y = this.startY + p[0] * this.cellSize;
            if (Engine.isMouseOver(x, y, this.cellSize - 2, this.cellSize - 2)) {
                this.hoveredElement = ELEMENTS_BY_NUMBER[num];
            }
        }

        if (Engine.keysJustPressed['Escape']) Engine.switchScreen(Engine.prevScreen || 'menu');
    },

    draw(ctx) {
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, Engine.width, Engine.height);

        ctx.fillStyle = '#4af';
        ctx.font = 'bold 18px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PERIODIC TABLE OF ELEMENTS', Engine.width / 2, 30);

        ctx.fillStyle = '#888';
        ctx.font = '10px "Courier New", monospace';
        ctx.fillText(`Discovered: ${Game.discoveredElements.size}/118`, Engine.width / 2, 48);

        // Draw table
        for (let num = 1; num <= 118; num++) {
            const p = this.layout[num];
            if (!p) continue;
            const el = ELEMENTS_BY_NUMBER[num];
            const x = this.startX + p[1] * this.cellSize;
            const y = this.startY + p[0] * this.cellSize;
            const discovered = Game.discoveredElements.has(el.symbol);
            const isHovered = this.hoveredElement === el;
            const cs = this.cellSize - 2;

            if (discovered) {
                ctx.fillStyle = isHovered ? el.color : SpriteGen.darken(el.color, 0.4);
                ctx.fillRect(x, y, cs, cs);
                ctx.strokeStyle = el.color;
                ctx.lineWidth = isHovered ? 2 : 1;
                ctx.strokeRect(x, y, cs, cs);

                // Number
                ctx.fillStyle = '#ccc';
                ctx.font = '8px "Courier New", monospace';
                ctx.textAlign = 'left';
                ctx.fillText(el.number, x + 2, y + 9);

                // Symbol
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 16px "Courier New", monospace';
                ctx.textAlign = 'center';
                ctx.fillText(el.symbol, x + cs / 2, y + 26);

                // Name (truncated)
                ctx.fillStyle = '#bbb';
                ctx.font = '7px "Courier New", monospace';
                ctx.fillText(el.name.slice(0, 6), x + cs / 2, y + 38);
            } else {
                ctx.fillStyle = '#111';
                ctx.fillRect(x, y, cs, cs);
                ctx.strokeStyle = '#222';
                ctx.strokeRect(x, y, cs, cs);

                ctx.fillStyle = '#333';
                ctx.font = 'bold 14px "Courier New", monospace';
                ctx.textAlign = 'center';
                ctx.fillText('?', x + cs / 2, y + 28);
            }
        }

        // Info panel for hovered element
        if (this.hoveredElement) {
            const el = this.hoveredElement;
            const discovered = Game.discoveredElements.has(el.symbol);
            const px = 640, py = 460;

            ctx.fillStyle = 'rgba(10,10,30,0.95)';
            ctx.fillRect(px, py, 300, 170);
            ctx.strokeStyle = el.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(px, py, 300, 170);

            if (discovered) {
                ctx.fillStyle = el.color;
                ctx.font = 'bold 28px "Courier New", monospace';
                ctx.textAlign = 'left';
                ctx.fillText(`${el.number}  ${el.symbol}`, px + 15, py + 35);

                ctx.fillStyle = '#fff';
                ctx.font = '16px "Courier New", monospace';
                ctx.fillText(el.name, px + 15, py + 58);

                ctx.fillStyle = '#aaa';
                ctx.font = '11px "Courier New", monospace';
                ctx.fillText(`Mass: ${el.mass}  |  Period: ${el.period}`, px + 15, py + 78);
                ctx.fillText(`Category: ${ELEMENT_CATEGORIES[el.category].label}`, px + 15, py + 93);
                ctx.fillText(`Electronegativity: ${el.electronegativity || 'N/A'}`, px + 15, py + 108);
                ctx.fillText(`Damage Type: ${el.dmgType}`, px + 15, py + 123);

                ctx.fillStyle = '#ff4';
                ctx.font = '10px "Courier New", monospace';
                const factLines = QuizScreen.wrapText(el.fact, 40);
                factLines.forEach((line, i) => {
                    ctx.fillText(line, px + 15, py + 140 + i * 13);
                });

                ctx.fillStyle = '#888';
                ctx.textAlign = 'right';
                ctx.fillText(`In inventory: ${Game.inventory[el.symbol] || 0}`, px + 285, py + 35);
            } else {
                ctx.fillStyle = '#666';
                ctx.font = '14px "Courier New", monospace';
                ctx.textAlign = 'center';
                ctx.fillText('??? - Undiscovered', px + 150, py + 80);
                ctx.fillText('Find this element in the dungeon!', px + 150, py + 100);
            }
        }

        // Category legend
        ctx.textAlign = 'left';
        ctx.font = '9px "Courier New", monospace';
        let ly = 470;
        Object.entries(ELEMENT_CATEGORIES).forEach(([key, cat]) => {
            ctx.fillStyle = cat.color;
            ctx.fillRect(15, ly, 10, 10);
            ctx.fillStyle = '#aaa';
            ctx.fillText(cat.label, 30, ly + 9);
            ly += 14;
        });

        // Footer
        ctx.fillStyle = '#555';
        ctx.font = '11px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('[ESC] Back  |  Hover over elements for details', Engine.width / 2, Engine.height - 10);
    }
};


// ============ INVENTORY SCREEN ============
const InventoryScreen = {
    scrollY: 0,
    selectedElement: null,

    update(dt) {
        if (Engine.keys['ArrowUp']) this.scrollY = Math.max(0, this.scrollY - 200 * dt);
        if (Engine.keys['ArrowDown']) this.scrollY += 200 * dt;

        // Click detection on elements
        const items = Object.entries(Game.inventory).filter(([s, c]) => c > 0 && ELEMENTS[s]);
        const cols = 8;
        items.forEach(([sym, count], i) => {
            const col = i % cols, row = Math.floor(i / cols);
            const x = 40 + col * 110, y = 100 + row * 80 - this.scrollY;
            if (Engine.clickedIn(x, y, 100, 70)) {
                this.selectedElement = ELEMENTS[sym];
            }
        });

        if (Engine.keysJustPressed['Escape']) Engine.switchScreen('dungeon');
    },

    draw(ctx) {
        ctx.fillStyle = '#0a0a2a';
        ctx.fillRect(0, 0, Engine.width, Engine.height);

        ctx.fillStyle = '#fa4';
        ctx.font = 'bold 22px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('INVENTORY', Engine.width / 2, 35);

        ctx.fillStyle = '#888';
        ctx.font = '12px "Courier New", monospace';
        ctx.fillText(`Elements: ${Game.discoveredElements.size}/118  |  Gold: ${Game.totalGold}`, Engine.width / 2, 58);

        // Element cards
        const items = Object.entries(Game.inventory).filter(([s, c]) => c > 0 && ELEMENTS[s]);
        const cols = 8;

        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 75, Engine.width, Engine.height - 120);
        ctx.clip();

        items.forEach(([sym, count], i) => {
            const el = ELEMENTS[sym];
            const col = i % cols, row = Math.floor(i / cols);
            const x = 40 + col * 110, y = 100 + row * 80 - this.scrollY;
            const hovered = Engine.isMouseOver(x, y, 100, 70);
            const selected = this.selectedElement === el;

            ctx.fillStyle = selected ? SpriteGen.darken(el.color, 0.5) : (hovered ? '#1a2a4a' : '#111');
            ctx.fillRect(x, y, 100, 70);
            ctx.strokeStyle = el.color;
            ctx.lineWidth = selected ? 2 : 1;
            ctx.strokeRect(x, y, 100, 70);

            // Symbol
            ctx.fillStyle = el.color;
            ctx.font = 'bold 22px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(el.symbol, x + 30, y + 30);

            // Name
            ctx.fillStyle = '#ccc';
            ctx.font = '9px "Courier New", monospace';
            ctx.fillText(el.name.slice(0, 8), x + 70, y + 22);

            // Count
            ctx.fillStyle = '#4f4';
            ctx.font = 'bold 14px "Courier New", monospace';
            ctx.fillText(`x${count}`, x + 70, y + 42);

            // Rarity
            ctx.fillStyle = RARITY_COLORS[el.rarity];
            ctx.font = '8px "Courier New", monospace';
            ctx.fillText(el.rarity, x + 70, y + 58);
        });

        ctx.restore();

        // Selected element detail
        if (this.selectedElement) {
            const el = this.selectedElement;
            ctx.fillStyle = 'rgba(10,10,30,0.95)';
            ctx.fillRect(Engine.width - 280, 80, 260, 200);
            ctx.strokeStyle = el.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(Engine.width - 280, 80, 260, 200);

            ctx.textAlign = 'left';
            ctx.fillStyle = el.color;
            ctx.font = 'bold 20px "Courier New", monospace';
            ctx.fillText(`${el.number} ${el.symbol} - ${el.name}`, Engine.width - 270, 108);

            ctx.fillStyle = '#aaa';
            ctx.font = '11px "Courier New", monospace';
            ctx.fillText(`Mass: ${el.mass}`, Engine.width - 270, 130);
            ctx.fillText(`Category: ${ELEMENT_CATEGORIES[el.category].label}`, Engine.width - 270, 145);
            ctx.fillText(`Power: ${el.power}  Def: ${el.defense}  Spd: ${el.speed}`, Engine.width - 270, 160);
            ctx.fillText(`Type: ${el.dmgType}  Rarity: ${el.rarity}`, Engine.width - 270, 175);

            ctx.fillStyle = '#ff4';
            ctx.font = '10px "Courier New", monospace';
            const lines = QuizScreen.wrapText(el.fact, 35);
            lines.forEach((l, i) => ctx.fillText(l, Engine.width - 270, 195 + i * 13));
        }

        if (items.length === 0) {
            ctx.fillStyle = '#555';
            ctx.font = '16px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('No elements collected yet!', Engine.width / 2, 200);
            ctx.fillText('Explore the dungeon to find elements.', Engine.width / 2, 225);
        }

        // Footer
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, Engine.height - 25, Engine.width, 25);
        ctx.fillStyle = '#888';
        ctx.font = '11px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('[ESC] Back to Dungeon  |  Click elements for details', Engine.width / 2, Engine.height - 8);
    }
};
