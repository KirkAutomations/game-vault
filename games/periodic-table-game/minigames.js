// minigames.js - Element Quiz and Element Matcher mini-games

// ============ ELEMENT QUIZ ============
const QuizScreen = {
    question: null,
    options: [],
    selectedAnswer: -1,
    correct: false,
    showResult: false,
    resultTimer: 0,
    score: 0,
    round: 0,
    maxRounds: 10,
    questionTypes: ['symbol', 'number', 'category', 'property', 'fact'],
    difficulty: 'medium', // easy, medium, hard

    onEnter() {
        this.score = 0;
        this.round = 0;
        this.generateQuestion();
    },

    generateQuestion() {
        this.round++;
        this.selectedAnswer = -1;
        this.showResult = false;

        if (this.round > this.maxRounds) {
            this.question = null;
            return;
        }

        const discovered = Array.from(Game.discoveredElements).map(s => ELEMENTS[s]).filter(Boolean);
        const pool = discovered.length >= 4 ? discovered : ELEMENTS_BY_NUMBER.filter(Boolean).slice(1, 21);
        const type = this.questionTypes[Math.floor(Math.random() * this.questionTypes.length)];
        const target = pool[Math.floor(Math.random() * pool.length)];

        // Generate wrong answers
        const wrongPool = ELEMENTS_BY_NUMBER.filter(e => e && e.symbol !== target.symbol);
        const shuffled = wrongPool.sort(() => Math.random() - 0.5).slice(0, 3);

        switch (type) {
            case 'symbol':
                this.question = { text: `What is the symbol for ${target.name}?`, answer: target.symbol, element: target };
                this.options = this.shuffle([target.symbol, ...shuffled.map(e => e.symbol)]);
                break;
            case 'number':
                this.question = { text: `What is the atomic number of ${target.name} (${target.symbol})?`, answer: String(target.number), element: target };
                this.options = this.shuffle([String(target.number), ...shuffled.map(e => String(e.number))]);
                break;
            case 'category':
                this.question = { text: `What category does ${target.name} (${target.symbol}) belong to?`, answer: ELEMENT_CATEGORIES[target.category].label, element: target };
                const cats = Object.values(ELEMENT_CATEGORIES).map(c => c.label);
                const wrongCats = cats.filter(c => c !== ELEMENT_CATEGORIES[target.category].label).sort(() => Math.random() - 0.5).slice(0, 3);
                this.options = this.shuffle([ELEMENT_CATEGORIES[target.category].label, ...wrongCats]);
                break;
            case 'property':
                if (target.electronegativity > 0) {
                    this.question = { text: `Which element has an electronegativity of ${target.electronegativity}?`, answer: target.name, element: target };
                    this.options = this.shuffle([target.name, ...shuffled.map(e => e.name)]);
                } else {
                    this.question = { text: `Which element has an atomic mass closest to ${target.mass}?`, answer: target.name, element: target };
                    this.options = this.shuffle([target.name, ...shuffled.map(e => e.name)]);
                }
                break;
            case 'fact':
                this.question = { text: `Which element: "${target.fact}"?`, answer: target.name, element: target };
                this.options = this.shuffle([target.name, ...shuffled.map(e => e.name)]);
                break;
        }
    },

    shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    },

    selectAnswer(index) {
        if (this.showResult) return;
        this.selectedAnswer = index;
        this.correct = this.options[index] === this.question.answer;
        this.showResult = true;
        this.resultTimer = 2;

        if (this.correct) {
            this.score++;
            const xpReward = 5 + Game.player.level * 2;
            const goldReward = 3 + Game.dungeonLevel;
            Game.player.xp += xpReward;
            Game.totalGold += goldReward;
            Engine.spawnBurst(Engine.width / 2, 300, '#4f4', 15, 80);
        } else {
            Engine.shake(3, 0.2);
        }
    },

    update(dt) {
        if (this.showResult) {
            this.resultTimer -= dt;
            if (this.resultTimer <= 0) {
                this.generateQuestion();
            }
        }

        if (!this.question) {
            // Quiz complete
            if (Engine.mouse.clicked || Engine.keysJustPressed['Space'] || Engine.keysJustPressed['Escape']) {
                const bonusGold = this.score * 10;
                Game.totalGold += bonusGold;
                Engine.notify(`Quiz complete! ${this.score}/${this.maxRounds} - Bonus: ${bonusGold}g`, '#ff4');
                Engine.switchScreen(Engine.prevScreen || 'dungeon');
            }
            return;
        }

        // Click on options
        if (!this.showResult) {
            this.options.forEach((opt, i) => {
                const y = 320 + i * 60;
                if (Engine.clickedIn(280, y, 400, 45)) {
                    this.selectAnswer(i);
                }
            });
        }

        if (Engine.keysJustPressed['Escape']) Engine.switchScreen(Engine.prevScreen || 'dungeon');
    },

    draw(ctx) {
        ctx.fillStyle = '#0a0a2a';
        ctx.fillRect(0, 0, Engine.width, Engine.height);

        // Header
        ctx.fillStyle = '#4af';
        ctx.font = 'bold 22px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ELEMENT QUIZ', Engine.width / 2, 40);

        ctx.fillStyle = '#888';
        ctx.font = '14px "Courier New", monospace';
        ctx.fillText(`Round ${Math.min(this.round, this.maxRounds)}/${this.maxRounds}  |  Score: ${this.score}`, Engine.width / 2, 65);

        if (!this.question) {
            // Results screen
            ctx.fillStyle = '#ff4';
            ctx.font = 'bold 28px "Courier New", monospace';
            ctx.fillText('Quiz Complete!', Engine.width / 2, 200);
            ctx.fillStyle = '#fff';
            ctx.font = '20px "Courier New", monospace';
            ctx.fillText(`Score: ${this.score}/${this.maxRounds}`, Engine.width / 2, 250);

            const grade = this.score >= 9 ? 'S' : this.score >= 7 ? 'A' : this.score >= 5 ? 'B' : this.score >= 3 ? 'C' : 'D';
            const gradeColors = { S: '#ff4', A: '#4f4', B: '#4af', C: '#fa4', D: '#f44' };
            ctx.fillStyle = gradeColors[grade];
            ctx.font = 'bold 48px "Courier New", monospace';
            ctx.fillText(`Grade: ${grade}`, Engine.width / 2, 330);

            ctx.fillStyle = '#888';
            ctx.font = '14px "Courier New", monospace';
            ctx.fillText(`Bonus gold: ${this.score * 10}g`, Engine.width / 2, 380);
            ctx.fillText('Click or press Space to continue', Engine.width / 2, 430);
            return;
        }

        // Question
        ctx.fillStyle = '#fff';
        ctx.font = '16px "Courier New", monospace';
        const lines = this.wrapText(this.question.text, 60);
        lines.forEach((line, i) => {
            ctx.fillText(line, Engine.width / 2, 120 + i * 24);
        });

        // Element preview
        const el = this.question.element;
        SpriteGen.drawSprite(ctx, 'element_orb', Engine.width / 2 - 32, 170, 64, { color: el.color });
        SpriteGen.drawGlow(ctx, Engine.width / 2, 202, 50, el.color, Engine.time);

        // Options
        this.options.forEach((opt, i) => {
            const y = 320 + i * 60;
            const hovered = Engine.isMouseOver(280, y, 400, 45);
            let bgColor = hovered ? '#2a3a5a' : '#1a2040';
            let borderColor = '#4af';
            let textColor = '#fff';

            if (this.showResult) {
                if (opt === this.question.answer) {
                    bgColor = '#1a4a1a'; borderColor = '#4f4'; textColor = '#4f4';
                } else if (i === this.selectedAnswer) {
                    bgColor = '#4a1a1a'; borderColor = '#f44'; textColor = '#f44';
                }
            }

            ctx.fillStyle = bgColor;
            ctx.fillRect(280, y, 400, 45);
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 2;
            ctx.strokeRect(280, y, 400, 45);

            ctx.fillStyle = textColor;
            ctx.font = '15px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(opt, Engine.width / 2, y + 28);
        });

        // Result feedback
        if (this.showResult) {
            ctx.fillStyle = this.correct ? '#4f4' : '#f44';
            ctx.font = 'bold 18px "Courier New", monospace';
            ctx.fillText(this.correct ? 'Correct!' : `Wrong! Answer: ${this.question.answer}`, Engine.width / 2, 580);
        }
    },

    wrapText(text, maxChars) {
        const words = text.split(' ');
        const lines = [];
        let current = '';
        words.forEach(w => {
            if ((current + ' ' + w).length > maxChars) {
                lines.push(current);
                current = w;
            } else {
                current = current ? current + ' ' + w : w;
            }
        });
        if (current) lines.push(current);
        return lines;
    }
};


