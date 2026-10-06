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
  initContactForm();
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const fields = {
    name:     { input: form.querySelector('#contact-name'),     error: 'err-name' },
    lastname: { input: form.querySelector('#contact-lastname'), error: 'err-lastname' },
    email:    { input: form.querySelector('#contact-email'),    error: 'err-email' },
    phone:    { input: form.querySelector('#contact-phone'),    error: 'err-phone' },
    message:  { input: form.querySelector('#contact-message'),  error: 'err-message' },
    consent:  { input: form.querySelector('#contact-consent'),  error: 'err-consent' }
  };

  const successBox  = document.getElementById('formSuccess');
  const optionCards = document.querySelectorAll('.option-card[data-role]');

  const validators = {
    name:     el => el.value.trim().length >= 2 && !/\d/.test(el.value),
    lastname: el => el.value.trim().length >= 2 && !/\d/.test(el.value),
    email:    el => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(el.value.trim()),
    phone:    el => !el.value.trim() || /^\+?\d[\d\s-]{6,}$/.test(el.value.trim()),
    message:  el => el.value.trim().length >= 20,
    consent:  el => el.checked
  };

  function showError(key, show) {
    const { input, error } = fields[key];
    const errEl = document.getElementById(error);
    if (!input || !errEl) return;
    input.classList.toggle('is-error', show);
    input.setAttribute('aria-invalid', String(show));
    errEl.classList.toggle('is-visible', show);
  }

  function validate(key) {
    const valid = validators[key](fields[key].input);
    showError(key, !valid);
    return valid;
  }

  function selectRole(role) {
    const radio = form.querySelector(`input[name="rol"][value="${role}"]`);
    if (!radio) return;
    radio.checked = true;
    optionCards.forEach(card => card.setAttribute('aria-pressed', String(card.dataset.role === role)));
  }

  Object.keys(fields).forEach(key => {
    const { input } = fields[key];
    if (!input) return;
    const evt = input.type === 'checkbox' ? 'change' : 'input';
    input.addEventListener(evt, () => { if (input.classList.contains('is-error') || key === 'consent') validate(key); });
    if (input.type !== 'checkbox') input.addEventListener('blur', () => { if (input.value.trim()) validate(key); });
  });

  optionCards.forEach(card => {
    card.addEventListener('click', () => {
      selectRole(card.dataset.role);
      fields.name.input?.focus({ preventScroll: true });
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  form.querySelectorAll('input[name="rol"]').forEach(radio => {
    radio.addEventListener('change', () => selectRole(radio.value));
  });

  const roleParam = new URLSearchParams(location.search).get('rol');
  if (['nutricionista', 'paciente', 'otro'].includes(roleParam)) selectRole(roleParam);

  form.addEventListener('submit', e => {
    e.preventDefault();
    const results = Object.keys(fields).map(validate);

    if (results.includes(false)) {
      form.querySelector('.is-error')?.focus();
      return;
    }

    successBox?.classList.add('is-visible');
    form.reset();
    optionCards.forEach(card => card.setAttribute('aria-pressed', 'false'));
    setTimeout(() => successBox?.classList.remove('is-visible'), 8000);
  });
}
