// King Pizza - Dashboard Staff Logic
document.addEventListener('DOMContentLoaded', () => {
  let pizzas = [];
  let editingId = null;
  let deletingId = null;

  // ==================== AUTH GUARD ====================
  (async () => {
    const valid = await Auth.verify();
    if (!valid) {
      Auth.clear();
      window.location.href = '/login.html';
      return;
    }
    // Show username
    const usernameEl = document.getElementById('username-display');
    if (usernameEl) {
      usernameEl.textContent = Auth.getUsername();
      usernameEl.classList.remove('hidden');
    }
    loadDashboard();
  })();

  // ==================== LOAD & RENDER ====================
  async function loadDashboard() {
    try {
      const data = await apiFetch('/pizzas?all=true');
      pizzas = data.pizzas;
      renderPizzaList();
      updateCount();
    } catch (err) {
      showToast('Errore nel caricamento del menu', 'error');
    }
  }

  function updateCount() {
    document.getElementById('item-count').textContent = `${pizzas.length} Articoli`;
  }

  function renderPizzaList() {
    const container = document.getElementById('pizza-list');

    if (pizzas.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12">
          <span class="material-symbols-outlined text-5xl text-slate-300 mb-2">restaurant_menu</span>
          <p class="text-slate-500 font-medium">Nessuna pizza nel menu</p>
          <p class="text-slate-400 text-sm mt-1">Aggiungi la tua prima pizza!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = pizzas.map(pizza => {
      const isActive = pizza.active === 1 || pizza.active === true;
      const isGlutenFree = pizza.gluten_free === 1 || pizza.gluten_free === true;
      const opacityClass = isActive ? '' : 'opacity-50';
      const borderClass = isActive ? 'border-slate-100' : 'border-red-200 bg-red-50/30';

      return `
        <div class="flex items-center gap-4 bg-white border ${borderClass} p-3 rounded-xl hover:border-primary transition-colors group ${opacityClass}" data-id="${pizza.id}">
          <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-16 shrink-0 flex items-center justify-center"
               style="background-color: #f2df0d">
            <span class="material-symbols-outlined text-2xl text-slate-900/30">local_pizza</span>
          </div>
          <div class="flex flex-col flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p class="text-slate-900 text-base font-bold truncate">${escapeHtml(pizza.name)}</p>
              ${isGlutenFree ? '<span class="material-symbols-outlined text-green-600 text-base" title="Senza Glutine">grain</span>' : ''}
              ${!isActive ? '<span class="text-[10px] font-bold uppercase bg-red-100 text-red-600 px-2 py-0.5 rounded-full shrink-0">Non disponibile</span>' : ''}
            </div>
            <p class="text-slate-500 text-sm font-normal line-clamp-1">${escapeHtml(pizza.description)}</p>
            <p class="text-primary font-bold text-sm mt-1">&euro;${pizza.price.toFixed(2)}
              <span class="text-slate-400 font-normal text-xs ml-2">${pizza.category}</span>
            </p>
          </div>
          <div class="flex gap-1">
            <button onclick="window.dashboardToggleAvailability(${pizza.id})" class="p-2 hover:bg-amber-50 rounded-lg ${isActive ? 'text-green-500 hover:text-amber-500' : 'text-red-400 hover:text-green-500'} transition-colors" title="${isActive ? 'Segna come non disponibile' : 'Segna come disponibile'}">
              <span class="material-symbols-outlined text-xl">${isActive ? 'toggle_on' : 'toggle_off'}</span>
            </button>
            <button onclick="window.dashboardEditPizza(${pizza.id})" class="p-2 hover:bg-primary/10 rounded-lg text-slate-400 hover:text-primary transition-colors" title="Modifica">
              <span class="material-symbols-outlined text-xl">edit</span>
            </button>
            <button onclick="window.dashboardDeletePizza(${pizza.id})" class="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors" title="Elimina">
              <span class="material-symbols-outlined text-xl">delete</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // ==================== MODAL MANAGEMENT ====================
  const modal = document.getElementById('pizza-modal');
  const modalSheet = document.getElementById('modal-sheet');
  const form = document.getElementById('pizza-form');

  function openModal() {
    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
      modalSheet.classList.add('active');
    });
  }

  function closeModal() {
    modalSheet.classList.remove('active');
    setTimeout(() => {
      modal.classList.add('hidden');
      form.reset();
      editingId = null;
      document.getElementById('modal-title').textContent = 'Aggiungi Pizza';
      document.getElementById('submit-text').textContent = 'Salva Pizza';
    }, 300);
  }

  // Open add modal
  document.getElementById('add-pizza-btn').addEventListener('click', () => {
    editingId = null;
    document.getElementById('modal-title').textContent = 'Aggiungi Pizza';
    document.getElementById('submit-text').textContent = 'Aggiungi al Menu';
    form.reset();
    openModal();
  });

  // Close modal
  document.getElementById('close-modal-btn').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // ==================== TOGGLE AVAILABILITY ====================
  window.dashboardToggleAvailability = async function(id) {
    const pizza = pizzas.find(p => p.id === id);
    if (!pizza) return;

    const newActive = !(pizza.active === 1 || pizza.active === true);

    try {
      await apiFetch(`/pizzas/${id}`, {
        method: 'PUT',
        headers: Auth.authHeaders(),
        body: JSON.stringify({ active: newActive })
      });
      showToast(newActive ? 'Pizza disponibile!' : 'Pizza segnata come non disponibile');
      await loadDashboard();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // ==================== EDIT PIZZA ====================
  window.dashboardEditPizza = function(id) {
    const pizza = pizzas.find(p => p.id === id);
    if (!pizza) return;

    editingId = id;
    document.getElementById('modal-title').textContent = 'Modifica Pizza';
    document.getElementById('submit-text').textContent = 'Aggiorna Pizza';
    document.getElementById('f-name').value = pizza.name;
    document.getElementById('f-desc').value = pizza.description;
    document.getElementById('f-price').value = pizza.price;
    document.getElementById('f-category').value = pizza.category;
    document.getElementById('f-gluten-free').checked = pizza.gluten_free === 1 || pizza.gluten_free === true;

    // Convert tags to comma-separated string
    const tags = Array.isArray(pizza.tags) ? pizza.tags : [];
    document.getElementById('f-tags').value = tags.map(t => t.label).join(', ');

    openModal();
  };

  // ==================== DELETE PIZZA ====================
  const deleteModal = document.getElementById('delete-modal');

  window.dashboardDeletePizza = function(id) {
    const pizza = pizzas.find(p => p.id === id);
    if (!pizza) return;

    deletingId = id;
    document.getElementById('delete-pizza-name').textContent = `"${pizza.name}" verr\u00E0 rimossa dal menu.`;
    deleteModal.classList.remove('hidden');
  };

  document.getElementById('delete-cancel').addEventListener('click', () => {
    deleteModal.classList.add('hidden');
    deletingId = null;
  });

  document.getElementById('delete-confirm').addEventListener('click', async () => {
    if (!deletingId) return;

    try {
      await apiFetch(`/pizzas/${deletingId}`, {
        method: 'DELETE',
        headers: Auth.authHeaders()
      });
      showToast('Pizza eliminata con successo!');
      deleteModal.classList.add('hidden');
      deletingId = null;
      await loadDashboard();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // ==================== FORM SUBMIT (CREATE/UPDATE) ====================
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Convert comma-separated tags to JSON array with icon mapping
    const tagLabels = document.getElementById('f-tags').value
      .split(',').map(t => t.trim()).filter(Boolean);
    const tags = tagLabels.map(label => {
      const mapped = getTagIcon(label);
      return { icon: mapped.icon, color: mapped.color, label: label };
    });

    const body = {
      name: document.getElementById('f-name').value.trim(),
      description: document.getElementById('f-desc').value.trim(),
      price: parseFloat(document.getElementById('f-price').value),
      category: document.getElementById('f-category').value,
      tags: tags,
      gluten_free: document.getElementById('f-gluten-free').checked
    };

    if (!body.name || !body.description || isNaN(body.price)) {
      showToast('Compila tutti i campi obbligatori', 'error');
      return;
    }

    try {
      if (editingId) {
        await apiFetch(`/pizzas/${editingId}`, {
          method: 'PUT',
          headers: Auth.authHeaders(),
          body: JSON.stringify(body)
        });
        showToast('Pizza aggiornata con successo!');
      } else {
        await apiFetch('/pizzas', {
          method: 'POST',
          headers: Auth.authHeaders(),
          body: JSON.stringify(body)
        });
        showToast('Pizza aggiunta al menu!');
      }
      closeModal();
      await loadDashboard();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // ==================== GENERATE PDF ====================
  document.getElementById('generate-pdf').addEventListener('click', () => {
    showToast('Generazione PDF in corso...');
    window.location.href = '/api/menu/pdf';
  });

  // ==================== LOGOUT ====================
  document.getElementById('logout-btn').addEventListener('click', () => {
    Auth.clear();
    showToast('Logout effettuato', 'warning');
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 500);
  });

  // ==================== UTILITIES ====================
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
