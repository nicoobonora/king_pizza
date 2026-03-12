const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/pizzas', require('./routes/pizzas'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/menu', require('./routes/pdf'));

// Fallback to index.html for non-API routes
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  🍕 King Pizza server running on http://localhost:${PORT}\n`);
  console.log(`  Pages:`);
  console.log(`    Home:      http://localhost:${PORT}/`);
  console.log(`    Menu:      http://localhost:${PORT}/menu.html`);
  console.log(`    Menu PDF:  http://localhost:${PORT}/menu-pdf.html`);
  console.log(`    Login:     http://localhost:${PORT}/login.html`);
  console.log(`    Dashboard: http://localhost:${PORT}/dashboard.html`);
});
