export function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

export function initUI() {
  const menuButton = document.querySelector('#menu-button');
  const nav = document.querySelector('#primary-nav');
  const themeButton = document.querySelector('#theme-button');

  menuButton.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', isOpen);
    menuButton.textContent = isOpen ? '✕' : '☰';
  });

  // Dark mode: remember the choice in local storage, else follow the device
  const applyTheme = (theme) => {
    document.documentElement.dataset.theme = theme;
    themeButton.setAttribute('aria-pressed', theme === 'dark');
  };

  let saved = null;
  try { saved = localStorage.getItem('ivms-theme'); } catch (e) { /* storage blocked */ }
  applyTheme(saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

  themeButton.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('ivms-theme', next); } catch (e) { /* ignore */ }
  });

  document.querySelector('#currentyear').textContent = new Date().getFullYear();
  document.querySelector('#lastModified').textContent = document.lastModified;
}