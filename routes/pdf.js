const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const path = require('path');
const db = require('../db/database');

const FONTS_DIR = path.join(__dirname, '..', 'fonts');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');

// Colors
const YELLOW = '#f2df0d';
const DARK = '#0f172a';
const TEXT = '#1e293b';
const TEXT_LIGHT = '#64748b';
const WHITE = '#ffffff';

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

    // Group by category
    const speciali = pizzas.filter(p => p.category === 'speciali');
    const classiche = pizzas.filter(p => p.category === 'classiche');
    const vegane = pizzas.filter(p => p.category === 'vegane');
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
      // Fallback to built-in fonts if custom fonts fail
      doc.registerFont('SpaceGrotesk', 'Helvetica');
      doc.registerFont('SpaceGrotesk-Bold', 'Helvetica-Bold');
    }

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="king-pizza-menu.pdf"');
    doc.pipe(res);

    const pageWidth = 595.28;
    const pageHeight = 841.89;

    // ==================== HEADER ====================
    // Yellow background band
    doc.rect(0, 0, pageWidth, 170).fill(YELLOW);

    // Title
    doc.font('SpaceGrotesk-Bold')
       .fontSize(42)
       .fillColor(DARK)
       .text('KING PIZZA', 0, 40, { align: 'center', width: pageWidth });

    // Subtitle
    doc.font('SpaceGrotesk')
       .fontSize(12)
       .fillColor(TEXT)
       .text(settings.tagline || 'Castel Maggiore (BO)', 0, 90, { align: 'center', width: pageWidth });

    // Bottom border of header
    doc.rect(0, 170, pageWidth, 6).fill(DARK);

    // ==================== MENU CONTENT ====================
    let y = 195;
    const leftX = 40;
    const rightX = 310;
    const colWidth = 235;

    // LEFT COLUMN
    y = drawSection(doc, 'SPECIALITA DELLA CASA', 'star', speciali, leftX, y, colWidth, settings, true);
    y += 15;
    y = drawSection(doc, 'CONTORNI COOL', 'restaurant', contorni, leftX, y, colWidth, settings, false);

    // RIGHT COLUMN
    let rightY = 195;
    rightY = drawSection(doc, 'VIBRAZIONI CLASSICHE', 'local_pizza', [...classiche, ...vegane], rightX, rightY, colWidth, settings, true);
    rightY += 15;

    // "Componi la tua pizza" section
    rightY = drawBuildYourOwn(doc, rightX, rightY, colWidth, settings);

    // ==================== FOOTER ====================
    const footerY = Math.max(y, rightY) + 30;
    const footerHeight = 70;
    const actualFooterY = Math.max(footerY, pageHeight - footerHeight - 20);

    doc.rect(30, actualFooterY, pageWidth - 60, footerHeight).fill(DARK);

    doc.font('SpaceGrotesk-Bold').fontSize(10).fillColor(YELLOW)
       .text('ORDINA ORA', 50, actualFooterY + 12);
    doc.font('SpaceGrotesk-Bold').fontSize(14).fillColor(WHITE)
       .text(settings.phone || '555-KING-PIZZA', 50, actualFooterY + 28);

    doc.font('SpaceGrotesk').fontSize(8).fillColor(TEXT_LIGHT)
       .text(settings.address || '123 Pizza Street, Crustville', 50, actualFooterY + 50);

    doc.font('SpaceGrotesk').fontSize(8).fillColor(TEXT_LIGHT)
       .text(settings.website || 'www.kingpizza.steve', pageWidth - 200, actualFooterY + 50, { width: 150, align: 'right' });

    // Gluten-free legend
    doc.font('SpaceGrotesk').fontSize(7).fillColor(TEXT_LIGHT)
       .text('(SG) = Senza Glutine / Gluten Free', 0, actualFooterY + footerHeight + 8, { width: pageWidth, align: 'center' });

    // Decorative pepperoni dots
    drawPepperoniDots(doc, pageHeight);

    doc.end();
  } catch (err) {
    console.error('PDF generation error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Errore nella generazione del PDF' });
    }
  }
});

