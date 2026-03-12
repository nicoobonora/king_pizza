const db = require('./database');
const bcrypt = require('bcryptjs');

console.log('Seeding King Pizza database...');

// Clear existing data
db.exec('DELETE FROM pizzas; DELETE FROM staff; DELETE FROM settings;');

// Reset autoincrement
db.exec("DELETE FROM sqlite_sequence WHERE name='pizzas'");
db.exec("DELETE FROM sqlite_sequence WHERE name='staff'");

// ==================== STAFF ====================
const passwordHash = bcrypt.hashSync('pizza123', 10);
db.prepare('INSERT INTO staff (username, password_hash) VALUES (?, ?)').run('steve', passwordHash);
console.log('  Staff user created: steve / pizza123');

// ==================== PIZZAS ====================
const insertPizza = db.prepare(`
  INSERT INTO pizzas (name, description, price, category, image_url, tags, sort_order, gluten_free)
  VALUES (@name, @description, @price, @category, @image_url, @tags, @sort_order, @gluten_free)
`);

const t = (tags) => JSON.stringify(tags);

const pizzas = [
  // =====================================================
  // === SPECIALI (8) — Le pizze premium della casa ===
  // =====================================================
  {
    name: 'King Pizza',
    description: '\u00BC radicchio, gorgonzola, \u00BC salsiccia, funghi trifolati, \u00BC cipolla, wurstel, \u00BC funghi freschi e grana.',
    price: 12.00,
    category: 'speciali',
    image_url: '',
    tags: t([
      { icon: 'egg', color: 'text-yellow-500', label: 'Formaggi' },
      { icon: 'nutrition', color: 'text-amber-700', label: 'Funghi' }
    ]),
    sort_order: 1,
    gluten_free: 0
  },
  {
    name: 'Mitica',
    description: 'Margherita, tomino, salsiccia, funghi freschi, bresaola.',
    price: 11.00,
    category: 'speciali',
    image_url: '',
    tags: t([
      { icon: 'nutrition', color: 'text-amber-700', label: 'Funghi' },
      { icon: 'restaurant', color: 'text-orange-400', label: 'Salame' }
    ]),
    sort_order: 2,
    gluten_free: 0
  },
  {
    name: 'Regina',
    description: 'Margherita, funghi, olio tartufo, prosciutto crudo, grana.',
    price: 10.50,
    category: 'speciali',
    image_url: '',
    tags: t([
      { icon: 'diamond', color: 'text-amber-900', label: 'Tartufo' },
      { icon: 'restaurant', color: 'text-rose-700', label: 'Prosciutto' }
    ]),
    sort_order: 3,
    gluten_free: 0
  },
  {
    name: 'Carpaccio',
    description: 'Mozzarella, funghi freschi, bresaola, rucola e grana.',
    price: 10.00,
    category: 'speciali',
    image_url: '',
    tags: t([
      { icon: 'restaurant', color: 'text-rose-700', label: 'Prosciutto' }
    ]),
    sort_order: 4,
    gluten_free: 0
  },
  {
    name: 'Monte Rosso',
    description: 'Met\u00E0 calzone con prosciutto cotto, mozzarella e funghi, met\u00E0 con salame piccante, cipolla e grana.',
    price: 10.00,
    category: 'speciali',
    image_url: '',
    tags: t([
      { icon: 'local_fire_department', color: 'text-orange-400', label: 'Piccante' },
      { icon: 'nutrition', color: 'text-amber-700', label: 'Funghi' }
    ]),
    sort_order: 5,
    gluten_free: 0
  },
  {
    name: 'Gustosa',
    description: 'Margherita, tomino, pancetta, uovo, noci.',
    price: 10.00,
    category: 'speciali',
    image_url: '',
    tags: t([
      { icon: 'egg', color: 'text-yellow-500', label: 'Formaggi' }
    ]),
    sort_order: 6,
    gluten_free: 0
  },
  {
    name: 'Profumosa',
    description: 'Margherita, gorgonzola, noci, bresaola, olio tartufato.',
    price: 9.00,
    category: 'speciali',
    image_url: '',
    tags: t([
      { icon: 'diamond', color: 'text-amber-900', label: 'Tartufo' }
    ]),
    sort_order: 7,
    gluten_free: 0
  },
  {
    name: 'Sfiziosa',
    description: 'Mozzarella, radicchio, prosciutto crudo, rucola, grana, aceto balsamico.',
    price: 9.00,
    category: 'speciali',
    image_url: '',
    tags: t([
      { icon: 'restaurant', color: 'text-rose-700', label: 'Prosciutto' }
    ]),
    sort_order: 8,
    gluten_free: 0
  },

  // =====================================================
  // === CLASSICHE (30) — I grandi classici ===
  // =====================================================
  {
    name: 'Margherita',
    description: 'Pomodoro e mozzarella.',
    price: 6.00,
    category: 'classiche',
    image_url: '',
    tags: t([
      { icon: 'potted_plant', color: 'text-red-500', label: 'Pomodoro' }
    ]),
    sort_order: 1,
    gluten_free: 0
  },
  {
    name: 'Napoli',
    description: 'Pomodoro, mozzarella, acciughe, origano.',
    price: 7.00,
    category: 'classiche',
    image_url: '',
    tags: t([
      { icon: 'set_meal', color: 'text-blue-500', label: 'Pesce' }
    ]),
    sort_order: 2,
    gluten_free: 0
  },
  {
    name: 'Porcini',
    description: 'Margherita e funghi porcini.',
    price: 7.00,
    category: 'classiche',
    image_url: '',
    tags: t([
      { icon: 'nutrition', color: 'text-amber-700', label: 'Funghi' }
    ]),
    sort_order: 3,
    gluten_free: 0
  },
  {
    name: 'Saporita',
    description: 'Margherita, spinaci, robiola, salame piccante.',
    price: 7.00,
    category: 'classiche',
    image_url: '',
    tags: t([
      { icon: 'local_fire_department', color: 'text-orange-400', label: 'Piccante' }
    ]),
    sort_order: 4,
    gluten_free: 0
  },
  {
    name: 'Saracena',
    description: 'Pomodoro, bufala, pomodorini, olive nere.',
    price: 7.50,
    category: 'classiche',
    image_url: '',
    tags: t([
      { icon: 'potted_plant', color: 'text-red-500', label: 'Pomodoro' }
    ]),
    sort_order: 5,
    gluten_free: 0
  },
  {
    name: 'Bufala',
    description: 'Margherita e bufala.',
    price: 8.00,
    category: 'classiche',
    image_url: '',
    tags: t([
      { icon: 'egg', color: 'text-yellow-500', label: 'Formaggi' }
    ]),
    sort_order: 6,
    gluten_free: 0
  },
  {
    name: 'Diavola',
    description: 'Margherita, salame piccante, peperoni.',
    price: 8.00,
    category: 'classiche',
    image_url: '',
    tags: t([
      { icon: 'local_fire_department', color: 'text-orange-400', label: 'Piccante' },
      { icon: 'restaurant', color: 'text-orange-400', label: 'Salame' }
    ]),
    sort_order: 7,
    gluten_free: 0
  },
  {
    name: 'Capricciosa',
    description: 'Margherita, prosciutto cotto, funghi, carciofi, olive.',
    price: 8.00,
    category: 'classiche',
    image_url: '',
    tags: t([
      { icon: 'nutrition', color: 'text-amber-700', label: 'Funghi' }
    ]),
    sort_order: 8,
    gluten_free: 0
  },
  {
    name: 'Calzone',
    description: 'Pomodoro, mozzarella, prosciutto cotto, funghi.',
    price: 8.00,
    category: 'classiche',
    image_url: '',
    tags: t([
      { icon: 'nutrition', color: 'text-amber-700', label: 'Funghi' }
    ]),
    sort_order: 9,
    gluten_free: 0
  },
  {
    name: 'Calzone Dolce',
    description: 'Nutella, mascarpone, zucchero a velo.',
    price: 8.00,
    category: 'classiche',
    image_url: '',
    tags: t([
      { icon: 'cake', color: 'text-pink-400', label: 'Dolce' }
    ]),
    sort_order: 10,
    gluten_free: 0
  },
  {
    name: 'Romana',
    description: 'Margherita, acciughe, capperi, origano.',
    price: 8.00,
    category: 'classiche',
    image_url: '',
    tags: t([
      { icon: 'set_meal', color: 'text-blue-500', label: 'Pesce' }
    ]),
    sort_order: 11,
    gluten_free: 0
  },
  {
    name: 'Carbonara',
    description: 'Mozzarella con pancetta, uovo e grana.',
    price: 8.00,
    category: 'classiche',
    image_url: '',
    tags: t([
      { icon: 'egg', color: 'text-yellow-500', label: 'Formaggi' }
    ]),
    sort_order: 12,
    gluten_free: 0
  },
  {
    name: 'Carettiera',
    description: 'Margherita, tonno e cipolla.',
    price: 8.00,
    category: 'classiche',
    image_url: '',
    tags: t([
      { icon: 'set_meal', color: 'text-blue-500', label: 'Pesce' }
    ]),
    sort_order: 13,
    gluten_free: 0
  },
  {
    name: 'Braccio di Ferro',
    description: 'Margherita, spinaci, salsiccia, parmigiano.',
    price: 8.00,
    category: 'classiche',
    image_url: '',
    tags: t([
      { icon: 'grass', color: 'text-green-500', label: 'Verdure' }
    ]),
    sort_order: 14,
    gluten_free: 0
  },
  {
    name: 'Bavarese',
    description: 'Margherita, wurstel, patate fritte.',
    price: 8.50,
    category: 'classiche',
    image_url: '',
    tags: t([]),
    sort_order: 15,
    gluten_free: 0
  },
  {
    name: '4 Stagioni',
    description: 'Margherita, prosciutto cotto, funghi, salsiccia e carciofini.',
    price: 8.50,
    category: 'classiche',
    image_url: '',
    tags: t([
      { icon: 'nutrition', color: 'text-amber-700', label: 'Funghi' }
    ]),
    sort_order: 16,
    gluten_free: 0
  },
  {
    name: '4 Formaggi',
    description: 'Margherita, fontina, gorgonzola, provola.',
    price: 8.50,
    category: 'classiche',
    image_url: '',
    tags: t([
      { icon: 'egg', color: 'text-yellow-500', label: 'Formaggi' }
    ]),
    sort_order: 17,
    gluten_free: 0
  },
  {
    name: 'Funghi Misti',
    description: 'Margherita, porcini, freschi, trifolati.',
    price: 8.50,
    category: 'classiche',
    image_url: '',
    tags: t([
      { icon: 'nutrition', color: 'text-amber-700', label: 'Funghi' }
    ]),
    sort_order: 18,
    gluten_free: 0
  },
  {
    name: 'Prosciutto di Parma',
    description: 'Margherita e prosciutto crudo.',
    price: 8.50,
    category: 'classiche',
    image_url: '',
    tags: t([
      { icon: 'restaurant', color: 'text-rose-700', label: 'Prosciutto' }
    ]),
    sort_order: 19,
    gluten_free: 0
  },
  {
    name: 'Modena',
    description: 'Mozzarella, pancetta, grana e aceto balsamico.',
    price: 8.50,
    category: 'classiche',
    image_url: '',
    tags: t([]),
    sort_order: 20,
    gluten_free: 0
  },
  {
    name: 'Biancaneve',
    description: 'Mozzarella, mascarpone, prosciutto crudo.',
    price: 9.00,
    category: 'classiche',
    image_url: '',
    tags: t([
      { icon: 'restaurant', color: 'text-rose-700', label: 'Prosciutto' }
    ]),
    sort_order: 21,
    gluten_free: 0
  },
  {
    name: 'Disney',
    description: 'Mozzarella, mascarpone, grana e prosciutto cotto.',
    price: 9.00,
    category: 'classiche',
    image_url: '',
    tags: t([
      { icon: 'egg', color: 'text-yellow-500', label: 'Formaggi' }
    ]),
    sort_order: 22,
    gluten_free: 0
  },
  {
    name: 'Norma',
    description: 'Margherita, melanzane, pomodorini, grana.',
    price: 9.00,
    category: 'classiche',
    image_url: '',
    tags: t([
      { icon: 'grass', color: 'text-green-500', label: 'Verdure' }
    ]),
    sort_order: 23,
    gluten_free: 0
  },
  {
    name: 'Parmigiana',
    description: 'Margherita, melanzane, prosciutto cotto, parmigiano.',
    price: 9.00,
    category: 'classiche',
    image_url: '',
    tags: t([
      { icon: 'grass', color: 'text-green-500', label: 'Verdure' }
    ]),
    sort_order: 24,
    gluten_free: 0
  },
  {
    name: 'Salsiccia e Friarielli',
    description: 'Mozzarella, salsiccia, cime di rapa, parmigiano.',
    price: 9.00,
    category: 'classiche',
    image_url: '',
    tags: t([
      { icon: 'restaurant', color: 'text-orange-400', label: 'Salame' },
      { icon: 'grass', color: 'text-green-500', label: 'Verdure' }
    ]),
    sort_order: 25,
    gluten_free: 0
  },
  {
    name: 'Delicata',
    description: 'Margherita con funghi, prosciutto cotto, pomodorini e grana.',
    price: 9.50,
    category: 'classiche',
    image_url: '',
    tags: t([
      { icon: 'nutrition', color: 'text-amber-700', label: 'Funghi' }
    ]),
    sort_order: 27,
    gluten_free: 0
  },
  {
    name: 'Alpina',
    description: 'Margherita, tomino, speck, rucola.',
    price: 10.00,
    category: 'classiche',
    image_url: '',
    tags: t([
      { icon: 'restaurant', color: 'text-rose-700', label: 'Prosciutto' }
    ]),
    sort_order: 28,
    gluten_free: 0
  },
  {
    name: 'Contadina',
    description: 'Margherita, funghi trifolati, salsiccia, cipolla, grana.',
    price: 10.00,
    category: 'classiche',
    image_url: '',
    tags: t([
      { icon: 'nutrition', color: 'text-amber-700', label: 'Funghi' },
      { icon: 'restaurant', color: 'text-orange-400', label: 'Salame' }
    ]),
    sort_order: 29,
    gluten_free: 0
  },
  {
    name: 'Gamberosa',
    description: 'Margherita, gamberi, zucchine, robiola.',
    price: 10.00,
    category: 'classiche',
    image_url: '',
    tags: t([
      { icon: 'set_meal', color: 'text-blue-500', label: 'Pesce' }
    ]),
    sort_order: 30,
    gluten_free: 0
  },
  {
    name: 'Porcona',
    description: 'Margherita, salsiccia, salame piccante, wurstel e pancetta.',
    price: 10.00,
    category: 'classiche',
    image_url: '',
    tags: t([
      { icon: 'local_fire_department', color: 'text-orange-400', label: 'Piccante' },
      { icon: 'restaurant', color: 'text-orange-400', label: 'Salame' }
    ]),
    sort_order: 31,
    gluten_free: 0
  },

  // =====================================================
  // === VEGANE / VEGETARIANE (2) ===
  // =====================================================
  {
    name: 'Marinara',
    description: 'Rossa, olio aglio e origano.',
    price: 4.00,
    category: 'vegane',
    image_url: '',
    tags: t([
      { icon: 'eco', color: 'text-green-600', label: 'Vegano' },
      { icon: 'potted_plant', color: 'text-red-500', label: 'Pomodoro' }
    ]),
    sort_order: 1,
    gluten_free: 0
  },
  {
    name: 'Verdure',
    description: 'Margherita, verdure.',
    price: 6.00,
    category: 'vegane',
    image_url: '',
    tags: t([
      { icon: 'grass', color: 'text-green-500', label: 'Verdure' }
    ]),
    sort_order: 2,
    gluten_free: 0
  },

  // =====================================================
  // === CONTORNI / EXTRA (8) ===
  // =====================================================
  {
    name: 'Pizza Tirata',
    description: 'Supplemento per pizza tirata.',
    price: 2.00,
    category: 'contorni',
    image_url: '',
    tags: t([]),
    sort_order: 1,
    gluten_free: 0
  },
  {
    name: 'Pizza Gigante',
    description: 'Doppio prezzo pi\u00F9 supplemento.',
    price: 2.00,
    category: 'contorni',
    image_url: '',
    tags: t([]),
    sort_order: 2,
    gluten_free: 0
  },
  {
    name: 'Aggiunta Salumi',
    description: 'Crudo, bresaola, speck.',
    price: 2.50,
    category: 'contorni',
    image_url: '',
    tags: t([]),
    sort_order: 3,
    gluten_free: 0
  },
  {
    name: 'Aggiunta Tomino',
    description: 'Tomino aggiuntivo sulla pizza.',
    price: 2.50,
    category: 'contorni',
    image_url: '',
    tags: t([]),
    sort_order: 4,
    gluten_free: 0
  },
  {
    name: 'Aggiunta Mozzarella',
    description: 'Mozzarella aggiuntiva.',
    price: 2.00,
    category: 'contorni',
    image_url: '',
    tags: t([]),
    sort_order: 5,
    gluten_free: 0
  },
  {
    name: 'Aggiunta Mozzarella di Bufala',
    description: 'Mozzarella di bufala aggiuntiva.',
    price: 2.50,
    category: 'contorni',
    image_url: '',
    tags: t([]),
    sort_order: 6,
    gluten_free: 0
  },
  {
    name: 'Aggiunta un Gusto',
    description: 'Un ingrediente aggiuntivo a scelta.',
    price: 1.00,
    category: 'contorni',
    image_url: '',
    tags: t([]),
    sort_order: 7,
    gluten_free: 0
  },
  {
    name: 'Aggiunta Gamberi',
    description: 'Gamberi aggiuntivi sulla pizza.',
    price: 2.50,
    category: 'contorni',
    image_url: '',
    tags: t([]),
    sort_order: 8,
    gluten_free: 0
  }
];

const insertMany = db.transaction((items) => {
  for (const item of items) {
    insertPizza.run(item);
  }
});
insertMany(pizzas);
console.log(`  ${pizzas.length} menu items seeded`);

// ==================== SETTINGS ====================
const insertSetting = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
const settings = [
  ['promo_text', 'Prendi 2 pizze, la terza la offre Steve!'],
  ['phone', '555-KING-PIZZA'],
  ['address', '123 Pizza Street, Crustville'],
  ['website', 'www.kingpizza.steve'],
  ['currency_symbol', '\u20AC'],
  ['build_your_own_base_price', '7.00'],
  ['build_your_own_topping_price', '1.00'],
  ['restaurant_name', 'King Pizza'],
];

const insertSettings = db.transaction((items) => {
  for (const [key, value] of items) {
    insertSetting.run(key, value);
  }
});
insertSettings(settings);
console.log(`  ${settings.length} settings seeded`);

console.log('Database seeded successfully!');
