// combat.js - Turn-based element combat system
const Combat = {
    enemy: null,
    enemyIndex: -1,
    phase: 'select', // select, player_attack, enemy_attack, victory, defeat
    selectedElement: null,
    playerElements: [],
    turnLog: [],
    animTimer: 0,
    flashColor: null,
    flashTimer: 0,
    damageNumbers: [],
    compoundMode: false,
    selectedForCompound: [],

    startBattle(enemy, entityIndex) {
        this.enemy = { ...enemy };
        this.enemyIndex = entityIndex;
        this.phase = 'select';
        this.selectedElement = null;
        this.turnLog = [];
        this.animTimer = 0;
        this.damageNumbers = [];
        this.compoundMode = false;
        this.selectedForCompound = [];

        // Get player's available elements
        this.playerElements = [];
        for (const [sym, count] of Object.entries(Game.inventory)) {
            if (count > 0 && ELEMENTS[sym]) {
                this.playerElements.push(ELEMENTS[sym]);
            }
        }
        // Always have Hydrogen as fallback
        if (this.playerElements.length === 0) {
            this.playerElements.push(ELEMENTS['H']);
            Game.addToInventory('H', 5);
        }

        this.addLog(`A wild ${enemy.element.name} ${enemy.isBoss ? 'BOSS ' : ''}appears!`);
        this.addLog(`Type: ${enemy.element.category} (${enemy.element.dmgType})`);
    },

    addLog(msg) {
        this.turnLog.push(msg);
        if (this.turnLog.length > 6) this.turnLog.shift();
    },

    calcDamage(attackEl, defenderEl, basePower) {
        const atkType = attackEl.dmgType;
        const defType = defenderEl.dmgType;
        let multiplier = 1;
        if (TYPE_CHART[atkType] && TYPE_CHART[atkType][defType]) {
            multiplier = TYPE_CHART[atkType][defType];
        }
        const variance = 0.9 + Math.random() * 0.2;
        return Math.max(1, Math.floor(basePower * multiplier * variance));
    },

    playerAttack(element) {
        this.selectedElement = element;
        this.phase = 'player_attack';
        this.animTimer = 0.8;

        // Teach about the element
        const fact = element.fact;
        this.addLog(`You attack with ${element.name} (${element.symbol})!`);

        // Calculate damage
        const idleBonus = Game.idle.attackBonus || 0;
        const levelBonus = Game.player.level * 2;
        const basePower = element.power + levelBonus + idleBonus;
        const dmg = this.calcDamage(element, this.enemy.element, basePower);

        const atkType = element.dmgType;
        const defType = this.enemy.element.dmgType;
        const mult = (TYPE_CHART[atkType] && TYPE_CHART[atkType][defType]) ? TYPE_CHART[atkType][defType] : 1;

        this.enemy.hp -= dmg;
        this.spawnDamageNumber(650, 250, dmg, mult > 1 ? '#ff4' : mult < 1 ? '#888' : '#fff');

        if (mult > 1.5) this.addLog(`Super effective! ${atkType} > ${defType}`);
        else if (mult < 1) this.addLog(`Not very effective... ${atkType} vs ${defType}`);

        this.addLog(`Dealt ${dmg} damage!`);
        Engine.shake(mult > 1 ? 6 : 3, 0.2);
        this.flashColor = element.color;
        this.flashTimer = 0.2;

        // Show element fact sometimes
        if (Math.random() < 0.4) {
            this.addLog(`Fact: ${fact}`);
        }
    },

    useCompound(compound) {
        this.phase = 'player_attack';
        this.animTimer = 0.8;

        // Consume elements
        compound.elements.forEach(sym => Game.removeFromInventory(sym, 1));

        this.addLog(`Used ${compound.name} (${compound.formula})!`);

        if (compound.bonus === 'heal') {
            const heal = compound.power + Game.player.level * 5;
            Game.player.hp = Math.min(Game.player.maxHp, Game.player.hp + heal);
            this.addLog(`Healed ${heal} HP!`);
            this.spawnDamageNumber(250, 300, heal, '#4f4');
        } else if (compound.bonus === 'defense' || compound.bonus === 'shield' || compound.bonus === 'armor') {
            Game.player.tempDefense = (Game.player.tempDefense || 0) + compound.power;
            this.addLog(`Defense +${compound.power} this battle!`);
        } else {
            // Damage compound
            const dmg = Math.floor(compound.power * (1 + Game.player.level * 0.1));
            this.enemy.hp -= dmg;
            this.addLog(`${compound.desc} - ${dmg} damage!`);
            this.spawnDamageNumber(650, 250, dmg, '#ff4');
            Engine.shake(8, 0.3);
        }

        this.flashColor = '#ff4';
        this.flashTimer = 0.3;
        this.compoundMode = false;
        this.selectedForCompound = [];
    },

    enemyAttack() {
        this.phase = 'enemy_attack';
        this.animTimer = 0.8;

        const el = this.enemy.element;
        const basePower = this.enemy.power;
        const playerDef = Game.player.defense + (Game.player.tempDefense || 0) + (Game.idle.defenseBonus || 0);
        const rawDmg = Math.max(1, basePower - Math.floor(playerDef * 0.3));
        const dmg = Math.max(1, Math.floor(rawDmg * (0.9 + Math.random() * 0.2)));

        Game.player.hp -= dmg;
        this.addLog(`${el.name} attacks for ${dmg} damage!`);
        this.spawnDamageNumber(250, 300, dmg, '#f44');
        Engine.shake(4, 0.2);
        this.flashColor = '#f00';
        this.flashTimer = 0.15;
    },

    spawnDamageNumber(x, y, amount, color) {
        this.damageNumbers.push({ x, y, amount, color, life: 1.5 });
    },

    checkVictory() {
        if (this.enemy.hp <= 0) {
            this.phase = 'victory';
            this.animTimer = 2;

            const xp = this.enemy.element.number * 2 + (this.enemy.isBoss ? 100 : 10);
            const gold = 5 + this.enemy.element.number + (this.enemy.isBoss ? 50 : 0);
            Game.player.xp += xp;
            Game.totalGold += gold;
            Game.stats.enemiesDefeated++;

            // Chance to get the enemy's element
            if (Math.random() < 0.5) {
                Game.discoverElement(this.enemy.element.symbol);
                Game.addToInventory(this.enemy.element.symbol, 1);
                this.addLog(`Obtained ${this.enemy.element.name}!`);
            }

            this.addLog(`Victory! +${xp} XP, +${gold} Gold`);

            // Level up check
            while (Game.player.xp >= Game.player.xpToNext) {
                Game.player.xp -= Game.player.xpToNext;
                Game.player.level++;
                Game.player.maxHp += 10;
                Game.player.hp = Game.player.maxHp;
                Game.player.power += 3;
                Game.player.defense += 2;
                Game.player.xpToNext = Math.floor(Game.player.xpToNext * 1.3);
                this.addLog(`LEVEL UP! Now level ${Game.player.level}!`);
                Engine.spawnBurst(250, 300, '#ff4', 30, 150);
            }

            // Remove enemy from dungeon
            DungeonScreen.dungeon.entities.splice(this.enemyIndex, 1);
            return true;
        }
        if (Game.player.hp <= 0) {
            this.phase = 'defeat';
            this.animTimer = 2;
            this.addLog('You were defeated...');
            return true;
        }
        return false;
    },

    getAvailableCompounds() {
        const available = [];
        COMPOUNDS.forEach(c => {
            const counts = {};
            c.elements.forEach(s => { counts[s] = (counts[s] || 0) + 1; });
            let canMake = true;
            for (const [sym, needed] of Object.entries(counts)) {
                if ((Game.inventory[sym] || 0) < needed) { canMake = false; break; }
            }
            if (canMake) available.push(c);
        });
        return available;
    },

    update(dt) {
        // Update damage numbers
        for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
            this.damageNumbers[i].life -= dt;
            this.damageNumbers[i].y -= 40 * dt;
            if (this.damageNumbers[i].life <= 0) this.damageNumbers.splice(i, 1);
        }

        if (this.flashTimer > 0) this.flashTimer -= dt;

        if (this.animTimer > 0) {
            this.animTimer -= dt;
            if (this.animTimer <= 0) {
                if (this.phase === 'player_attack') {
                    if (!this.checkVictory()) {
                        this.enemyAttack();
                    }
                } else if (this.phase === 'enemy_attack') {
                    if (!this.checkVictory()) {
                        this.phase = 'select';
                        // Refresh element list
                        this.playerElements = [];
                        for (const [sym, count] of Object.entries(Game.inventory)) {
                            if (count > 0 && ELEMENTS[sym]) this.playerElements.push(ELEMENTS[sym]);
                        }
                    }
                } else if (this.phase === 'victory' || this.phase === 'defeat') {
                    if (this.phase === 'defeat') {
                        Game.player.hp = Math.floor(Game.player.maxHp * 0.3);
                        Game.dungeonLevel = Math.max(1, Game.dungeonLevel - 1);
                        DungeonScreen.generateNewDungeon();
                    }
                    Game.player.tempDefense = 0;
                    Engine.switchScreen('dungeon');
                }
            }
            return;
        }

        if (this.phase === 'select') {
            // Handle element selection via clicking
            if (this.compoundMode) {
                const compounds = this.getAvailableCompounds();
                compounds.forEach((c, i) => {
                    const bx = 50, by = 380 + i * 35;
                    if (Engine.clickedIn(bx, by, 350, 30)) {
                        this.useCompound(c);
                    }
                });
                if (Engine.keysJustPressed['Escape']) {
                    this.compoundMode = false;
                }
            } else {
                // Element buttons
                const cols = 8;
                this.playerElements.forEach((el, i) => {
                    const col = i % cols, row = Math.floor(i / cols);
                    const bx = 50 + col * 105, by = 400 + row * 55;
                    if (Engine.clickedIn(bx, by, 100, 50)) {
                        this.playerAttack(el);
                    }
                });

                // Compound button
                if (Engine.clickedIn(700, 550, 120, 35)) {
                    this.compoundMode = true;
                }
                // Run button
                if (Engine.clickedIn(830, 550, 80, 35)) {
                    Game.player.tempDefense = 0;
                    Engine.switchScreen('dungeon');
                }
            }
        }
    },

    draw(ctx) {
        // Background
        ctx.fillStyle = '#0a0a2a';
        ctx.fillRect(0, 0, Engine.width, Engine.height);

        // Flash effect
        if (this.flashTimer > 0 && this.flashColor) {
            ctx.save();
            ctx.globalAlpha = this.flashTimer * 3;
            ctx.fillStyle = this.flashColor;
            ctx.fillRect(0, 0, Engine.width, Engine.height);
            ctx.restore();
        }

        // Battle arena
        ctx.strokeStyle = '#334';
        ctx.lineWidth = 2;
        ctx.strokeRect(30, 30, Engine.width - 60, 340);

        // Player side
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px "Courier New", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${Game.player.name} (Lv.${Game.player.level})`, 50, 60);
        // Player HP
        const phpPct = Game.player.hp / Game.player.maxHp;
        ctx.fillStyle = '#300';
        ctx.fillRect(50, 70, 200, 16);
        ctx.fillStyle = phpPct > 0.5 ? '#0c0' : phpPct > 0.25 ? '#cc0' : '#c00';
        ctx.fillRect(50, 70, 200 * phpPct, 16);
        ctx.fillStyle = '#fff';
        ctx.font = '12px "Courier New", monospace';
        ctx.fillText(`HP: ${Game.player.hp}/${Game.player.maxHp}`, 55, 83);

        // Player sprite
        SpriteGen.drawSprite(ctx, 'player', 180, 180, 96, { color: '#4af' });

        // Enemy side
        if (this.enemy) {
            ctx.fillStyle = this.enemy.element.color;
            ctx.font = 'bold 16px "Courier New", monospace';
            ctx.textAlign = 'right';
            const prefix = this.enemy.isBoss ? 'BOSS: ' : '';
            ctx.fillText(`${prefix}${this.enemy.element.name} (${this.enemy.element.symbol})`, Engine.width - 50, 60);
            // Enemy HP
            const ehpPct = Math.max(0, this.enemy.hp / this.enemy.maxHp);
            ctx.fillStyle = '#300';
            ctx.fillRect(Engine.width - 250, 70, 200, 16);
            ctx.fillStyle = ehpPct > 0.5 ? '#0c0' : ehpPct > 0.25 ? '#cc0' : '#c00';
            ctx.fillRect(Engine.width - 250, 70, 200 * ehpPct, 16);
            ctx.fillStyle = '#fff';
            ctx.font = '12px "Courier New", monospace';
            ctx.textAlign = 'right';
            ctx.fillText(`HP: ${Math.max(0, this.enemy.hp)}/${this.enemy.maxHp}`, Engine.width - 55, 83);

            // Enemy sprite
            const sprType = this.enemy.isBoss ? 'boss' : 'enemy';
            SpriteGen.drawSprite(ctx, sprType, 620, 150, 128, {
                color: this.enemy.element.color,
                variant: this.enemy.variant
            });

            // Element info
            ctx.textAlign = 'right';
            ctx.fillStyle = '#aaa';
            ctx.font = '11px "Courier New", monospace';
            ctx.fillText(`#${this.enemy.element.number} | ${ELEMENT_CATEGORIES[this.enemy.element.category].label}`, Engine.width - 50, 100);
            ctx.fillText(`Type: ${this.enemy.element.dmgType} | Mass: ${this.enemy.element.mass}`, Engine.width - 50, 114);
        }

        // Turn log
        ctx.textAlign = 'left';
        ctx.font = '12px "Courier New", monospace';
        this.turnLog.forEach((msg, i) => {
            ctx.fillStyle = i === this.turnLog.length - 1 ? '#fff' : '#888';
            ctx.fillText(msg, 350, 180 + i * 18);
        });

        // Damage numbers
        this.damageNumbers.forEach(d => {
            ctx.save();
            ctx.globalAlpha = Math.min(1, d.life);
            ctx.fillStyle = d.color;
            ctx.font = `bold ${20 + (1.5 - d.life) * 10}px "Courier New", monospace`;
            ctx.textAlign = 'center';
            ctx.fillText(d.amount, d.x, d.y);
            ctx.restore();
        });

        // Bottom panel - element selection or compounds
        ctx.fillStyle = 'rgba(0,0,20,0.9)';
        ctx.fillRect(30, 375, Engine.width - 60, Engine.height - 395);
        ctx.strokeStyle = '#334';
        ctx.strokeRect(30, 375, Engine.width - 60, Engine.height - 395);

        if (this.phase === 'select') {
            if (this.compoundMode) {
                ctx.fillStyle = '#ff4';
                ctx.font = 'bold 14px "Courier New", monospace';
                ctx.textAlign = 'left';
                ctx.fillText('COMPOUNDS (combine elements for powerful effects):', 50, 395);

                const compounds = this.getAvailableCompounds();
                if (compounds.length === 0) {
                    ctx.fillStyle = '#888';
                    ctx.fillText('No compounds available - collect more elements!', 50, 420);
                }
                compounds.forEach((c, i) => {
                    const bx = 50, by = 380 + i * 35;
                    const hovered = Engine.isMouseOver(bx, by, 350, 30);
                    ctx.fillStyle = hovered ? '#2a3a5a' : '#1a2a3a';
                    ctx.fillRect(bx, by, 350, 30);
                    ctx.strokeStyle = '#4af';
                    ctx.strokeRect(bx, by, 350, 30);
                    ctx.fillStyle = hovered ? '#fff' : '#4af';
                    ctx.font = '12px "Courier New", monospace';
                    ctx.fillText(`${c.name} (${c.formula}) - ${c.desc}`, bx + 10, by + 19);
                });

                ctx.fillStyle = '#888';
                ctx.fillText('[ESC] Back', 50, Engine.height - 20);
            } else {
                ctx.fillStyle = '#4af';
                ctx.font = 'bold 14px "Courier New", monospace';
                ctx.textAlign = 'left';
                ctx.fillText('Choose an element to attack with:', 50, 395);

                const cols = 8;
                this.playerElements.forEach((el, i) => {
                    const col = i % cols, row = Math.floor(i / cols);
                    const bx = 50 + col * 105, by = 400 + row * 55;
                    const hovered = Engine.isMouseOver(bx, by, 100, 50);

                    ctx.fillStyle = hovered ? el.color : SpriteGen.darken(el.color, 0.4);
                    ctx.fillRect(bx, by, 100, 50);
                    ctx.strokeStyle = el.color;
                    ctx.lineWidth = hovered ? 2 : 1;
                    ctx.strokeRect(bx, by, 100, 50);

                    ctx.fillStyle = '#fff';
                    ctx.font = 'bold 18px "Courier New", monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText(el.symbol, bx + 30, by + 30);
                    ctx.font = '9px "Courier New", monospace';
                    ctx.fillText(el.name, bx + 65, by + 22);
                    ctx.fillText(`Pow:${el.power}`, bx + 65, by + 35);
                    ctx.fillStyle = '#aaa';
                    ctx.fillText(`x${Game.inventory[el.symbol] || 0}`, bx + 65, by + 46);
                });

                // Compound button
                const ch = Engine.isMouseOver(700, 550, 120, 35);
                Engine.drawButton(ctx, 700, 550, 120, 35, 'Compounds', ch);

                // Run button
                const rh = Engine.isMouseOver(830, 550, 80, 35);
                ctx.fillStyle = rh ? '#433' : '#322';
                ctx.fillRect(830, 550, 80, 35);
                ctx.strokeStyle = '#f44';
                ctx.strokeRect(830, 550, 80, 35);
                ctx.fillStyle = rh ? '#fff' : '#f44';
                ctx.font = '14px "Courier New", monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Run', 870, 572);
            }
        } else {
            ctx.fillStyle = '#888';
            ctx.font = '16px "Courier New", monospace';
            ctx.textAlign = 'center';
            if (this.phase === 'victory') ctx.fillText('Victory!', Engine.width / 2, 450);
            else if (this.phase === 'defeat') ctx.fillText('Defeated... returning to previous floor.', Engine.width / 2, 450);
            else ctx.fillText('...', Engine.width / 2, 450);
        }
    }
};
