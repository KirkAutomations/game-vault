// elements.js - Complete periodic table data for ElementQuest
const ELEMENT_CATEGORIES = {
    'alkali-metal':       { color: '#ff6666', label: 'Alkali Metal',       dmgType: 'fire' },
    'alkaline-earth':     { color: '#ffaa44', label: 'Alkaline Earth',     dmgType: 'earth' },
    'transition-metal':   { color: '#ffdd44', label: 'Transition Metal',   dmgType: 'physical' },
    'post-transition':    { color: '#88cc44', label: 'Post-Transition',    dmgType: 'physical' },
    'metalloid':          { color: '#44ccaa', label: 'Metalloid',          dmgType: 'lightning' },
    'nonmetal':           { color: '#44aaff', label: 'Reactive Nonmetal',  dmgType: 'ice' },
    'noble-gas':          { color: '#aa88ff', label: 'Noble Gas',          dmgType: 'arcane' },
    'lanthanide':         { color: '#ff88cc', label: 'Lanthanide',         dmgType: 'light' },
    'actinide':           { color: '#cc88ff', label: 'Actinide',           dmgType: 'dark' },
    'unknown':            { color: '#888888', label: 'Unknown',            dmgType: 'void' }
};

// Element rarity tiers based on period
function getRarity(period) {
    if (period <= 2) return 'common';
    if (period <= 3) return 'uncommon';
    if (period <= 4) return 'rare';
    if (period <= 5) return 'epic';
    return 'legendary';
}

const RARITY_COLORS = {
    common: '#aaa', uncommon: '#4f4', rare: '#44f', epic: '#a4f', legendary: '#fa4'
};

