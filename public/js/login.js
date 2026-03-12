// King Pizza - Login Page Logic
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const errorMsg = document.getElementById('error-msg');
  const loading = document.getElementById('loading');
  const loginBtn = document.getElementById('login-btn');

  // If already logged in, redirect to dashboard
  if (Auth.isLoggedIn()) {
    Auth.verify().then(valid => {
      if (valid) window.location.href = '/dashboard.html';
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.classList.add('hidden');

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) {
      errorMsg.textContent = 'Compila tutti i campi!';
      errorMsg.classList.remove('hidden');
      return;
    }

    // Show loading
    loading.classList.remove('hidden');
    loginBtn.disabled = true;

    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      Auth.setToken(data.token);
      Auth.setUsername(data.username);

      showToast(`Benvenuto, ${data.username}!`);

      // Redirect to dashboard after brief delay
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 500);

    } catch (err) {
      errorMsg.textContent = err.message || 'Credenziali non valide. Riprova!';
      errorMsg.classList.remove('hidden');
      loading.classList.add('hidden');
      loginBtn.disabled = false;

      // Shake animation
      form.classList.add('animate-shake');
      setTimeout(() => form.classList.remove('animate-shake'), 500);
    }
  });
});
