// main.js - Game state, initialization, and glue code

const Game = {
    player: null,
    idle: {},
    discoveredElements: new Set(),
    inventory: {},
    dungeonLevel: 1,
    totalGold: 0,
    stats: {
        enemiesDefeated: 0,
        floorsCleared: 0,
        quizzesTaken: 0,
        compoundsUsed: 0,
    },

    reset() {
        this.player = {
            name: 'Alchemist',
            level: 1,
            hp: 100,
            maxHp: 100,
            power: 10,
            defense: 5,
            xp: 0,
            xpToNext: 50,
            tempDefense: 0,
        };
        this.idle = {};
        this.discoveredElements = new Set();
        this.inventory = {};
        this.dungeonLevel = 1;
        this.totalGold = 0;
        this.stats = { enemiesDefeated: 0, floorsCleared: 0, quizzesTaken: 0, compoundsUsed: 0 };

        // Start with Hydrogen
        this.discoverElement('H');
        this.addToInventory('H', 5);
        this.discoverElement('He');
        this.addToInventory('He', 3);
        this.discoverElement('C');
        this.addToInventory('C', 3);
        this.discoverElement('O');
        this.addToInventory('O', 3);
    },

    discoverElement(symbol) {
        if (!this.discoveredElements.has(symbol)) {
            this.discoveredElements.add(symbol);
            const el = ELEMENTS[symbol];
            if (el) {
                Engine.notify(`New element discovered: ${el.name} (${el.symbol}) #${el.number}!`, el.color);
            }
        }
    },

    addToInventory(symbol, count) {
        this.inventory[symbol] = (this.inventory[symbol] || 0) + count;
    },

    removeFromInventory(symbol, count) {
        if (this.inventory[symbol]) {
            this.inventory[symbol] -= count;
            if (this.inventory[symbol] <= 0) delete this.inventory[symbol];
        }
    },

    // Auto-save periodically
    _saveTimer: 0,
    tickAutoSave(dt) {
        this._saveTimer += dt;
        if (this._saveTimer >= 60) { // Auto-save every 60 seconds
            this._saveTimer = 0;
            Engine.saveGame();
        }
    }
};

// Initialize everything
function init() {
    Game.reset();
    Engine.init();

    // Register all screens
    Engine.registerScreen('menu', MenuScreen);
    Engine.registerScreen('dungeon', DungeonScreen);
    Engine.registerScreen('combat', Combat);
    Engine.registerScreen('idle', IdleScreen);
    Engine.registerScreen('quiz', QuizScreen);
    Engine.registerScreen('matcher', MatcherScreen);
    Engine.registerScreen('periodic_table', PeriodicTableScreen);
    Engine.registerScreen('inventory', InventoryScreen);

    // Hook idle ticking and auto-save into engine
    Engine.onTick = function(dt) {
        IdleScreen.tickIdle(dt);
        Game.tickAutoSave(dt);
    };

    // Start at menu
    Engine.switchScreen('menu');
}

// Boot up
window.addEventListener('load', init);