// All 118 elements: [number, symbol, name, atomicMass, category, period, group, electronegativity, funFact]
const ELEMENTS_RAW = [
    [1,'H','Hydrogen',1.008,'nonmetal',1,1,2.20,'Most abundant element in the universe'],
    [2,'He','Helium',4.003,'noble-gas',1,18,0,'Second lightest element, makes balloons float'],
    [3,'Li','Lithium',6.941,'alkali-metal',2,1,0.98,'Lightest metal, used in batteries'],
    [4,'Be','Beryllium',9.012,'alkaline-earth',2,2,1.57,'Very toxic but extremely lightweight'],
    [5,'B','Boron',10.81,'metalloid',2,13,2.04,'Harder than steel in some compounds'],
    [6,'C','Carbon',12.01,'nonmetal',2,14,2.55,'Basis of all known life'],
    [7,'N','Nitrogen',14.01,'nonmetal',2,15,3.04,'Makes up 78% of air'],
    [8,'O','Oxygen',16.00,'nonmetal',2,16,3.44,'Most abundant element in Earth crust'],
    [9,'F','Fluorine',19.00,'nonmetal',2,17,3.98,'Most reactive of all elements'],
    [10,'Ne','Neon',20.18,'noble-gas',2,18,0,'Gives a red-orange glow in signs'],
    [11,'Na','Sodium',22.99,'alkali-metal',3,1,0.93,'Explodes in water'],
    [12,'Mg','Magnesium',24.31,'alkaline-earth',3,2,1.31,'Burns with brilliant white light'],
    [13,'Al','Aluminium',26.98,'post-transition',3,13,1.61,'Most abundant metal in Earth crust'],
    [14,'Si','Silicon',28.09,'metalloid',3,14,1.90,'Essential for computer chips'],
    [15,'P','Phosphorus',30.97,'nonmetal',3,15,2.19,'Glows in the dark (white form)'],
    [16,'S','Sulfur',32.07,'nonmetal',3,16,2.58,'Smells like rotten eggs'],
    [17,'Cl','Chlorine',35.45,'nonmetal',3,17,3.16,'Used to purify drinking water'],
    [18,'Ar','Argon',39.95,'noble-gas',3,18,0,'Third most common gas in the air'],
    [19,'K','Potassium',39.10,'alkali-metal',4,1,0.82,'Essential for nerve function'],
    [20,'Ca','Calcium',40.08,'alkaline-earth',4,2,1.00,'Main component of bones and teeth'],
    [21,'Sc','Scandium',44.96,'transition-metal',4,3,1.36,'Used in aerospace alloys'],
    [22,'Ti','Titanium',47.87,'transition-metal',4,4,1.54,'Strong as steel, half the weight'],
    [23,'V','Vanadium',50.94,'transition-metal',4,5,1.63,'Makes steel stronger and lighter'],
    [24,'Cr','Chromium',52.00,'transition-metal',4,6,1.66,'Gives rubies their red color'],
    [25,'Mn','Manganese',54.94,'transition-metal',4,7,1.55,'Essential for steel production'],
    [26,'Fe','Iron',55.85,'transition-metal',4,8,1.83,'Most used metal in the world'],
    [27,'Co','Cobalt',58.93,'transition-metal',4,9,1.88,'Gives glass a deep blue color'],
    [28,'Ni','Nickel',58.69,'transition-metal',4,10,1.91,'Used in coins worldwide'],
    [29,'Cu','Copper',63.55,'transition-metal',4,11,1.90,'First metal used by humans'],
    [30,'Zn','Zinc',65.38,'transition-metal',4,12,1.65,'Essential for immune system'],
    [31,'Ga','Gallium',69.72,'post-transition',4,13,1.81,'Melts in your hand (29.8°C)'],
    [32,'Ge','Germanium',72.63,'metalloid',4,14,2.01,'Key to early transistors'],
    [33,'As','Arsenic',74.92,'metalloid',4,15,2.18,'Famous historical poison'],
    [34,'Se','Selenium',78.97,'nonmetal',4,16,2.55,'Essential nutrient in tiny amounts'],
    [35,'Br','Bromine',79.90,'nonmetal',4,17,2.96,'One of two liquid elements at room temp'],
    [36,'Kr','Krypton',83.80,'noble-gas',4,18,3.00,'Superman\'s home planet named after it'],
    [37,'Rb','Rubidium',85.47,'alkali-metal',5,1,0.82,'Used in atomic clocks'],
    [38,'Sr','Strontium',87.62,'alkaline-earth',5,2,0.95,'Makes fireworks red'],
    [39,'Y','Yttrium',88.91,'transition-metal',5,3,1.22,'Used in LED and TV screens'],
    [40,'Zr','Zirconium',91.22,'transition-metal',5,4,1.33,'Used in nuclear reactors'],
    [41,'Nb','Niobium',92.91,'transition-metal',5,5,1.60,'Superconductor at low temperatures'],
    [42,'Mo','Molybdenum',95.95,'transition-metal',5,6,2.16,'Highest melting point of common metals'],
    [43,'Tc','Technetium',98.00,'transition-metal',5,7,1.90,'First artificially made element'],
    [44,'Ru','Ruthenium',101.1,'transition-metal',5,8,2.20,'Hardens platinum alloys'],
    [45,'Rh','Rhodium',102.9,'transition-metal',5,9,2.28,'Most expensive precious metal'],
    [46,'Pd','Palladium',106.4,'transition-metal',5,10,2.20,'Absorbs 900x its volume in hydrogen'],
    [47,'Ag','Silver',107.9,'transition-metal',5,11,1.93,'Best conductor of electricity'],
    [48,'Cd','Cadmium',112.4,'transition-metal',5,12,1.69,'Used in rechargeable batteries'],
    [49,'In','Indium',114.8,'post-transition',5,13,1.78,'Makes a crying sound when bent'],
    [50,'Sn','Tin',118.7,'post-transition',5,14,1.96,'Known since ancient times'],
    [51,'Sb','Antimony',121.8,'metalloid',5,15,2.05,'Used in flame retardants'],
    [52,'Te','Tellurium',127.6,'metalloid',5,16,2.10,'Rarest stable solid element'],
    [53,'I','Iodine',126.9,'nonmetal',5,17,2.66,'Essential for thyroid function'],
    [54,'Xe','Xenon',131.3,'noble-gas',5,18,2.60,'Used in spacecraft propulsion'],
    [55,'Cs','Caesium',132.9,'alkali-metal',6,1,0.79,'Most electropositive stable element'],
    [56,'Ba','Barium',137.3,'alkaline-earth',6,2,0.89,'Used in medical imaging drinks'],
    [57,'La','Lanthanum',138.9,'lanthanide',6,0,1.10,'Used in camera and telescope lenses'],
    [58,'Ce','Cerium',140.1,'lanthanide',6,0,1.12,'Most abundant rare earth element'],
    [59,'Pr','Praseodymium',140.9,'lanthanide',6,0,1.13,'Makes glass green'],
    [60,'Nd','Neodymium',144.2,'lanthanide',6,0,1.14,'Makes the strongest permanent magnets'],
    [61,'Pm','Promethium',145.0,'lanthanide',6,0,1.13,'Only radioactive rare earth'],
    [62,'Sm','Samarium',150.4,'lanthanide',6,0,1.17,'Used in cancer treatment'],
    [63,'Eu','Europium',152.0,'lanthanide',6,0,1.20,'Makes red color in TV screens'],
    [64,'Gd','Gadolinium',157.3,'lanthanide',6,0,1.20,'Used in MRI contrast agents'],
    [65,'Tb','Terbium',158.9,'lanthanide',6,0,1.10,'Makes green in fluorescent lamps'],
    [66,'Dy','Dysprosium',162.5,'lanthanide',6,0,1.22,'Never been isolated in pure form easily'],
    [67,'Ho','Holmium',164.9,'lanthanide',6,0,1.23,'Strongest magnetic moment of any element'],
    [68,'Er','Erbium',167.3,'lanthanide',6,0,1.24,'Makes fiber optic cables work'],
    [69,'Tm','Thulium',168.9,'lanthanide',6,0,1.25,'Rarest naturally occurring lanthanide'],
    [70,'Yb','Ytterbium',173.0,'lanthanide',6,0,1.10,'Used in the most precise atomic clocks'],
    [71,'Lu','Lutetium',175.0,'lanthanide',6,0,1.27,'Densest and hardest lanthanide'],
    [72,'Hf','Hafnium',178.5,'transition-metal',6,4,1.30,'Used in nuclear control rods'],
    [73,'Ta','Tantalum',180.9,'transition-metal',6,5,1.50,'Very resistant to corrosion'],
    [74,'W','Tungsten',183.8,'transition-metal',6,6,2.36,'Highest melting point of all elements'],
    [75,'Re','Rhenium',186.2,'transition-metal',6,7,1.90,'Second highest melting point'],
    [76,'Os','Osmium',190.2,'transition-metal',6,8,2.20,'Densest naturally occurring element'],
    [77,'Ir','Iridium',192.2,'transition-metal',6,9,2.20,'Most corrosion-resistant metal'],
    [78,'Pt','Platinum',195.1,'transition-metal',6,10,2.28,'Rarer than gold'],
    [79,'Au','Gold',197.0,'transition-metal',6,11,2.54,'Only naturally yellow metal'],
    [80,'Hg','Mercury',200.6,'transition-metal',6,12,2.00,'Only metal liquid at room temperature'],
    [81,'Tl','Thallium',204.4,'post-transition',6,13,1.62,'Extremely toxic, once used as poison'],
    [82,'Pb','Lead',207.2,'post-transition',6,14,2.33,'Used in radiation shielding'],
    [83,'Bi','Bismuth',209.0,'post-transition',6,15,2.02,'Makes rainbow-colored crystals'],
    [84,'Po','Polonium',209.0,'post-transition',6,16,2.00,'Discovered by Marie Curie'],
    [85,'At','Astatine',210.0,'nonmetal',6,17,2.20,'Rarest naturally occurring element'],
    [86,'Rn','Radon',222.0,'noble-gas',6,18,0,'Radioactive gas found in basements'],
    [87,'Fr','Francium',223.0,'alkali-metal',7,1,0.70,'Most unstable naturally occurring element'],
    [88,'Ra','Radium',226.0,'alkaline-earth',7,2,0.90,'Glows blue-green in the dark'],
    [89,'Ac','Actinium',227.0,'actinide',7,0,1.10,'Glows blue in the dark'],
    [90,'Th','Thorium',232.0,'actinide',7,0,1.30,'Potential nuclear fuel of the future'],
    [91,'Pa','Protactinium',231.0,'actinide',7,0,1.50,'One of the rarest elements'],
    [92,'U','Uranium',238.0,'actinide',7,0,1.38,'Powers nuclear reactors'],
    [93,'Np','Neptunium',237.0,'actinide',7,0,1.36,'First transuranium element made'],
    [94,'Pu','Plutonium',244.0,'actinide',7,0,1.28,'Used in space probe batteries'],
    [95,'Am','Americium',243.0,'actinide',7,0,1.30,'In every smoke detector'],
    [96,'Cm','Curium',247.0,'actinide',7,0,1.30,'Named after Marie and Pierre Curie'],
    [97,'Bk','Berkelium',247.0,'actinide',7,0,1.30,'Named after Berkeley, California'],
    [98,'Cf','Californium',251.0,'actinide',7,0,1.30,'Used to start nuclear reactors'],
    [99,'Es','Einsteinium',252.0,'actinide',7,0,1.30,'Discovered in nuclear fallout'],
    [100,'Fm','Fermium',257.0,'actinide',7,0,1.30,'Named after Enrico Fermi'],
    [101,'Md','Mendelevium',258.0,'actinide',7,0,1.30,'Named after Dmitri Mendeleev'],
    [102,'No','Nobelium',259.0,'actinide',7,0,1.30,'Named after Alfred Nobel'],
    [103,'Lr','Lawrencium',266.0,'actinide',7,0,1.30,'Last of the actinides'],
    [104,'Rf','Rutherfordium',267.0,'transition-metal',7,4,0,'Named after Ernest Rutherford'],
    [105,'Db','Dubnium',268.0,'transition-metal',7,5,0,'Named after Dubna, Russia'],
    [106,'Sg','Seaborgium',269.0,'transition-metal',7,6,0,'Named after Glenn Seaborg'],
    [107,'Bh','Bohrium',270.0,'transition-metal',7,7,0,'Named after Niels Bohr'],
    [108,'Hs','Hassium',277.0,'transition-metal',7,8,0,'Named after Hesse, Germany'],
    [109,'Mt','Meitnerium',278.0,'unknown',7,9,0,'Named after Lise Meitner'],
    [110,'Ds','Darmstadtium',281.0,'unknown',7,10,0,'Named after Darmstadt, Germany'],
    [111,'Rg','Roentgenium',282.0,'unknown',7,11,0,'Named after Wilhelm Röntgen'],
    [112,'Cn','Copernicium',285.0,'unknown',7,12,0,'Named after Nicolaus Copernicus'],
    [113,'Nh','Nihonium',286.0,'unknown',7,13,0,'Named after Japan (Nihon)'],
    [114,'Fl','Flerovium',289.0,'unknown',7,14,0,'Named after Flerov Lab'],
    [115,'Mc','Moscovium',290.0,'unknown',7,15,0,'Named after Moscow Oblast'],
    [116,'Lv','Livermorium',293.0,'unknown',7,16,0,'Named after Livermore, California'],
    [117,'Ts','Tennessine',294.0,'unknown',7,17,0,'Named after Tennessee'],
    [118,'Og','Oganesson',294.0,'unknown',7,18,0,'Heaviest known element'],
];