function drawSection(doc, title, icon, items, x, startY, width, settings, showDesc) {
  let y = startY;
  const currency = settings.currency_symbol || '€';

  // Section title with underline
  doc.font('SpaceGrotesk-Bold').fontSize(16).fillColor(TEXT)
     .text(title, x, y);
  y += 22;

  // Yellow underline
  doc.rect(x, y, 80, 3).fill(YELLOW);
  y += 15;

  // Items
  for (const item of items) {
    // Check if we need a new page
    if (y > 750) {
      doc.addPage();
      y = 40;
    }

    const displayName = item.gluten_free ? `${item.name.toUpperCase()} (SG)` : item.name.toUpperCase();
    const nameWidth = doc.font('SpaceGrotesk-Bold').fontSize(11).widthOfString(displayName);
    const priceStr = `${currency}${item.price.toFixed(2)}`;
    const priceWidth = doc.font('SpaceGrotesk-Bold').fontSize(11).widthOfString(priceStr);

    // Name (with SG = Senza Glutine indicator)
    doc.font('SpaceGrotesk-Bold').fontSize(11).fillColor(TEXT)
       .text(displayName, x, y, { width: width - priceWidth - 10, lineBreak: false });

    // Price
    doc.font('SpaceGrotesk-Bold').fontSize(11).fillColor(TEXT)
       .text(priceStr, x + width - priceWidth, y);

    // Dotted line between name and price
    const lineStartX = x + Math.min(nameWidth + 5, width - priceWidth - 15);
    const lineEndX = x + width - priceWidth - 5;
    if (lineEndX > lineStartX) {
      doc.save()
         .strokeColor('#cbd5e1')
         .lineWidth(0.5)
         .dash(2, { space: 3 })
         .moveTo(lineStartX, y + 7)
         .lineTo(lineEndX, y + 7)
         .stroke()
         .undash()
         .restore();
    }

    y += 16;

    // Description
    if (showDesc && item.description) {
      doc.font('SpaceGrotesk').fontSize(8).fillColor(TEXT_LIGHT)
         .text(item.description, x, y, { width: width, lineBreak: true });
      y += doc.heightOfString(item.description, { width: width, fontSize: 8 }) + 8;
    } else {
      y += 4;
    }
  }

  return y;
}

function drawBuildYourOwn(doc, x, y, width, settings) {
  const currency = settings.currency_symbol || '€';
  const basePrice = settings.build_your_own_base_price || '7.00';
  const toppingPrice = settings.build_your_own_topping_price || '1.00';

  // Background box
  doc.roundedRect(x - 5, y, width + 10, 80, 8)
     .fillOpacity(0.1).fill(YELLOW);
  doc.fillOpacity(1);

  // Border
  doc.roundedRect(x - 5, y, width + 10, 80, 8)
     .strokeColor(YELLOW).lineWidth(1.5).stroke();

  y += 12;
  doc.font('SpaceGrotesk-Bold').fontSize(14).fillColor(TEXT)
     .text('COMPONI LA TUA PIZZA', x + 5, y);
  y += 22;
  doc.font('SpaceGrotesk').fontSize(10).fillColor(TEXT)
     .text(`Pizza ad un gusto (semplice)`, x + 5, y);
  doc.font('SpaceGrotesk-Bold').fontSize(10).fillColor(TEXT)
     .text(`${currency}${basePrice}`, x + width - 50, y);
  y += 16;
  doc.font('SpaceGrotesk').fontSize(8).fillColor(TEXT_LIGHT)
     .text(`INGREDIENTI AGGIUNTIVI: ${currency}${toppingPrice} cad.`, x + 5, y);

  return y + 35;
}

function drawPepperoniDots(doc, pageHeight) {
  const dots = [
    { x: 30, y: 200, r: 15 },
    { x: pageHeight > 800 ? 550 : 500, y: 250, r: 12 },
    { x: 25, y: 600, r: 10 },
    { x: 560, y: 700, r: 14 },
  ];

  for (const dot of dots) {
    doc.circle(dot.x, dot.y, dot.r)
       .fillOpacity(0.08)
       .fill('#d9411e');
  }
  doc.fillOpacity(1);
}

module.exports = router;
