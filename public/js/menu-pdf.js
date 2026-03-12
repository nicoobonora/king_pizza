// King Pizza - Menu PDF View Page Logic
document.addEventListener('DOMContentLoaded', () => {
  async function loadMenu() {
    try {
      const [pizzaData, settings] = await Promise.all([
        apiFetch('/pizzas'),
        apiFetch('/settings')
      ]);

      const pizzas = pizzaData.pizzas;
      const currency = settings.currency_symbol || '\u20AC';

      // Group by category
      const speciali = pizzas.filter(p => p.category === 'speciali');
      const classiche = pizzas.filter(p => p.category === 'classiche');
      const vegane = pizzas.filter(p => p.category === 'vegane');
      const contorni = pizzas.filter(p => p.category === 'contorni');

      // Render sections
      renderMenuSection('speciali-container', speciali, currency, true);
      renderMenuSection('classiche-container', [...classiche, ...vegane], currency, true);
      renderMenuSection('contorni-container', contorni, currency, false);

      // Update settings in UI
      if (settings.tagline) {
        document.getElementById('tagline').textContent = settings.tagline;
      }
      if (settings.established) {
        document.getElementById('badge-est').textContent = settings.established;
      }
      if (settings.phone) {
        document.getElementById('phone').textContent = settings.phone;
      }
      if (settings.address) {
        document.getElementById('address').textContent = settings.address;
      }
      if (settings.website) {
        document.getElementById('website').textContent = settings.website;
      }
      if (settings.build_your_own_base_price) {
        document.getElementById('base-price').textContent = `${currency}${settings.build_your_own_base_price}`;
      }
      if (settings.build_your_own_topping_price) {
        document.getElementById('topping-price').textContent = `${currency}${settings.build_your_own_topping_price}`;
      }
    } catch (err) {
      console.error('Error loading menu:', err);
    }
  }

  function renderMenuSection(containerId, items, currency, showDesc) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = items.map(item => {
      const isGlutenFree = item.gluten_free === 1 || item.gluten_free === true;
      return `
        <div class="flex flex-col">
          <div class="flex justify-between items-baseline border-b-2 border-dotted border-slate-300">
            <div class="flex items-center gap-2">
              <h3 class="text-lg sm:text-xl font-bold text-slate-900 uppercase">${escapeHtml(item.name)}</h3>
              ${isGlutenFree ? '<span class="material-symbols-outlined text-green-600 text-base" title="Senza Glutine">grain</span>' : ''}
            </div>
            <span class="text-lg sm:text-xl font-bold text-slate-900 shrink-0 ml-2">${currency}${item.price.toFixed(2)}</span>
          </div>
          ${showDesc && item.description ? `<p class="text-slate-600 text-sm mt-1">${escapeHtml(item.description)}</p>` : ''}
        </div>
      `;
    }).join('');
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Download PDF button
  document.getElementById('download-pdf-btn').addEventListener('click', () => {
    window.location.href = '/api/menu/pdf';
  });

  loadMenu();
});