// Build element objects
const ELEMENTS = {};
const ELEMENTS_BY_NUMBER = [];

ELEMENTS_RAW.forEach(e => {
    const [number, symbol, name, mass, category, period, group, electronegativity, fact] = e;
    const el = {
        number, symbol, name, mass, category, period, group, electronegativity, fact,
        rarity: getRarity(period),
        color: ELEMENT_CATEGORIES[category].color,
        dmgType: ELEMENT_CATEGORIES[category].dmgType,
        // Game stats derived from real properties
        power: Math.floor(number * 1.5 + mass * 0.1),
        defense: Math.floor(electronegativity * 15 + period * 5),
        speed: Math.max(1, Math.floor(120 - number)),
        hp: Math.floor(mass * 2 + period * 20),
    };
    ELEMENTS[symbol] = el;
    ELEMENTS_BY_NUMBER[number] = el;
});

// Element combination recipes (compounds) for crafting
const COMPOUNDS = [
    { name: 'Water', formula: 'H2O', elements: ['H','H','O'], bonus: 'heal', power: 30, desc: 'Restores HP' },
    { name: 'Salt', formula: 'NaCl', elements: ['Na','Cl'], bonus: 'defense', power: 20, desc: '+20 Defense' },
    { name: 'Rust', formula: 'Fe2O3', elements: ['Fe','Fe','O','O','O'], bonus: 'damage', power: 40, desc: 'Corroding attack' },
    { name: 'Diamond', formula: 'C(diamond)', elements: ['C','C','C','C'], bonus: 'armor', power: 100, desc: 'Ultimate armor' },
    { name: 'Ammonia', formula: 'NH3', elements: ['N','H','H','H'], bonus: 'poison', power: 35, desc: 'Poisons enemy' },
    { name: 'Carbon Dioxide', formula: 'CO2', elements: ['C','O','O'], bonus: 'suffocate', power: 25, desc: 'Reduces enemy speed' },
    { name: 'Methane', formula: 'CH4', elements: ['C','H','H','H','H'], bonus: 'fire', power: 50, desc: 'Explosive fire attack' },
    { name: 'Sulfuric Acid', formula: 'H2SO4', elements: ['H','H','S','O','O','O','O'], bonus: 'melt', power: 80, desc: 'Dissolves armor' },
    { name: 'Calcium Carbonate', formula: 'CaCO3', elements: ['Ca','C','O','O','O'], bonus: 'shield', power: 45, desc: 'Stone shield' },
    { name: 'Steel', formula: 'FeC', elements: ['Fe','C'], bonus: 'weapon', power: 60, desc: 'Strong weapon' },
    { name: 'Bronze', formula: 'CuSn', elements: ['Cu','Sn'], bonus: 'weapon', power: 40, desc: 'Classic weapon alloy' },
    { name: 'Gunpowder', formula: 'KNO3+S+C', elements: ['K','N','O','O','O','S','C'], bonus: 'explode', power: 90, desc: 'Massive AoE damage' },
    { name: 'Baking Soda', formula: 'NaHCO3', elements: ['Na','H','C','O','O','O'], bonus: 'cleanse', power: 30, desc: 'Removes debuffs' },
    { name: 'Table Sugar', formula: 'C12H22O11', elements: ['C','H','O'], bonus: 'energy', power: 20, desc: 'Speed boost' },
    { name: 'Gold Alloy', formula: 'AuAg', elements: ['Au','Ag'], bonus: 'wealth', power: 75, desc: '2x gold drops' },
];

