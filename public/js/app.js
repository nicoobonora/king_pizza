// King Pizza - Shared Utilities
// Loaded by every page via <script src="/js/app.js" defer>

const API_BASE = '/api';

// ==================== AUTH HELPERS ====================
const Auth = {
  getToken() {
    return localStorage.getItem('kp_token');
  },
  setToken(token) {
    localStorage.setItem('kp_token', token);
  },
  getUsername() {
    return localStorage.getItem('kp_username');
  },
  setUsername(name) {
    localStorage.setItem('kp_username', name);
  },
  clear() {
    localStorage.removeItem('kp_token');
    localStorage.removeItem('kp_username');
  },
  isLoggedIn() {
    return !!this.getToken();
  },
  authHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getToken()}`
    };
  },
  async verify() {
    if (!this.getToken()) return false;
    try {
      const res = await fetch(`${API_BASE}/auth/verify`, {
        headers: this.authHeaders()
      });
      return res.ok;
    } catch {
      return false;
    }
  }
};

// ==================== API FETCH WRAPPER ====================
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Errore sconosciuto' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ==================== TOAST NOTIFICATIONS ====================
function showToast(message, type = 'success') {
  // Remove existing toasts
  document.querySelectorAll('.kp-toast').forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = `kp-toast fixed top-4 right-4 z-[100] px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition-all duration-300 transform translate-x-[120%]`;

  if (type === 'error') {
    toast.classList.add('bg-red-500', 'text-white');
  } else if (type === 'warning') {
    toast.classList.add('bg-yellow-400', 'text-black');
  } else {
    toast.classList.add('bg-green-500', 'text-white');
  }

  toast.textContent = message;
  document.body.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.classList.remove('translate-x-[120%]');
    toast.classList.add('translate-x-0');
  });

  // Animate out after 3s
  setTimeout(() => {
    toast.classList.remove('translate-x-0');
    toast.classList.add('translate-x-[120%]');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ==================== TAG ICON MAPPING ====================
const TAG_ICON_MAP = {
  'pomodoro': { icon: 'potted_plant', color: 'text-red-500' },
  'mozzarella': { icon: 'bakery_dining', color: 'text-yellow-100' },
  'basilico': { icon: 'eco', color: 'text-green-600' },
  'piccante': { icon: 'local_fire_department', color: 'text-orange-400' },
  'funghi': { icon: 'nutrition', color: 'text-amber-700' },
  'tartufo': { icon: 'diamond', color: 'text-amber-900' },
  'vegano': { icon: 'eco', color: 'text-green-600' },
  'formaggio': { icon: 'egg', color: 'text-yellow-500' },
  'formaggi': { icon: 'egg', color: 'text-yellow-500' },
  'pepperoni': { icon: 'circle', color: 'text-red-600' },
  'salame': { icon: 'restaurant', color: 'text-orange-400' },
  'pollo': { icon: 'set_meal', color: 'text-amber-700' },
  'bbq': { icon: 'outdoor_grill', color: 'text-orange-600' },
  'verdure': { icon: 'grass', color: 'text-green-500' },
  'grigliate': { icon: 'outdoor_grill', color: 'text-orange-400' },
  'bianca': { icon: 'cloud', color: 'text-slate-400' },
  'extra formaggio': { icon: 'egg', color: 'text-yellow-500' },
  "crostata d'oro": { icon: 'bakery_dining', color: 'text-yellow-600' },
  'miele piccante': { icon: 'water_drop', color: 'text-amber-500' },
  'pesce': { icon: 'set_meal', color: 'text-blue-500' },
  'prosciutto': { icon: 'restaurant', color: 'text-rose-700' },
  'dolce': { icon: 'cake', color: 'text-pink-400' },
  '_default': { icon: 'circle', color: 'text-slate-500' }
};

function getTagIcon(label) {
  const key = label.toLowerCase().trim();
  return TAG_ICON_MAP[key] || TAG_ICON_MAP['_default'];
}

// ==================== TAILWIND CONFIG (for inline use) ====================
// This is applied in each HTML file's <script> tag
const TAILWIND_CONFIG = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': '#f2df0d',
        'background-light': '#f8f8f5',
        'background-dark': '#222110',
        'crust': '#c17817',
        'sauce': '#d32f2f'
      },
      fontFamily: {
        'display': ['Space Grotesk', 'sans-serif']
      },
      borderRadius: {
        'DEFAULT': '0.5rem',
        'lg': '1rem',
        'xl': '1.5rem',
        'full': '9999px'
      }
    }
  }
};
