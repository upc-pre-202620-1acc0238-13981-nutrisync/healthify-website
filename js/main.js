'use strict';

document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  I18n.init();
  initLangSwitch();
  initNav();
});

function initLangSwitch() {
  const buttons = document.querySelectorAll('.lang-switch__opt');
  if (!buttons.length) return;

  function sync() {
    const lang = I18n.getLang();
    buttons.forEach(btn => btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang)));
  }

  buttons.forEach(btn => btn.addEventListener('click', () => I18n.setLang(btn.dataset.lang)));
  document.addEventListener('i18n:change', sync);
  sync();
}

function initNav() {
  const toggle = document.querySelector('.navbar__toggle');
  const menu   = document.getElementById('mobileMenu');
  if (!toggle || !menu) return;

  const desktopQuery = window.matchMedia('(min-width: 1101px)');

  function syncLabel(isOpen) {
    toggle.setAttribute('aria-label', I18n.t(isOpen ? 'nav_close_menu' : 'nav_open_menu'));
  }

  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
    menu.inert = !open;
    syncLabel(open);
  }

  menu.inert = true;
  syncLabel(false);

  toggle.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      setMenu(false);
      toggle.focus();
    }
  });

  desktopQuery.addEventListener('change', e => { if (e.matches) setMenu(false); });
  document.addEventListener('i18n:change', () => syncLabel(menu.classList.contains('is-open')));
}
