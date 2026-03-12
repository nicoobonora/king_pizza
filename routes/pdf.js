const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const path = require('path');
const db = require('../db/database');

const FONTS_DIR = path.join(__dirname, '..', 'fonts');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');

// Colors matching site style
const YELLOW = '#f2df0d';
const DARK = '#0f172a';
const TEXT = '#1e293b';
const TEXT_LIGHT = '#64748b';
const WHITE = '#ffffff';
const BG = '#f8f8f5';

// GET /api/menu/pdf - generate and download PDF
router.get('/pdf', (req, res) => {
  try {
    // Fetch data
    const pizzas = db.prepare('SELECT * FROM pizzas WHERE active = 1 ORDER BY sort_order, name').all();
    const settingsRows = db.prepare('SELECT * FROM settings').all();
    const settings = {};
    for (const row of settingsRows) {
      settings[row.key] = row.value;
    }

    const currency = settings.currency_symbol || '€';

    // All pizzas flat (excluding contorni and vegane)
    const menuPizzas = pizzas.filter(p => p.category !== 'contorni' && p.category !== 'vegane');
    const contorni = pizzas.filter(p => p.category === 'contorni');

    // Create PDF
    const doc = new PDFDocument({
      size: 'A4',
      margin: 0,
      info: {
        Title: 'King Pizza - Menu',
        Author: 'King Pizza',
        Subject: 'Menu della Pizzeria'
      }
    });

    // Register fonts
    try {
      doc.registerFont('SpaceGrotesk', path.join(FONTS_DIR, 'SpaceGrotesk-Regular.ttf'));
      doc.registerFont('SpaceGrotesk-Bold', path.join(FONTS_DIR, 'SpaceGrotesk-Bold.ttf'));
    } catch (e) {
      doc.registerFont('SpaceGrotesk', 'Helvetica');
      doc.registerFont('SpaceGrotesk-Bold', 'Helvetica-Bold');
    }

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="king-pizza-menu.pdf"');
    doc.pipe(res);

    const pageWidth = 595.28;
    const pageHeight = 841.89;

    // ==================== BACKGROUND ====================
    doc.rect(0, 0, pageWidth, pageHeight).fill(BG);

    // ==================== HEADER (compact) ====================
    const headerHeight = 70;
    doc.rect(0, 0, pageWidth, headerHeight).fill(YELLOW);
    doc.rect(0, headerHeight, pageWidth, 4).fill(DARK);

    // Title
    doc.font('SpaceGrotesk-Bold')
       .fontSize(32)
       .fillColor(DARK)
       .text('KING PIZZA', 0, 12, { width: pageWidth, align: 'center' });

    // Subtitle
    doc.font('SpaceGrotesk')
       .fontSize(10)
       .fillColor(TEXT)
       .text('LE NOSTRE PIZZE', 0, 48, { width: pageWidth, align: 'center' });

    // ==================== MENU CONTENT (3 columns) ====================
    const marginX = 30;
    const colGap = 18;
    const usableWidth = pageWidth - marginX * 2;
    const colWidth = (usableWidth - colGap * 2) / 3;
    const startY = headerHeight + 20;
    const itemHeight = 13;
    const fontSize = 8.5;
    const priceFontSize = 8.5;

    // Split all menu pizzas into 3 columns
    const itemsPerCol = Math.ceil(menuPizzas.length / 3);
    const col1Items = menuPizzas.slice(0, itemsPerCol);
    const col2Items = menuPizzas.slice(itemsPerCol, itemsPerCol * 2);
    const col3Items = menuPizzas.slice(itemsPerCol * 2);

    const columns = [
      { items: col1Items, x: marginX },
      { items: col2Items, x: marginX + colWidth + colGap },
      { items: col3Items, x: marginX + (colWidth + colGap) * 2 }
    ];

    let maxY = startY;

    for (const col of columns) {
      let y = startY;
      for (const pizza of col.items) {
        const name = pizza.gluten_free ? `${pizza.name.toUpperCase()} (SG)` : pizza.name.toUpperCase();
        const priceStr = `${currency}${pizza.price.toFixed(2)}`;
        const priceWidth = doc.font('SpaceGrotesk-Bold').fontSize(priceFontSize).widthOfString(priceStr);

        // Name
        doc.font('SpaceGrotesk-Bold').fontSize(fontSize).fillColor(TEXT)
           .text(name, col.x, y, { width: colWidth - priceWidth - 8, lineBreak: false });

        // Price aligned right
        doc.font('SpaceGrotesk-Bold').fontSize(priceFontSize).fillColor(TEXT)
           .text(priceStr, col.x + colWidth - priceWidth, y);

        // Dotted line
        const nameWidth = doc.font('SpaceGrotesk-Bold').fontSize(fontSize).widthOfString(name);
        const lineStartX = col.x + Math.min(nameWidth + 3, colWidth - priceWidth - 10);
        const lineEndX = col.x + colWidth - priceWidth - 3;
        if (lineEndX > lineStartX + 5) {
          doc.save()
             .strokeColor('#cbd5e1')
             .lineWidth(0.4)
             .dash(1.5, { space: 2 })
             .moveTo(lineStartX, y + 5)
             .lineTo(lineEndX, y + 5)
             .stroke()
             .undash()
             .restore();
        }

        // Description (small, italic-like)
        if (pizza.description) {
          y += 11;
          doc.font('SpaceGrotesk').fontSize(6).fillColor(TEXT_LIGHT)
             .text(pizza.description, col.x, y, { width: colWidth, lineBreak: false });
        }

        y += itemHeight;
      }
      if (y > maxY) maxY = y;
    }

    // ==================== CONTORNI / SUPPLEMENTI ====================
    let contorniY = maxY + 12;

    // Separator line
    doc.rect(marginX, contorniY, usableWidth, 2).fill(YELLOW);
    contorniY += 12;

    // Title
    doc.font('SpaceGrotesk-Bold').fontSize(11).fillColor(DARK)
       .text('SUPPLEMENTI & EXTRA', marginX, contorniY);
    contorniY += 18;

    // Contorni in 3 columns
    const contorniPerCol = Math.ceil(contorni.length / 3);
    const contorniCols = [
      { items: contorni.slice(0, contorniPerCol), x: marginX },
      { items: contorni.slice(contorniPerCol, contorniPerCol * 2), x: marginX + colWidth + colGap },
      { items: contorni.slice(contorniPerCol * 2), x: marginX + (colWidth + colGap) * 2 }
    ];

    let contorniMaxY = contorniY;
    for (const col of contorniCols) {
      let y = contorniY;
      for (const item of col.items) {
        const name = item.name.toUpperCase();
        const priceStr = `${currency}${item.price.toFixed(2)}`;
        const priceWidth = doc.font('SpaceGrotesk-Bold').fontSize(fontSize).widthOfString(priceStr);

        doc.font('SpaceGrotesk-Bold').fontSize(fontSize).fillColor(TEXT)
           .text(name, col.x, y, { width: colWidth - priceWidth - 8, lineBreak: false });

        doc.font('SpaceGrotesk-Bold').fontSize(priceFontSize).fillColor(TEXT)
           .text(priceStr, col.x + colWidth - priceWidth, y);

        // Dotted line
        const nameWidth = doc.font('SpaceGrotesk-Bold').fontSize(fontSize).widthOfString(name);
        const lineStartX = col.x + Math.min(nameWidth + 3, colWidth - priceWidth - 10);
        const lineEndX = col.x + colWidth - priceWidth - 3;
        if (lineEndX > lineStartX + 5) {
          doc.save()
             .strokeColor('#cbd5e1')
             .lineWidth(0.4)
             .dash(1.5, { space: 2 })
             .moveTo(lineStartX, y + 5)
             .lineTo(lineEndX, y + 5)
             .stroke()
             .undash()
             .restore();
        }

        y += itemHeight + 2;
      }
      if (y > contorniMaxY) contorniMaxY = y;
    }

    // ==================== FOOTER (minimal) ====================
    const footerY = pageHeight - 30;

    doc.font('SpaceGrotesk').fontSize(6.5).fillColor(TEXT_LIGHT)
       .text('(SG) = Senza Glutine / Gluten Free', 0, footerY, { width: pageWidth, align: 'center' });

    // Decorative pepperoni dots (subtle)
    const dots = [
      { x: 18, y: 120, r: 8 },
      { x: pageWidth - 18, y: 300, r: 6 },
      { x: 15, y: 600, r: 7 },
      { x: pageWidth - 20, y: 500, r: 5 },
    ];
    for (const dot of dots) {
      doc.circle(dot.x, dot.y, dot.r).fillOpacity(0.06).fill('#d9411e');
    }
    doc.fillOpacity(1);

    doc.end();
  } catch (err) {
    console.error('PDF generation error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Errore nella generazione del PDF' });
    }
  }
});

module.exports = router;
