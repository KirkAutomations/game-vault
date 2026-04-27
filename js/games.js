// Game data — order determines "newest" (last = newest)
const games = [
  { title: "Gingerbread Game", subtitle: "Idle & Mini Games", icon: "🍪", href: "games/leonardo2/gingerbread-game.html", category: "Idle", added: 1 },
  { title: "Grid Wars", subtitle: "Strategy", icon: "⚔️", href: "games/leonardogame/gridwars.html", category: "Strategy", added: 2 },
  { title: "Periodic Table Game", subtitle: "Educational RPG", icon: "⚗️", href: "games/periodic-table-game/index.html", category: "Educational", added: 3 },
  { title: "Weights", subtitle: "Idle Game", icon: "🏋️", href: "games/weights/index.html", category: "Idle", added: 4 },
  { title: "Triforce Rush", subtitle: "Platformer", icon: "🗡️", href: "games/zelda/game.html", category: "Platformer / Action", added: 5 },
  { title: "Infinite Hug", subtitle: "Chill / Relaxing", icon: "🤗", href: "games/infinite-hug/index.html", category: "Chill / Relaxing", added: 6 },
  { title: "Princess Rocket Adventure", subtitle: "Action", icon: "🚀", href: "games/princess-rocket/index.html", category: "Action", added: 7 },
  { title: "Magic Princess Evolution", subtitle: "Evolution / Idle", icon: "👸", href: "games/magic-princess/index.html", category: "Evolution / Idle", added: 8 },
  { title: "Dungeon Dash", subtitle: "Roguelike Action", icon: "🏰", href: "games/dungeon-dash/index.html", category: "Roguelike", added: 9 },
  { title: "Cleopatra: The Realist Queen", subtitle: "Strategy / Educational", icon: "🏛️", href: "games/cleopatra/index.html", category: "Strategy / Educational", added: 10 },
  { title: "The Melian Dilemma", subtitle: "IR Realism Strategy", icon: "⚖️", href: "games/melian-dilemma/index.html", category: "Strategy / Educational", added: 11 },
  { title: "The Peloponnesian War", subtitle: "Real-Time Strategy", icon: "🏺", href: "games/peloponnesian-war/index.html", category: "Strategy / Educational", added: 12 },
  { title: "Math Monsters", subtitle: "Multiplication Adventure", icon: "🧮", href: "games/math-monsters/index.html", category: "Educational", added: 13 },
  { title: "ChemRogue: Elemental Ascension", subtitle: "Educational RPG", icon: "🧪", href: "games/chemrogue/index.html", category: "Educational", added: 14 },
  { title: "Division Quest", subtitle: "Math Adventure", icon: "➗", href: "games/division-quest/index.html", category: "Educational", added: 15 },
  { title: "Pete the Cat's Groovy Computer Skills!", subtitle: "Toddler / Learning", icon: "🐱", href: "games/pete-the-cat/index.html", category: "Educational", added: 16 },
  { title: "Spelling Princess Dress-Up", subtitle: "Kids / Spelling", icon: "👗", href: "games/princess-dressup/index.html", category: "Educational", added: 17 },
  { title: "The Peloponnesian War III", subtitle: "Grand Strategy", icon: "⚔️", href: "games/peloponnesian-war-3/index.html", category: "Strategy / Educational", added: 18 },
  { title: "GORGIAS: The Dialectic Duel", subtitle: "Philosophy / Debate", icon: "🏛️", href: "games/gorgias/index.html", category: "Strategy / Educational", added: 19 },
  { title: "SwirlyBrew: First Sip", subtitle: "Idle Drink Tycoon", icon: "🍹", href: "games/swirlybrew/v1.html", category: "Idle", added: 20 },
  { title: "SwirlyBrew: Golden Pour", subtitle: "Idle Drink Tycoon", icon: "🥂", href: "games/swirlybrew/v2.html", category: "Idle", added: 21 },
  { title: "SwirlyBrew: Grand Elixir", subtitle: "Idle Drink Tycoon", icon: "🧪", href: "games/swirlybrew/index.html", category: "Idle", added: 22 },
  { title: "Mario's Spider Web", subtitle: "Spanish Solitaire", icon: "🕷️", href: "games/mario-spider-solitaire/index.html", category: "Educational", added: 23 },
  { title: "Mario's Number Kingdom", subtitle: "Spanish Sudoku", icon: "🔢", href: "games/mario-sudoku/index.html", category: "Educational", added: 24 },
  { title: "The Spelling Beyond", subtitle: "Frozen Spelling Adventure", icon: "❄️", href: "games/spelling-bee/index.html", category: "Educational", added: 25 },
  { title: "Efficiency Craft", subtitle: "Survival / Factory Sim", icon: "⚙️", href: "games/eie2/index.html", category: "Strategy", added: 26 },
  { title: "Aurelia's Stoic Garden", subtitle: "Philosophy / Sim", icon: "🌿", href: "games/aurelias-stoic-garden/index.html", category: "Philosophy", added: 27 },
  { title: "BlockWorld Academy", subtitle: "3D Voxel Adventure", icon: "🧱", href: "games/blockworld-academy/index.html", category: "Action", added: 28 },
  { title: "Efficiency Is Everything", subtitle: "The Original", icon: "⚡", href: "games/eie/index.html", category: "Strategy", added: 29 },
  { title: "Elemental Realism", subtitle: "Action RPG", icon: "🔥", href: "games/elemental-realism/index.html", category: "Action", added: 30 },
  { title: "PedaMod", subtitle: "Foot PT Modalities Trainer", icon: "🦶", href: "games/pedamod/index.html", category: "Educational", added: 31 },
  { title: "Cosmos: The Knowledge Engine", subtitle: "Exploration / Educational", icon: "🌌", href: "games/cosmos/index.html", category: "Educational", added: 32 },
  { title: "Escape Academy", subtitle: "Train. Learn. Escape!", icon: "🏫", href: "games/escape-academy/index.html", category: "Action", added: 33 },
  { title: "Road Crosser", subtitle: "Arcade", icon: "🚗", href: "games/road-crosser/index.html", category: "Platformer / Action", added: 34 },
  { title: "Leonardo's Lemonade Stand", subtitle: "Idle / Sim", icon: "🍋", href: "games/lemonade-stand/index.html", category: "Idle", added: 35 },
  { title: "Thus Spoke Zarathustra", subtitle: "Philosophy / Adventure", icon: "📖", href: "games/zarathustra/index.html", category: "Philosophy", added: 36 },
  { title: "UC Tracker", subtitle: "Ulcerative Colitis Root Cause Finder", icon: "🩺", href: "games/uc-tracker/index.html", category: "Educational", added: 37 },
  { title: "TROGDOR: Burnination", subtitle: "Burninate the Countryside", icon: "🐉", href: "games/trogdor/01_burnination.html", category: "Action", added: 38 },
  { title: "TROGDOR: Wings of Fury", subtitle: "Take Flight", icon: "🦅", href: "games/trogdor/02_wings_of_fury.html", category: "Action", added: 39 },
  { title: "TROGDOR: Rhythm of Fire", subtitle: "Rhythm Game", icon: "🎵", href: "games/trogdor/03_rhythm_of_fire.html", category: "Action", added: 40 },
  { title: "TROGDOR: Tower of Doom", subtitle: "Climb the Tower", icon: "🏰", href: "games/trogdor/04_tower_of_doom.html", category: "Action", added: 41 },
  { title: "TROGDOR: Quest for Burnination", subtitle: "Adventure Quest", icon: "🗡️", href: "games/trogdor/05_quest_for_burnination.html", category: "Action", added: 42 },
  { title: "TROGDOR: Peasant Crusher", subtitle: "Crush Them All", icon: "💥", href: "games/trogdor/06_peasant_crusher.html", category: "Action", added: 43 },
  { title: "TROGDOR: Inferno", subtitle: "Ultimate Burnination", icon: "🔥", href: "games/trogdor/07_inferno_IMPORTANT.html", category: "Action", added: 44 },
  { title: "TROGDOR: Maze of Burnination", subtitle: "Navigate the Flames", icon: "🔥", href: "games/trogdor/08_maze_of_burnination.html", category: "Action", added: 45 },
  { title: "TROGDOR: Rampage", subtitle: "Total Destruction", icon: "💥", href: "games/trogdor/09_rampage.html", category: "Action", added: 46 },
  { title: "TROGDOR: Eternal Flame", subtitle: "The Final Chapter", icon: "🐉", href: "games/trogdor/10_eternal_flame.html", category: "Action", added: 47 },
];

const grid = document.getElementById('game-grid');
const categoryFilter = document.getElementById('category-filter');
const sortSelect = document.getElementById('sort-select');

// Build category options
const categories = [...new Set(games.map(g => g.category))].sort();
categories.forEach(cat => {
  const opt = document.createElement('option');
  opt.value = cat;
  opt.textContent = cat;
  categoryFilter.appendChild(opt);
});

function renderGames() {
  const cat = categoryFilter.value;
  const sort = sortSelect.value;

  let filtered = cat === 'all' ? [...games] : games.filter(g => g.category === cat);

  if (sort === 'newest') filtered.sort((a, b) => b.added - a.added);
  else if (sort === 'oldest') filtered.sort((a, b) => a.added - b.added);
  else if (sort === 'name') filtered.sort((a, b) => a.title.localeCompare(b.title));

  grid.innerHTML = filtered.map(g => `
    <a href="${g.href}" class="game-card" data-category="${g.category}">
      <div class="game-icon">${g.icon}</div>
      <h2>${g.title}</h2>
      <p>${g.subtitle}</p>
    </a>
  `).join('');
}

categoryFilter.addEventListener('change', renderGames);
sortSelect.addEventListener('change', renderGames);
renderGames();
