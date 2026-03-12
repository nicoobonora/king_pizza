// King Pizza - Home Page Logic
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const settings = await apiFetch('/settings');

    if (settings.promo_title) {
      document.getElementById('promo-title').textContent = settings.promo_title;
    }
    if (settings.promo_text) {
      document.getElementById('promo-text').textContent = settings.promo_text;
    }
  } catch (err) {
    console.warn('Could not load settings:', err);
  }
});