// Damage type effectiveness chart (attacker -> defender)
const TYPE_CHART = {
    fire:      { ice: 2.0, earth: 0.5, fire: 0.5, physical: 1, lightning: 1, arcane: 1, light: 1, dark: 1, void: 1 },
    ice:       { fire: 0.5, earth: 1, ice: 0.5, physical: 1, lightning: 1, arcane: 1, light: 1, dark: 2.0, void: 1 },
    earth:     { fire: 1, ice: 1, earth: 0.5, physical: 1, lightning: 2.0, arcane: 0.5, light: 1, dark: 1, void: 1 },
    physical:  { fire: 1, ice: 1, earth: 1, physical: 1, lightning: 0.5, arcane: 0.5, light: 1, dark: 1, void: 0.5 },
    lightning: { fire: 1, ice: 2.0, earth: 0.5, physical: 1, lightning: 0.5, arcane: 1, light: 1, dark: 1, void: 1 },
    arcane:    { fire: 1, ice: 1, earth: 2.0, physical: 1, lightning: 1, arcane: 0.5, light: 0.5, dark: 2.0, void: 1 },
    light:     { fire: 1, ice: 1, earth: 1, physical: 1, lightning: 1, arcane: 1, light: 0.5, dark: 2.0, void: 2.0 },
    dark:      { fire: 1, ice: 1, earth: 1, physical: 1, lightning: 1, arcane: 0.5, light: 0.5, dark: 0.5, void: 2.0 },
    void:      { fire: 1, ice: 1, earth: 1, physical: 2.0, lightning: 1, arcane: 1, light: 0.5, dark: 0.5, void: 1 },
};
