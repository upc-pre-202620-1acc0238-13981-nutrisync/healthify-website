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
    team_eyebrow:    'NOSOTROS',
    about_eyebrow:    'NOSOTROS',
    about_title:      'Somos <span class="text-lime">Healthify.</span>',
    about_subtitle:   'Nacimos de una pregunta simple: ¿qué pasa con el paciente entre una consulta y la siguiente? Healthify lo hace visible, sin juzgar al paciente y sin reemplazar el criterio del nutricionista.',
    story_eyebrow:    'NUESTRA HISTORIA',
    story_title:      'Comer bien no debería depender de la <span class="text-green">memoria.</span>',
    story_p1:         'Entre consulta y consulta pasan semanas. Cuando el paciente vuelve, el nutricionista trabaja con lo que el paciente recuerda: un dato incompleto, a veces maquillado por miedo a ser juzgado.',
    story_p2:         'Por eso construimos Healthify: una herramienta clínica donde el paciente registra en el momento, con una mano y sin culpa, y el nutricionista ve la tendencia real para decidir con criterio.',
    purpose_eyebrow:  'PROPÓSITO',
    purpose_title:    'De dónde partimos, a dónde vamos',
    purpose_subtitle: 'El recorrido que guía cada decisión de Healthify.',
    mission_label:    '01 · HOY · MISIÓN',
    mission_title:    'Ver lo que pasa entre consultas.',
    mission_text:     'Que el nutricionista vea lo que pasa entre consultas, y que el paciente pueda contarlo sin miedo a ser juzgado.',
    vision_label:     '02 · MAÑANA · VISIÓN',
    vision_title:     'El cuidado, en el centro de Latinoamérica.',
    vision_text:      'Ser la herramienta de referencia en Latinoamérica para el seguimiento nutricional entre consultas, con la ética del cuidado en el centro.',
    values_title:     'Lo que nos guía',
    values_subtitle:  'Tres ideas que atraviesan cada pantalla de Healthify.',
    value1_title:     'Cuidado antes que control',
    value1_desc:      'El paciente registra sin culpa. Ningún mensaje acusa, ningún dato se usa para castigar.',
    value2_title:     'Transparencia en cada dato',
    value2_desc:      'Lo aproximado se declara aproximado. Toda estimación muestra de dónde viene y qué tan confiable es.',
    value3_title:     'La decisión es humana',
    value3_desc: "La IA sugiere, el sistema calcula y avisa. El nutricionista decide y el paciente consiente.",
    team_title:       'Conoce al equipo',
    team_subtitle:    'Las personas detrás de Healthify.',
    team_role:        'Equipo Healthify',
    contact_eyebrow:     'CONTACTO',
    contact_title:       'Hablemos.',
    contact_subtitle:    '¿Eres nutricionista y quieres probar Healthify con tus pacientes? ¿Tienes una duda sobre tus datos? Escríbenos y te respondemos en menos de 48 horas hábiles.',
    contact_email_label: 'CORREO',
    contact_phone_label: 'TELÉFONO',
    contact_hours_label: 'HORARIO',
    contact_hours_value: 'Lun a vie · 9:00 - 18:00',
    help_title:   '¿Cómo podemos ayudarte?',
    opt1_title:   'Soy nutricionista',
    opt1_desc:    'Quiero conocer Healthify o solicitar acceso para mi consulta.',
    opt2_title:   'Soy paciente',
    opt2_desc:    'Para usar la app, pídele el código de invitación a tu nutricionista. Si ya lo tienes y algo falla, escríbenos.',
    opt3_title:   'Alianzas',
    opt3_desc:    'Universidades, clínicas y medios.',
    form_title:        'Escríbenos',
    form_name:         'Nombre',
    form_name_ph:      'Tu nombre',
    form_lastname:     'Apellidos',
    form_lastname_ph:  'Tus apellidos',
    form_email:        'Correo electrónico',
    form_email_ph:     'tucorreo@ejemplo.com',
    form_phone:        'Teléfono (opcional)',
    form_phone_ph:     '+51',
    form_role:         'Soy…',
    form_role_nutri:   'Nutricionista',
    form_role_patient: 'Paciente',
    form_role_other:   'Otro',
    form_message:      'Mensaje',
    form_message_ph:   'Cuéntanos en qué podemos ayudarte…',
    form_consent:      'Acepto el <a href="terms.html#privacidad">Aviso de privacidad</a> y el tratamiento de mis datos para responder este mensaje.',
    form_submit:       'Enviar mensaje',
    form_success:      '¡Gracias! Recibimos tu mensaje y te responderemos en menos de 48 horas hábiles.',
    err_name:     'Ingresa tu nombre.',
    err_lastname: 'Ingresa tus apellidos.',
    err_email:    'Ingresa un correo electrónico válido.',
    err_phone:    'Ingresa un teléfono válido, por ejemplo +51 900 000 000.',
    err_message:  'Cuéntanos un poco más (mínimo 20 caracteres).',
    err_consent:  'Debes aceptar el Aviso de privacidad para continuar.',
    team_eyebrow:    'ABOUT US',
    about_eyebrow:    'ABOUT US',
    about_title:      'We are <span class="text-lime">Healthify.</span>',
    about_subtitle:   "We started with a simple question: what happens to the patient between one visit and the next? Healthify makes it visible, without judging the patient and without replacing the nutritionist's judgment.",
    story_eyebrow:    'OUR STORY',
    story_title:      'Eating well shouldn’t depend on <span class="text-green">memory.</span>',
    story_p1:         'Weeks go by between visits. When the patient comes back, the nutritionist works with whatever the patient remembers: incomplete information, sometimes glossed over for fear of being judged.',
    story_p2:         "That's why we built Healthify: a clinical tool where patients log in the moment, one-handed and guilt-free, and nutritionists see the real trend to make sound decisions.",
    purpose_eyebrow:  'PURPOSE',
    purpose_title:    "Where we start, where we're going",
    purpose_subtitle: 'The path that guides every Healthify decision.',
    mission_label:    '01 · TODAY · MISSION',
    mission_title:    'See what happens between visits.',
    mission_text:     'Help nutritionists see what happens between visits, and let patients share it without fear of being judged.',
    vision_label:     '02 · TOMORROW · VISION',
    vision_title:     'Care at the heart of Latin America.',
    vision_text:      "To be Latin America's go-to tool for nutritional follow-up between visits, with the ethics of care at its core.",
    values_title:     'What guides us',
    values_subtitle:  'Three ideas that run through every Healthify screen.',
    value1_title:     'Care before control',
    value1_desc:      'Patients log without guilt. No message accuses, no data is used to punish.',
    value2_title:     'Transparency in every data point',
    value2_desc:      "What is approximate is labeled as approximate. Every estimate shows where it comes from and how reliable it is.",
    value3_title:     'The decision is human',
    value3_desc: "AI suggests, the system calculates and alerts. The nutritionist decides and the patient consents.",
    team_title:       'Meet the team',
    team_subtitle:    'The people behind Healthify.',
    team_role:        'Healthify Team',
    contact_eyebrow:     'CONTACT',
    contact_title:       "Let's talk.",
    contact_subtitle:    "Are you a nutritionist who wants to try Healthify with your patients? Do you have a question about your data? Write to us and we'll reply within 48 business hours.",
    contact_email_label: 'EMAIL',
    contact_phone_label: 'PHONE',
    contact_hours_label: 'HOURS',
    contact_hours_value: 'Mon–Fri · 9:00–18:00',
    help_title:   'How can we help?',
    opt1_title:   "I'm a nutritionist",
    opt1_desc:    'I want to learn about Healthify or request access for my practice.',
    opt2_title:   "I'm a patient",
    opt2_desc:    "To use the app, ask your nutritionist for the invitation code. If you already have it and something isn't working, write to us.",
    opt3_title:   'Partnerships',
    opt3_desc:    'Universities, clinics and media.',
    form_title:        'Write to us',
    form_name:         'First name',
    form_name_ph:      'Your first name',
    form_lastname:     'Last name',
    form_lastname_ph:  'Your last name',
    form_email:        'Email',
    form_email_ph:     'you@example.com',
    form_phone:        'Phone (optional)',
    form_phone_ph:     '+51',
    form_role:         'I am…',
    form_role_nutri:   'Nutritionist',
    form_role_patient: 'Patient',
    form_role_other:   'Other',
    form_message:      'Message',
    form_message_ph:   'Tell us how we can help…',
    form_consent:      'I accept the <a href="terms.html#privacidad">Privacy notice</a> and the processing of my data to reply to this message.',
    form_submit:       'Send message',
    form_success:      "Thank you! We received your message and will reply within 48 business hours.",
    err_name:     'Please enter your first name.',
    err_lastname: 'Please enter your last name.',
    err_email:    'Please enter a valid email address.',
    err_phone:    'Please enter a valid phone number, e.g. +51 900 000 000.',
    err_message:  'Tell us a bit more (at least 20 characters).',
    err_consent:  'You must accept the Privacy notice to continue.',
