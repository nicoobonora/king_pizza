// King Pizza - Menu Pizze Page Logic
document.addEventListener('DOMContentLoaded', () => {
  let allPizzas = [];
  let currentCategory = 'speciali';

  // Load pizzas
  async function loadPizzas() {
    try {
      const data = await apiFetch('/pizzas');
      // Exclude contorni from public menu cards
      allPizzas = data.pizzas.filter(p => p.category !== 'contorni');
      renderPizzas();
    } catch (err) {
      document.getElementById('pizza-list').innerHTML = `
        <div class="text-center py-12">
          <span class="material-symbols-outlined text-5xl text-slate-300 mb-4">error</span>
          <p class="text-slate-500 font-medium">Errore nel caricamento del menu</p>
        </div>
      `;
    }
  }

  function renderPizzas() {
    const filtered = allPizzas.filter(p => p.category === currentCategory);
    const container = document.getElementById('pizza-list');

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12">
          <span class="material-symbols-outlined text-5xl text-slate-300 mb-2">search_off</span>
          <p class="text-slate-500 font-medium">Nessuna pizza in questa categoria</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map((pizza, index) => {
      const tags = Array.isArray(pizza.tags) ? pizza.tags : [];
      const isGlutenFree = pizza.gluten_free === 1 || pizza.gluten_free === true;
      return `
        <div class="bg-white border-4 border-black rounded-xl p-4 pizza-card-shadow animate-slide-up" style="animation-delay: ${index * 0.05}s">
          <div class="flex justify-between items-start mb-2">
            <div class="flex items-center gap-2">
              <h3 class="text-xl font-black uppercase leading-tight">${escapeHtml(pizza.name)}</h3>
              ${isGlutenFree ? '<span class="material-symbols-outlined text-green-600 text-lg" title="Senza Glutine">grain</span>' : ''}
            </div>
            <span class="bg-primary px-2 py-1 border-2 border-black font-bold text-sm shrink-0 ml-2">&euro;${pizza.price.toFixed(2)}</span>
          </div>
          <p class="text-sm font-medium mb-4 italic text-slate-600">${escapeHtml(pizza.description)}</p>
          <div class="flex flex-wrap gap-3">
            ${isGlutenFree ? `
              <div class="tag-pill flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg border-2 border-green-200">
                <span class="material-symbols-outlined text-green-600 text-sm">grain</span>
                <span class="text-[10px] font-bold uppercase text-green-700">Senza Glutine</span>
              </div>
            ` : ''}
            ${tags.map(tag => `
              <div class="tag-pill flex items-center gap-1 bg-background-light px-2 py-1 rounded-lg border-2 border-black/5">
                <span class="material-symbols-outlined ${tag.color || 'text-slate-500'} text-sm">${tag.icon || 'circle'}</span>
                <span class="text-[10px] font-bold uppercase">${escapeHtml(tag.label)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  // Category tab switching
  document.querySelectorAll('[data-category]').forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      currentCategory = tab.dataset.category;

      // Update active tab styles
      document.querySelectorAll('[data-category]').forEach(t => {
        t.classList.remove('border-b-4', 'border-primary', 'font-black', 'text-slate-900');
        t.classList.add('text-slate-500', 'font-bold');
      });
      tab.classList.add('border-b-4', 'border-primary', 'font-black', 'text-slate-900');
      tab.classList.remove('text-slate-500', 'font-bold');

      renderPizzas();
    });
  });

  // PDF download button
  document.getElementById('download-pdf').addEventListener('click', () => {
    window.location.href = '/api/menu/pdf';
  });

  // Filter button (toggle contorni display)
  let showAll = false;
  document.getElementById('filter-btn').addEventListener('click', () => {
    showAll = !showAll;
    if (showAll) {
      // Show all categories at once
      const container = document.getElementById('pizza-list');
      const categories = ['speciali', 'classiche', 'vegane'];
      container.innerHTML = categories.map(cat => {
        const catPizzas = allPizzas.filter(p => p.category === cat);
        if (catPizzas.length === 0) return '';
        return `
          <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">${cat}</h3>
          ${catPizzas.map(pizza => {
            const tags = Array.isArray(pizza.tags) ? pizza.tags : [];
            const isGlutenFree = pizza.gluten_free === 1 || pizza.gluten_free === true;
            return `
              <div class="bg-white border-4 border-black rounded-xl p-4 pizza-card-shadow">
                <div class="flex justify-between items-start mb-2">
                  <div class="flex items-center gap-2">
                    <h3 class="text-xl font-black uppercase leading-tight">${escapeHtml(pizza.name)}</h3>
                    ${isGlutenFree ? '<span class="material-symbols-outlined text-green-600 text-lg" title="Senza Glutine">grain</span>' : ''}
                  </div>
                  <span class="bg-primary px-2 py-1 border-2 border-black font-bold text-sm shrink-0 ml-2">&euro;${pizza.price.toFixed(2)}</span>
                </div>
                <p class="text-sm font-medium mb-4 italic text-slate-600">${escapeHtml(pizza.description)}</p>
                <div class="flex flex-wrap gap-3">
                  ${isGlutenFree ? `
                    <div class="tag-pill flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg border-2 border-green-200">
                      <span class="material-symbols-outlined text-green-600 text-sm">grain</span>
                      <span class="text-[10px] font-bold uppercase text-green-700">Senza Glutine</span>
                    </div>
                  ` : ''}
                  ${tags.map(tag => `
                    <div class="tag-pill flex items-center gap-1 bg-background-light px-2 py-1 rounded-lg border-2 border-black/5">
                      <span class="material-symbols-outlined ${tag.color || 'text-slate-500'} text-sm">${tag.icon || 'circle'}</span>
                      <span class="text-[10px] font-bold uppercase">${escapeHtml(tag.label)}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
        `;
      }).join('');
      document.getElementById('filter-btn').innerHTML = '<span class="material-symbols-outlined text-lg">filter_alt_off</span> Categorie';
    } else {
      renderPizzas();
      document.getElementById('filter-btn').innerHTML = '<span class="material-symbols-outlined text-lg">filter_alt</span> Filtra';
    }
  });

  // Utility: escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initial load
  loadPizzas();
});
