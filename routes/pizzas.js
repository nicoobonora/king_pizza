const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { requireAuth } = require('../middleware/auth');

// GET /api/pizzas - list pizzas (add ?all=true for dashboard to include inactive)
router.get('/', (req, res) => {
  const { category, all } = req.query;
  let pizzas;
  const showAll = all === 'true';

  if (category) {
    pizzas = db.prepare(
      showAll
        ? 'SELECT * FROM pizzas WHERE category = ? ORDER BY sort_order, name'
        : 'SELECT * FROM pizzas WHERE active = 1 AND category = ? ORDER BY sort_order, name'
    ).all(category);
  } else {
    pizzas = db.prepare(
      showAll
        ? 'SELECT * FROM pizzas ORDER BY category, sort_order, name'
        : 'SELECT * FROM pizzas WHERE active = 1 ORDER BY category, sort_order, name'
    ).all();
  }

  // Parse tags JSON for each pizza
  pizzas = pizzas.map(p => ({
    ...p,
    tags: JSON.parse(p.tags || '[]')
  }));

  res.json({ pizzas });
});

// GET /api/pizzas/:id - single pizza
router.get('/:id', (req, res) => {
  const pizza = db.prepare('SELECT * FROM pizzas WHERE id = ?').get(req.params.id);
  if (!pizza) {
    return res.status(404).json({ error: 'Pizza non trovata' });
  }
  pizza.tags = JSON.parse(pizza.tags || '[]');
  res.json({ pizza });
});

// POST /api/pizzas - create pizza (auth required)
router.post('/', requireAuth, (req, res) => {
  const { name, description, price, category, image_url, tags, sort_order, gluten_free } = req.body;

  if (!name || !description || price === undefined || !category) {
    return res.status(400).json({ error: 'Nome, descrizione, prezzo e categoria richiesti' });
  }

  const validCategories = ['speciali', 'classiche', 'vegane', 'contorni'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: 'Categoria non valida' });
  }

  const result = db.prepare(`
    INSERT INTO pizzas (name, description, price, category, image_url, tags, sort_order, gluten_free)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    name,
    description,
    parseFloat(price),
    category,
    image_url || '',
    JSON.stringify(tags || []),
    sort_order || 0,
    gluten_free ? 1 : 0
  );

  const pizza = db.prepare('SELECT * FROM pizzas WHERE id = ?').get(result.lastInsertRowid);
  pizza.tags = JSON.parse(pizza.tags || '[]');

  res.status(201).json({ pizza });
});

// PUT /api/pizzas/:id - update pizza (auth required)
router.put('/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM pizzas WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Pizza non trovata' });
  }

  const { name, description, price, category, image_url, tags, sort_order, active, gluten_free } = req.body;

  const updatedName = name !== undefined ? name : existing.name;
  const updatedDesc = description !== undefined ? description : existing.description;
  const updatedPrice = price !== undefined ? parseFloat(price) : existing.price;
  const updatedCategory = category !== undefined ? category : existing.category;
  const updatedImageUrl = image_url !== undefined ? image_url : existing.image_url;
  const updatedTags = tags !== undefined ? JSON.stringify(tags) : existing.tags;
  const updatedSortOrder = sort_order !== undefined ? sort_order : existing.sort_order;
  const updatedActive = active !== undefined ? (active ? 1 : 0) : existing.active;
  const updatedGlutenFree = gluten_free !== undefined ? (gluten_free ? 1 : 0) : existing.gluten_free;

  db.prepare(`
    UPDATE pizzas SET
      name = ?, description = ?, price = ?, category = ?,
      image_url = ?, tags = ?, sort_order = ?, active = ?,
      gluten_free = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(
    updatedName, updatedDesc, updatedPrice, updatedCategory,
    updatedImageUrl, updatedTags, updatedSortOrder, updatedActive,
    updatedGlutenFree, req.params.id
  );

  const pizza = db.prepare('SELECT * FROM pizzas WHERE id = ?').get(req.params.id);
  pizza.tags = JSON.parse(pizza.tags || '[]');

  res.json({ pizza });
});

// DELETE /api/pizzas/:id - delete pizza (auth required)
router.delete('/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM pizzas WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Pizza non trovata' });
  }

  db.prepare('DELETE FROM pizzas WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Pizza eliminata' });
});

module.exports = router;
