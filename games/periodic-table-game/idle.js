// idle.js - Idle/upgrade lab screen with passive progression
const IdleScreen = {
    scrollY: 0,
    lastUpdate: 0,

    upgrades: [
        { id: 'reactor', name: 'Element Reactor', desc: 'Generates elements passively', baseCost: 50, costScale: 1.5,
          effect: (lvl) => `+${lvl} random elements/min`, category: 'production' },
        { id: 'attack', name: 'Attack Catalyst', desc: 'Boosts attack damage', baseCost: 30, costScale: 1.4,
          effect: (lvl) => `+${lvl * 5} attack power`, category: 'combat' },
        { id: 'defense', name: 'Shield Generator', desc: 'Boosts defense', baseCost: 30, costScale: 1.4,
          effect: (lvl) => `+${lvl * 3} defense`, category: 'combat' },
        { id: 'hpBoost', name: 'Health Synthesizer', desc: 'Increases max HP', baseCost: 40, costScale: 1.3,
          effect: (lvl) => `+${lvl * 15} max HP`, category: 'combat' },
        { id: 'goldGen', name: 'Alchemist Lab', desc: 'Generates gold passively', baseCost: 100, costScale: 1.6,
          effect: (lvl) => `+${lvl * 2} gold/min`, category: 'production' },
        { id: 'discovery', name: 'Discovery Scanner', desc: 'Higher chance to find new elements', baseCost: 80, costScale: 1.5,
          effect: (lvl) => `+${lvl * 10}% discovery rate`, category: 'exploration' },
        { id: 'xpBoost', name: 'Experience Amplifier', desc: 'Gain more XP from battles', baseCost: 60, costScale: 1.4,
          effect: (lvl) => `+${lvl * 15}% XP`, category: 'combat' },
        { id: 'orbMagnet', name: 'Element Magnet', desc: 'More element orbs in dungeons', baseCost: 120, costScale: 1.5,
          effect: (lvl) => `+${lvl} extra orbs/floor`, category: 'exploration' },
        { id: 'autoHeal', name: 'Nano-Healers', desc: 'Regenerate HP over time', baseCost: 200, costScale: 1.6,
          effect: (lvl) => `+${lvl} HP/sec in dungeon`, category: 'combat' },
        { id: 'compoundBoost', name: 'Compound Enhancer', desc: 'Compound effects are stronger', baseCost: 150, costScale: 1.5,
          effect: (lvl) => `+${lvl * 20}% compound power`, category: 'production' },
    ],

    onEnter() {
        this.lastUpdate = Engine.time;
    },

    getUpgradeCost(upgrade) {
        const lvl = Game.idle[upgrade.id] || 0;
        return Math.floor(upgrade.baseCost * Math.pow(upgrade.costScale, lvl));
    },

    purchaseUpgrade(upgrade) {
        const cost = this.getUpgradeCost(upgrade);
        if (Game.totalGold >= cost) {
            Game.totalGold -= cost;
            Game.idle[upgrade.id] = (Game.idle[upgrade.id] || 0) + 1;
            this.applyUpgrades();
            Engine.notify(`Upgraded ${upgrade.name}!`, '#4f4');
            Engine.spawnBurst(Engine.width / 2, Engine.height / 2, '#4f4', 15, 100);
        }
    },

    applyUpgrades() {
        Game.idle.attackBonus = (Game.idle.attack || 0) * 5;
        Game.idle.defenseBonus = (Game.idle.defense || 0) * 3;
        const hpBonus = (Game.idle.hpBoost || 0) * 15;
        Game.player.maxHp = 100 + (Game.player.level - 1) * 10 + hpBonus;
        Game.player.hp = Math.min(Game.player.hp, Game.player.maxHp);
    },

    // Called every game tick for idle production
    tickIdle(dt) {
        // Element reactor
        const reactorLvl = Game.idle.reactor || 0;
        if (reactorLvl > 0) {
            Game.idle._reactorTimer = (Game.idle._reactorTimer || 0) + dt;
            if (Game.idle._reactorTimer >= 60 / reactorLvl) {
                Game.idle._reactorTimer = 0;
                const maxEl = Math.min(118, Game.dungeonLevel * 5 + 20);
                const elNum = 1 + Math.floor(Math.random() * maxEl);
                const el = ELEMENTS_BY_NUMBER[elNum];
                if (el) {
                    Game.discoverElement(el.symbol);
                    Game.addToInventory(el.symbol, 1);
                }
            }
        }

        // Gold generator
        const goldLvl = Game.idle.goldGen || 0;
        if (goldLvl > 0) {
            Game.idle._goldTimer = (Game.idle._goldTimer || 0) + dt;
            if (Game.idle._goldTimer >= 30) {
                Game.idle._goldTimer = 0;
                Game.totalGold += goldLvl * 2;
            }
        }

        // Auto heal
        const healLvl = Game.idle.autoHeal || 0;
        if (healLvl > 0 && Engine.activeScreen === 'dungeon') {
            Game.idle._healTimer = (Game.idle._healTimer || 0) + dt;
            if (Game.idle._healTimer >= 1) {
                Game.idle._healTimer = 0;
                Game.player.hp = Math.min(Game.player.maxHp, Game.player.hp + healLvl);
            }
        }
    },

    update(dt) {
        // Scroll
        if (Engine.keys['ArrowUp'] || Engine.keys['KeyW']) this.scrollY = Math.max(0, this.scrollY - 200 * dt);
        if (Engine.keys['ArrowDown'] || Engine.keys['KeyS']) this.scrollY += 200 * dt;

        // Check clicks
        this.upgrades.forEach((u, i) => {
            const bx = 520, by = 100 + i * 52 - this.scrollY;
            if (Engine.clickedIn(bx, by, 110, 35)) {
                this.purchaseUpgrade(u);
            }
        });

        if (Engine.keysJustPressed['Escape']) Engine.switchScreen('dungeon');
    },

    draw(ctx) {
        ctx.fillStyle = '#0a0a2a';
        ctx.fillRect(0, 0, Engine.width, Engine.height);

        // Title
        ctx.fillStyle = '#a4f';
        ctx.font = 'bold 24px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ELEMENT LAB', Engine.width / 2, 40);

        ctx.fillStyle = '#888';
        ctx.font = '12px "Courier New", monospace';
        ctx.fillText(`Gold: ${Game.totalGold}`, Engine.width / 2, 65);

        // Upgrades
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 80, Engine.width, Engine.height - 110);
        ctx.clip();

        this.upgrades.forEach((u, i) => {
            const lvl = Game.idle[u.id] || 0;
            const cost = this.getUpgradeCost(u);
            const canAfford = Game.totalGold >= cost;
            const y = 100 + i * 52 - this.scrollY;

            // Card background
            ctx.fillStyle = canAfford ? '#1a2a3a' : '#151520';
            ctx.fillRect(40, y - 8, Engine.width - 80, 46);
            ctx.strokeStyle = canAfford ? '#4af' : '#333';
            ctx.lineWidth = 1;
            ctx.strokeRect(40, y - 8, Engine.width - 80, 46);

            // Category color
            const catColors = { production: '#4f4', combat: '#f44', exploration: '#44f' };
            ctx.fillStyle = catColors[u.category] || '#888';
            ctx.fillRect(40, y - 8, 4, 46);

            // Name and description
            ctx.textAlign = 'left';
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px "Courier New", monospace';
            ctx.fillText(`${u.name} (Lv.${lvl})`, 55, y + 8);
            ctx.fillStyle = '#aaa';
            ctx.font = '11px "Courier New", monospace';
            ctx.fillText(u.desc, 55, y + 23);

            // Effect
            ctx.fillStyle = '#4f4';
            ctx.fillText(u.effect(lvl), 350, y + 8);

            // Buy button
            const bx = 520, by = y;
            const hovered = Engine.isMouseOver(bx, by, 110, 35);
            if (canAfford) {
                ctx.fillStyle = hovered ? '#2a5a3a' : '#1a3a2a';
                ctx.fillRect(bx, by, 110, 35);
                ctx.strokeStyle = '#4f4';
                ctx.strokeRect(bx, by, 110, 35);
                ctx.fillStyle = '#4f4';
            } else {
                ctx.fillStyle = '#222';
                ctx.fillRect(bx, by, 110, 35);
                ctx.strokeStyle = '#444';
                ctx.strokeRect(bx, by, 110, 35);
                ctx.fillStyle = '#666';
            }
            ctx.font = '12px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`${cost}g`, bx + 55, by + 22);

            // Next level preview
            ctx.textAlign = 'left';
            ctx.fillStyle = '#666';
            ctx.font = '10px "Courier New", monospace';
            ctx.fillText(`Next: ${u.effect(lvl + 1)}`, 650, y + 23);
        });

        ctx.restore();

        // Idle status bar
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, Engine.height - 30, Engine.width, 30);
        ctx.fillStyle = '#888';
        ctx.font = '11px "Courier New", monospace';
        ctx.textAlign = 'left';

        const reactorLvl = Game.idle.reactor || 0;
        const goldLvl = Game.idle.goldGen || 0;
        let status = 'Idle Production: ';
        if (reactorLvl > 0) status += `${reactorLvl} elements/min  `;
        if (goldLvl > 0) status += `${goldLvl * 2} gold/min  `;
        if (reactorLvl === 0 && goldLvl === 0) status += 'None yet';
        ctx.fillText(status, 10, Engine.height - 10);

        ctx.textAlign = 'right';
        ctx.fillText('[ESC] Back to Dungeon', Engine.width - 10, Engine.height - 10);
    }
};