// ============ ELEMENT MATCHER (Memory/Match Game) ============
const MatcherScreen = {
    cards: [],
    flipped: [],
    matched: [],
    canFlip: true,
    flipTimer: 0,
    moves: 0,
    pairsFound: 0,
    totalPairs: 0,
    gridCols: 6,
    gridRows: 4,
    cardWidth: 100,
    cardHeight: 120,
    startX: 0,
    startY: 0,

    onEnter() {
        this.generateBoard();
    },

    generateBoard() {
        this.totalPairs = (this.gridCols * this.gridRows) / 2;
        this.cards = [];
        this.flipped = [];
        this.matched = [];
        this.moves = 0;
        this.pairsFound = 0;
        this.canFlip = true;

        // Pick random elements for pairs
        const pool = [];
        const available = ELEMENTS_BY_NUMBER.filter(Boolean);
        while (pool.length < this.totalPairs) {
            const el = available[Math.floor(Math.random() * available.length)];
            if (!pool.find(p => p.symbol === el.symbol)) pool.push(el);
        }

        // Create pairs: one card shows symbol, partner shows name
        const cardData = [];
        pool.forEach((el, i) => {
            cardData.push({ pairId: i, element: el, showType: 'symbol', display: el.symbol });
            cardData.push({ pairId: i, element: el, showType: 'name', display: el.name });
        });

        // Shuffle
        for (let i = cardData.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cardData[i], cardData[j]] = [cardData[j], cardData[i]];
        }

        this.cards = cardData;
        this.startX = (Engine.width - this.gridCols * (this.cardWidth + 10)) / 2;
        this.startY = 100;
    },

    getCardPos(index) {
        const col = index % this.gridCols;
        const row = Math.floor(index / this.gridCols);
        return {
            x: this.startX + col * (this.cardWidth + 10),
            y: this.startY + row * (this.cardHeight + 10)
        };
    },

    flipCard(index) {
        if (!this.canFlip) return;
        if (this.flipped.includes(index) || this.matched.includes(index)) return;

        this.flipped.push(index);

        if (this.flipped.length === 2) {
            this.moves++;
            this.canFlip = false;
            const [a, b] = this.flipped;
            if (this.cards[a].pairId === this.cards[b].pairId) {
                // Match!
                this.matched.push(a, b);
                this.pairsFound++;
                this.flipped = [];
                this.canFlip = true;

                const el = this.cards[a].element;
                Game.discoverElement(el.symbol);
                const pos = this.getCardPos(a);
                Engine.spawnBurst(pos.x + this.cardWidth / 2, pos.y + this.cardHeight / 2, el.color, 10, 60);

                if (this.pairsFound === this.totalPairs) {
                    const reward = Math.max(10, 50 - this.moves);
                    Game.totalGold += reward;
                    Game.player.xp += 20;
                    Engine.notify(`All matched! +${reward}g +20 XP`, '#ff4');
                }
            } else {
                this.flipTimer = 1;
            }
        }
    },

    update(dt) {
        if (this.flipTimer > 0) {
            this.flipTimer -= dt;
            if (this.flipTimer <= 0) {
                this.flipped = [];
                this.canFlip = true;
            }
        }

        // Click detection
        if (Engine.mouse.clicked && this.canFlip) {
            this.cards.forEach((card, i) => {
                const pos = this.getCardPos(i);
                if (Engine.clickedIn(pos.x, pos.y, this.cardWidth, this.cardHeight)) {
                    this.flipCard(i);
                }
            });
        }

        if (Engine.keysJustPressed['Escape']) Engine.switchScreen(Engine.prevScreen || 'dungeon');
        if (this.pairsFound === this.totalPairs && Engine.keysJustPressed['Space']) {
            Engine.switchScreen(Engine.prevScreen || 'dungeon');
        }
    },

    draw(ctx) {
        ctx.fillStyle = '#0a0a2a';
        ctx.fillRect(0, 0, Engine.width, Engine.height);

        ctx.fillStyle = '#fa4';
        ctx.font = 'bold 22px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ELEMENT MATCHER', Engine.width / 2, 40);

        ctx.fillStyle = '#888';
        ctx.font = '14px "Courier New", monospace';
        ctx.fillText(`Moves: ${this.moves}  |  Pairs: ${this.pairsFound}/${this.totalPairs}`, Engine.width / 2, 65);

        // Draw cards
        this.cards.forEach((card, i) => {
            const pos = this.getCardPos(i);
            const isFlipped = this.flipped.includes(i);
            const isMatched = this.matched.includes(i);
            const hovered = Engine.isMouseOver(pos.x, pos.y, this.cardWidth, this.cardHeight);

            if (isMatched) {
                // Matched - show with glow
                ctx.fillStyle = SpriteGen.darken(card.element.color, 0.3);
                ctx.fillRect(pos.x, pos.y, this.cardWidth, this.cardHeight);
                ctx.strokeStyle = card.element.color;
                ctx.lineWidth = 2;
                ctx.strokeRect(pos.x, pos.y, this.cardWidth, this.cardHeight);

                ctx.fillStyle = card.element.color;
                ctx.font = card.showType === 'symbol' ? 'bold 28px "Courier New", monospace' : 'bold 11px "Courier New", monospace';
                ctx.fillText(card.display, pos.x + this.cardWidth / 2, pos.y + this.cardHeight / 2);

                ctx.fillStyle = '#888';
                ctx.font = '9px "Courier New", monospace';
                ctx.fillText(`#${card.element.number}`, pos.x + this.cardWidth / 2, pos.y + this.cardHeight - 10);
            } else if (isFlipped) {
                // Face up
                ctx.fillStyle = '#1a2a4a';
                ctx.fillRect(pos.x, pos.y, this.cardWidth, this.cardHeight);
                ctx.strokeStyle = card.element.color;
                ctx.lineWidth = 2;
                ctx.strokeRect(pos.x, pos.y, this.cardWidth, this.cardHeight);

                ctx.fillStyle = '#fff';
                ctx.font = card.showType === 'symbol' ? 'bold 28px "Courier New", monospace' : 'bold 12px "Courier New", monospace';
                ctx.fillText(card.display, pos.x + this.cardWidth / 2, pos.y + this.cardHeight / 2);
            } else {
                // Face down
                ctx.fillStyle = hovered ? '#2a3a5a' : '#1a2040';
                ctx.fillRect(pos.x, pos.y, this.cardWidth, this.cardHeight);
                ctx.strokeStyle = hovered ? '#4af' : '#334';
                ctx.lineWidth = 1;
                ctx.strokeRect(pos.x, pos.y, this.cardWidth, this.cardHeight);

                ctx.fillStyle = '#334';
                ctx.font = 'bold 24px "Courier New", monospace';
                ctx.fillText('?', pos.x + this.cardWidth / 2, pos.y + this.cardHeight / 2);
            }
        });

        if (this.pairsFound === this.totalPairs) {
            ctx.fillStyle = '#ff4';
            ctx.font = 'bold 20px "Courier New", monospace';
            ctx.fillText(`Complete in ${this.moves} moves! Press Space to continue`, Engine.width / 2, Engine.height - 30);
        } else {
            ctx.fillStyle = '#555';
            ctx.font = '11px "Courier New", monospace';
            ctx.fillText('Match element symbols with their names! [ESC] Back', Engine.width / 2, Engine.height - 15);
        }
    }
};
