'use strict';

const translations = {
  es: {
    nav_login: "Iniciar sesión",
    lang_switch_aria: 'Idioma',

    meta_title_home:    'Healthify: lo que pasa entre consultas, ahora sí se ve',
    meta_title_about:   'Nosotros | Healthify',
    meta_title_contact: 'Contacto | Healthify',
    meta_title_terms:   'Términos y condiciones | Healthify',

    skip_link:        'Saltar al contenido principal',
    nav_home_aria:    'Healthify, ir al inicio',
    nav_main_aria:    'Navegación principal',
    nav_patient:      'Paciente',
    nav_nutritionist: 'Nutricionista',
    nav_how:          'Cómo funciona',
    nav_about:        'Nosotros',
    nav_contact:      'Contacto',
    nav_cta:          'Soy nutricionista',
    nav_invited:      'Fui invitado por mi nutricionista →',
    nav_open_menu:    'Abrir menú',
    nav_close_menu:   'Cerrar menú',
    menu_aria:        'Menú de navegación',
    menu_contact:     'CONTACTO',
    menu_contact_meta:'+51 900 000 000 · Lun a vie 9:00 - 18:00',







    footer_tagline: 'Herramienta clínica para nutricionista y paciente. Captura la información entre consultas, sin reemplazar el expediente clínico.',
    footer_nav:     'NAVEGACIÓN',
    footer_home:    'Inicio',
    footer_legal:   'LEGAL',
    footer_terms:   'Términos y condiciones',
    footer_privacy: 'Aviso de privacidad',
    footer_social:  'REDES',
    footer_contact: 'CONTACTO',
    footer_hours:   'Lun a vie · 9:00 - 18:00',
    footer_copy:    '© 2026 Healthify. Todos los derechos reservados.',
    footer_lang:    'Idioma:',
    lang_select_aria: 'Seleccionar idioma',
    new_tab:        '(se abre en una pestaña nueva)',



  },

  en: {
    nav_login: "Log in",
    lang_switch_aria: 'Language',

    meta_title_home:    'Healthify: see what happens between visits',
    meta_title_about:   'About us | Healthify',
    meta_title_contact: 'Contact | Healthify',
    meta_title_terms:   'Terms and conditions | Healthify',

    skip_link:        'Skip to main content',
    nav_home_aria:    'Healthify, go to home page',
    nav_main_aria:    'Main navigation',
    nav_patient:      'Patients',
    nav_nutritionist: 'Nutritionists',
    nav_how:          'How it works',
    nav_about:        'About us',
    nav_contact:      'Contact',
    nav_cta:          "I'm a nutritionist",
    nav_invited:      'I was invited by my nutritionist →',
    nav_open_menu:    'Open menu',
    nav_close_menu:   'Close menu',
    menu_aria:        'Navigation menu',
    menu_contact:     'CONTACT',
    menu_contact_meta:'+51 900 000 000 · Mon–Fri 9:00–18:00',







    footer_tagline: 'Clinical tool for nutritionists and patients. It captures what happens between visits, without replacing the clinical record.',
    footer_nav:     'NAVIGATION',
    footer_home:    'Home',
    footer_legal:   'LEGAL',
    footer_terms:   'Terms and conditions',
    footer_privacy: 'Privacy notice',
    footer_social:  'SOCIAL',
    footer_contact: 'CONTACT',
    footer_hours:   'Mon–Fri · 9:00–18:00',
    footer_copy:    '© 2026 Healthify. All rights reserved.',
    footer_lang:    'Language:',
    lang_select_aria: 'Select language',
    new_tab:        '(opens in a new tab)',



  }
};

const I18n = (() => {
  const STORAGE_KEY = 'healthify_lang';

  const DEFAULT_LANG = 'es';

  let currentLang = DEFAULT_LANG;

  function getLang() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return translations[saved] ? saved : DEFAULT_LANG;
    } catch (_) {
      return DEFAULT_LANG;
    }
  }

  function setLang(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (_) { /* storage unavailable */ }
    applyTranslations();
    updateLangSelects();
    applyLangAttributes();
    document.dispatchEvent(new CustomEvent('i18n:change', { detail: { lang } }));
  }

  function applyLangAttributes() {
    document.documentElement.lang = currentLang === 'es' ? 'es-419' : 'en-US';
  }

  function t(key) {
    return (translations[currentLang] && translations[currentLang][key]) ||
           (translations[DEFAULT_LANG] && translations[DEFAULT_LANG][key]) ||
           key;
  }

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const val = t(el.getAttribute('data-i18n'));
      if (el.hasAttribute('data-i18n-html')) {
        el.innerHTML = val;
      } else {
        el.textContent = val;
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });

    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });

    document.querySelectorAll('[data-i18n-alt]').forEach(el => {
      el.setAttribute('alt', t(el.getAttribute('data-i18n-alt')));
    });
  }

  function updateLangSelects() {
    document.querySelectorAll('.lang-select').forEach(sel => {
      sel.value = currentLang;
    });
  }

  function init() {
    currentLang = getLang();
    applyTranslations();
    updateLangSelects();
    applyLangAttributes();

    document.querySelectorAll('.lang-select').forEach(sel => {
      sel.addEventListener('change', e => setLang(e.target.value));
    });
  }

  return { init, setLang, t, getLang: () => currentLang };
})();
