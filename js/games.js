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
