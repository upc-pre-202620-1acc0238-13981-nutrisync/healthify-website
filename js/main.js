'use strict';

document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  I18n.init();
  initLangSwitch();
  initMenu();
  initHeader();
  initCarousel();
  initSteps();
  initFAQ();
  initTermsToc();
  initContactForm();
  initReveal();
  initCountUp();
  initStepsLine();
  initScreenRotation();
  initProofChat();
  initButtonShine();
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const scrollBehavior = () => (reducedMotion.matches ? 'auto' : 'smooth');

function initLangSwitch() {
  const buttons = document.querySelectorAll('.lang-switch__opt');
  if (!buttons.length) return;

  function sync() {
    const lang = I18n.getLang();
    buttons.forEach(btn => btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang)));
  }

  // El cambio de idioma se funde en lugar de saltar (View Transitions, donde exista)
  function switchLang(lang) {
    if (lang === I18n.getLang()) return;
    if (!document.startViewTransition || reducedMotion.matches) { I18n.setLang(lang); return; }
    const root = document.documentElement;
    root.classList.add('vt-lang');
    document.startViewTransition(() => I18n.setLang(lang)).finished
      .finally(() => root.classList.remove('vt-lang'));
  }

  buttons.forEach(btn => btn.addEventListener('click', () => switchLang(btn.dataset.lang)));
  document.addEventListener('i18n:change', sync);
  sync();
}

function initMenu() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  const desktop = window.matchMedia('(min-width: 1200px)');
  const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

  const outside = [document.querySelector('main'), document.querySelector('.site-footer')].filter(Boolean);
  const backdrop = document.createElement('div');
  backdrop.className = 'menu-backdrop';
  menu.before(backdrop);

  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  // Cerrado, el menú queda con [hidden] (display: none). Si quedara desplazado fuera de
  // pantalla, los navegadores móviles lo contarían como ancho extra y la página se movería de lado.
  let hideTimer = null;
  function hideWhenClosed() {
    clearTimeout(hideTimer);
    hideTimer = null;
    if (!isOpen()) menu.hidden = true;
  }
  menu.addEventListener('transitionend', e => { if (e.target === menu && e.propertyName === 'transform') hideWhenClosed(); });

  function syncLabel() {
    toggle.setAttribute('aria-label', I18n.t(isOpen() ? 'nav_close_menu' : 'nav_open_menu'));
  }

  function setMenu(open, { returnFocus = true } = {}) {
    toggle.setAttribute('aria-expanded', String(open));
    clearTimeout(hideTimer);
    if (open) {
      menu.hidden = false;
      void menu.offsetWidth; // aplica la posición cerrada antes de animar la apertura
    } else {
      hideTimer = setTimeout(hideWhenClosed, 400); // por si no hay transición (escritorio, sin animaciones)
    }
    menu.classList.toggle('is-open', open);
    backdrop.classList.toggle('is-open', open);
    outside.forEach(el => { el.inert = open; });
    document.body.classList.toggle('menu-open', open);
    syncLabel();
    if (open) {
      menu.querySelector(FOCUSABLE)?.focus();
    } else if (returnFocus) {
      toggle.focus();
    }
  }

  toggle.addEventListener('click', () => setMenu(!isOpen()));
  backdrop.addEventListener('click', () => setMenu(false));

  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false, { returnFocus: false })));

  document.addEventListener('keydown', e => {
    if (!isOpen()) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      setMenu(false);
      return;
    }
    if (e.key !== 'Tab') return;
    const items = [toggle, ...menu.querySelectorAll(FOCUSABLE)].filter(el => el.offsetParent !== null);
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    else if (!items.includes(document.activeElement)) { e.preventDefault(); first.focus(); }
  });

  desktop.addEventListener('change', e => { if (e.matches && isOpen()) setMenu(false, { returnFocus: false }); });
  document.addEventListener('i18n:change', syncLabel);
  syncLabel();
}

function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const hero = document.querySelector('.hero, .about-hero');
  const IDLE_MS = 2000;
  const COMPACT_AFTER = 160;
  let lastY = window.scrollY;
  let idle = null;
  let ticking = false;

  const limit = () => (hero ? hero.offsetTop + hero.offsetHeight : header.offsetHeight * 2) - header.offsetHeight;
  const pastLimit = () => window.scrollY > limit();

  function coversFocus() {
    const el = document.activeElement;
    if (!el || el === document.body || header.contains(el) || !el.matches(':focus-visible')) return false;
    return el.getBoundingClientRect().top < header.offsetHeight;
  }

  function show() {
    if (!coversFocus()) header.classList.remove('is-hidden');
  }

  function hide() {
    if (document.body.classList.contains('menu-open') || header.contains(document.activeElement)) return;
    header.classList.add('is-hidden');
  }

  function update() {
    ticking = false;
    const y = window.scrollY;
    header.classList.toggle('is-stuck', y > 0);
    // Compacto solo cuando su hueco original ya salió de la vista (ver .is-compact en CSS)
    header.classList.toggle('is-compact', y > COMPACT_AFTER);
    clearTimeout(idle);
    if (!pastLimit()) {
      header.classList.remove('is-hidden');
    } else {
      if (y > lastY + 4) hide();
      else if (y < lastY - 4) show();
      idle = setTimeout(show, IDLE_MS);
    }
    lastY = y;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });

  document.addEventListener('pointermove', e => {
    if (e.pointerType === 'mouse' && e.clientY <= header.offsetHeight) show();
  }, { passive: true });

  header.addEventListener('focusin', () => header.classList.remove('is-hidden'));

  document.addEventListener('focusin', e => {
    if (header.contains(e.target) || !pastLimit()) return;
    requestAnimationFrame(() => { if (coversFocus()) hide(); });
  });

  update();
}

function initCarousel() {
  const root = document.querySelector('[data-carousel]');
  if (!root) return;
  const slides = [...root.querySelectorAll('.carousel__slide')];
  const dots = [...root.querySelectorAll('[data-carousel-dot]')];
  const prevBtn = root.querySelector('[data-carousel-prev]');
  const nextBtn = root.querySelector('[data-carousel-next]');
  const status = root.querySelector('[data-carousel-status]');
  const INTERVAL_MS = 12000;
  const LEAVE_MS = 600;

  let current = 0;
  let timer = null;
  let startedAt = 0;
  let remaining = INTERVAL_MS;
  let userPaused = reducedMotion.matches;
  let holding = false;

  const canRun = () => !userPaused && !holding && !document.hidden;

  function syncState() {
    root.classList.toggle('is-paused', !canRun());
  }

  function stopTimer() {
    if (!timer) return;
    clearTimeout(timer);
    timer = null;
    remaining = Math.max(0, remaining - (Date.now() - startedAt));
  }

  function startTimer() {
    clearTimeout(timer);
    timer = null;
    syncState();
    if (!canRun()) return;
    startedAt = Date.now();
    timer = setTimeout(() => goTo(current + 1), remaining);
  }

  function embedFor(url) {
    let u;
    try { u = new URL(url); } catch (_) { return null; }
    const host = u.hostname.replace(/^(www|m)\./, '');
    const parts = u.pathname.split('/').filter(Boolean);
    if (host === 'youtu.be' || host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      const id = host === 'youtu.be' ? parts[0] : (u.searchParams.get('v') || parts[parts.length - 1]);
      if (!id) return null;
      return { type: 'youtube', src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&enablejsapi=1&rel=0&playsinline=1&origin=${encodeURIComponent(location.origin)}` };
    }
    if (host.endsWith('vimeo.com')) {
      const id = parts.find(p => /^\d+$/.test(p));
      if (!id) return null;
      const hash = u.searchParams.get('h') || parts[parts.indexOf(id) + 1];
      return { type: 'vimeo', src: `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1${hash ? `&h=${encodeURIComponent(hash)}` : ''}` };
    }
    return u.protocol === 'https:' ? { type: 'other', src: u.href } : null;
  }

  function resetVideo(slide) {
    slide.querySelector('iframe')?.remove();
    slide.querySelector('.video__poster').hidden = false;
    slide.querySelector('[data-video-play]').hidden = false;
  }

  function pauseVideo(slide) {
    const iframe = slide.querySelector('iframe');
    if (!iframe) return;
    const origin = new URL(iframe.src).origin;
    if (iframe.dataset.type === 'youtube') {
      iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }), origin);
    } else if (iframe.dataset.type === 'vimeo') {
      iframe.contentWindow.postMessage(JSON.stringify({ method: 'pause' }), origin);
    } else {
      resetVideo(slide);
    }
  }

  function playVideo(slide) {
    const embed = embedFor(slide.dataset.videoUrl || '');
    if (!embed) return;
    const iframe = document.createElement('iframe');
    iframe.src = embed.src;
    iframe.dataset.type = embed.type;
    iframe.title = slide.querySelector('.video__title').textContent;
    iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    slide.querySelector('.video').append(iframe);
    slide.querySelector('.video__poster').hidden = true;
    slide.querySelector('[data-video-play]').hidden = true;
    iframe.focus();
    userPaused = true;
    stopTimer();
    syncState();
  }

  function announce() {
    const title = dots[current].getAttribute('aria-label');
    status.textContent = I18n.t('carousel_status')
      .replace('{n}', current + 1).replace('{total}', slides.length).replace('{title}', title);
  }

  function goTo(index, { user = false } = {}) {
    const next = (index + slides.length) % slides.length;
    if (next !== current) {
      const leaving = slides[current];
      pauseVideo(leaving);
      leaving.classList.add('is-leaving');
      setTimeout(() => leaving.classList.remove('is-leaving'), LEAVE_MS);
    }
    current = next;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === current);
      slide.inert = i !== current;
    });
    dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === current)));
    if (user) {
      userPaused = true;
      announce();
    }
    remaining = INTERVAL_MS;
    startTimer();
  }

  function syncTexts() {
    root.setAttribute('aria-roledescription', I18n.t('carousel_role'));
    slides.forEach((slide, i) => {
      slide.setAttribute('aria-roledescription', I18n.t('carousel_slide_role'));
      slide.setAttribute('aria-label', I18n.t('carousel_slide_label').replace('{n}', i + 1).replace('{total}', slides.length));
      const button = slide.querySelector('[data-video-play]');
      if (!button) return;
      const ready = Boolean(embedFor(slide.dataset.videoUrl || ''));
      if (ready) button.removeAttribute('aria-disabled');
      else button.setAttribute('aria-disabled', 'true');
      slide.querySelector('[data-video-hint]').textContent = I18n.t(ready ? 'video_watch' : 'video_soon');
    });
    syncState();
  }

  slides.forEach(slide => {
    slide.querySelector('[data-video-play]')?.addEventListener('click', () => playVideo(slide));
  });
  prevBtn.addEventListener('click', () => goTo(current - 1, { user: true }));
  nextBtn.addEventListener('click', () => goTo(current + 1, { user: true }));
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i, { user: true })));

  root.querySelector('.carousel__controls').addEventListener('keydown', e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    goTo(current + (e.key === 'ArrowRight' ? 1 : -1), { user: true });
    if (e.target.matches('[data-carousel-dot]')) dots[current].focus();
  });

  let touchX = null;
  const track = root.querySelector('.carousel__track');
  track.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 50) goTo(current + (dx < 0 ? 1 : -1), { user: true });
  }, { passive: true });

  function hold(value) {
    if (holding === value) return;
    holding = value;
    if (holding) { stopTimer(); syncState(); }
    else startTimer();
  }
  root.addEventListener('mouseenter', () => hold(true));
  root.addEventListener('mouseleave', () => hold(root.contains(document.activeElement)));
  root.addEventListener('focusin', () => hold(true));
  root.addEventListener('focusout', e => { if (!root.contains(e.relatedTarget)) hold(root.matches(':hover')); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { stopTimer(); syncState(); }
    else startTimer();
  });

  document.addEventListener('i18n:change', syncTexts);
  syncTexts();
  goTo(0);
}

function initReveal() {
  if (reducedMotion.matches || !('IntersectionObserver' in window)) return;
  const selector = [
    'main > section:not(.hero):not(.about-hero) .h-section',
    '.value__note', '.stat', '.steps__lead', '.step', '.between__lead', '.between__visual', '.example',
    '.pros__visual', '.feature', '.patients__lead', '.patients__visual',
    '.cta__title', '.cta__btn', '.cta__steps li',
    '.story__title', '.story__cols > *', '.purpose__card', '.values__title', '.value-item',
    '.team__title', '.member'
  ].join(', ');
  const targets = [...document.querySelectorAll(selector)];
  if (!targets.length) return;

  targets.forEach(el => {
    const siblings = [...el.parentElement.children].filter(child => targets.includes(child));
    el.style.setProperty('--reveal-i', Math.min(siblings.indexOf(el), 5));
    el.classList.add('reveal');
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  targets.forEach(el => observer.observe(el));
}

// Las cifras de la sección de valor cuentan desde 0 al entrar en pantalla.
// El texto real queda en un span .sr-only; la cifra animada se oculta a lectores de pantalla.
function initCountUp() {
  if (reducedMotion.matches || !('IntersectionObserver' in window)) return;
  const figures = [...document.querySelectorAll('.stat__figure[data-i18n]')];
  if (!figures.length) return;
  const NUMBER = /[−-]?\d+(?:[.,]\d+)?/;
  const DURATION_MS = 1200;
  const frames = new Map();
  const done = new Set();

  function parse(text) {
    const match = text.match(NUMBER);
    if (!match) return null;
    const raw = match[0];
    const sign = /^[−-]/.test(raw) ? raw[0] : '';
    const digits = sign ? raw.slice(1) : raw;
    const sep = (digits.match(/[.,]/) || [''])[0];
    return {
      before: text.slice(0, match.index),
      after: text.slice(match.index + raw.length),
      sign, sep,
      decimals: sep ? digits.split(sep)[1].length : 0,
      value: parseFloat(digits.replace(',', '.'))
    };
  }

  function format(p, value) {
    let num = value.toFixed(p.decimals);
    if (p.sep) num = num.replace('.', p.sep);
    const sign = p.sign && Number(value.toFixed(p.decimals)) !== 0 ? p.sign : '';
    return p.before + sign + num + p.after;
  }

  const source = el => I18n.t(el.getAttribute('data-i18n'));

  const labels = figures.map(el => {
    const label = document.createElement('span');
    label.className = 'sr-only';
    el.before(label);
    el.setAttribute('aria-hidden', 'true');
    return label;
  });

  function reset() {
    frames.forEach(id => cancelAnimationFrame(id));
    frames.clear();
    figures.forEach((el, i) => {
      labels[i].textContent = source(el);
      const p = parse(source(el));
      if (p && !done.has(el)) el.textContent = format(p, 0);
    });
  }

  function run(el, delay) {
    const p = parse(source(el));
    done.add(el);
    if (!p) return;
    const start = performance.now() + delay;
    const tick = now => {
      const t = Math.min(1, Math.max(0, (now - start) / DURATION_MS));
      el.textContent = format(p, p.value * (1 - Math.pow(1 - t, 3)));
      if (t < 1) frames.set(el, requestAnimationFrame(tick));
      else frames.delete(el);
    };
    frames.set(el, requestAnimationFrame(tick));
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      run(entry.target, 200 + figures.indexOf(entry.target) * 120);
    });
  }, { threshold: 0.6 });

  document.addEventListener('i18n:change', reset);
  reset();
  figures.forEach(el => observer.observe(el));
}

// Escritorio: la línea que une los 4 pasos se dibuja y los números se encienden en orden.
function initStepsLine() {
  const list = document.querySelector('[data-steps]');
  if (!list) return;
  if (reducedMotion.matches || !('IntersectionObserver' in window)) { list.classList.add('is-drawn'); return; }
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    observer.disconnect();
    list.classList.add('is-drawn');
  }, { threshold: 0.3 });
  observer.observe(list);
}

// 06 · Para pacientes: el teléfono alterna entre pantallas mientras está a la vista.
// Se pausa con el botón, al pasar el mouse o al enfocarlo, y no corre con movimiento reducido.
function initScreenRotation() {
  const phone = document.querySelector('[data-rotate]');
  if (!phone || reducedMotion.matches || !('IntersectionObserver' in window)) return;
  const shots = [...phone.querySelectorAll('.phone__screen')];
  const toggle = document.querySelector('[data-rotate-toggle]');
  if (shots.length < 2) return;
  const INTERVAL_MS = 4000;
  let current = 0;
  let timer = null;
  let inView = false;
  let userPaused = false;
  let holding = false;

  function show(index) {
    current = (index + shots.length) % shots.length;
    shots.forEach((shot, i) => {
      shot.classList.toggle('is-active', i === current);
      if (i === current) shot.removeAttribute('aria-hidden');
      else shot.setAttribute('aria-hidden', 'true');
    });
  }

  function sync() {
    clearInterval(timer);
    timer = null;
    if (inView && !userPaused && !holding && !document.hidden) {
      timer = setInterval(() => show(current + 1), INTERVAL_MS);
    }
    if (toggle) {
      toggle.classList.toggle('is-paused', userPaused);
      toggle.setAttribute('aria-label', I18n.t(userPaused ? 'screens_play' : 'screens_pause'));
    }
  }

  phone.classList.add('is-rotating');
  show(0);

  if (toggle) {
    toggle.hidden = false;
    toggle.addEventListener('click', () => { userPaused = !userPaused; sync(); });
  }
  phone.addEventListener('mouseenter', () => { holding = true; sync(); });
  phone.addEventListener('mouseleave', () => { holding = false; sync(); });
  new IntersectionObserver(entries => {
    inView = entries[entries.length - 1].isIntersecting;
    sync();
  }, { threshold: 0.4 }).observe(phone);
  document.addEventListener('visibilitychange', sync);
  document.addEventListener('i18n:change', sync);
  sync();
}

// 07 · Prueba social: las citas llegan como mensajes de chat.
// Cada lado muestra "escribiendo…" antes de su burbuja: nutricionista → paciente → chips de confianza.
function initProofChat() {
  const section = document.querySelector('.proof');
  if (!section || reducedMotion.matches || !('IntersectionObserver' in window)) return;
  const messages = [...section.querySelectorAll('.proof__msg')];
  if (!messages.length || messages.some(msg => !msg.querySelector('.quote'))) return;

  const typings = messages.map(msg => {
    const typing = document.createElement('span');
    typing.className = 'proof__typing';
    typing.setAttribute('aria-hidden', 'true');
    typing.innerHTML = '<i></i><i></i><i></i>';
    msg.append(typing);
    return typing;
  });
  section.querySelectorAll('.proof__chip').forEach((chip, i) => chip.style.setProperty('--chip-i', i));
  section.classList.add('is-chat');

  const SEQUENCE = [
    ['is-nutri-typing', 0], ['is-nutri', 1200],
    ['is-patient-typing', 1800], ['is-patient', 3000],
    ['is-trust', 3600]
  ];
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    observer.disconnect();
    // La burbuja "escribiendo…" ocupa el lugar donde aparecerá la cita
    typings.forEach((typing, i) => { typing.style.top = `${messages[i].querySelector('.quote').offsetTop}px`; });
    SEQUENCE.forEach(([state, delay]) => setTimeout(() => section.classList.add(state), delay));
  }, { threshold: 0.35 });
  observer.observe(section);
}

// Los botones principales dentro del contenido dejan pasar un brillo una vez al aparecer.
function initButtonShine() {
  if (reducedMotion.matches || !('IntersectionObserver' in window)) return;
  const buttons = [...document.querySelectorAll('main .btn--primary')];
  if (!buttons.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      entry.target.classList.add('is-shine');
    });
  }, { threshold: 0.8 });
  buttons.forEach(btn => {
    btn.addEventListener('animationend', e => {
      if (e.pseudoElement === '::after') btn.classList.remove('is-shine');
    });
    observer.observe(btn);
  });
}

function initSteps() {
  const list = document.querySelector('[data-steps]');
  if (!list) return;
  const steps = [...list.querySelectorAll('.step')];
  const dots = [...document.querySelectorAll('.steps__dot')];
  let current = 0;

  function mark(index) {
    current = index;
    if (dots.length > 1) dots[0].parentElement.style.setProperty('--progress', index / (dots.length - 1));
    dots.forEach((dot, i) => {
      if (i === index) dot.setAttribute('aria-current', 'step');
      else dot.removeAttribute('aria-current');
    });
  }

  function goTo(index) {
    const step = steps[index];
    if (!step) return;
    const left = step.offsetLeft - list.offsetLeft - parseFloat(getComputedStyle(list).scrollPaddingLeft || 0);
    list.scrollTo({ left, behavior: scrollBehavior() });
    mark(index);
  }

  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

  let ticking = false;
  list.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const start = list.getBoundingClientRect().left;
      let best = 0;
      let bestDist = Infinity;
      steps.forEach((step, i) => {
        const dist = Math.abs(step.getBoundingClientRect().left - start - 24);
        if (dist < bestDist) { bestDist = dist; best = i; }
      });
      if (best !== current) mark(best);
      ticking = false;
    });
  }, { passive: true });

  steps.forEach((step, i) => step.addEventListener('focusin', () => mark(i)));
}

function initFAQ() {
  const root = document.querySelector('[data-faq]');
  if (!root) return;
  const items = [...root.querySelectorAll('.faq-item')];
  const chips = [...root.querySelectorAll('.chip')];
  const status = root.querySelector('[data-faq-status]');

  function setItem(item, open) {
    const button = item.querySelector('.faq-item__q');
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    const wasOpen = !panel.hidden;
    button.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
    if (open && !wasOpen && !reducedMotion.matches && panel.animate) {
      panel.animate(
        [{ height: '0px', opacity: 0, overflow: 'hidden' }, { height: `${panel.scrollHeight}px`, opacity: 1, overflow: 'hidden' }],
        { duration: 260, easing: 'cubic-bezier(.2, .7, .2, 1)' }
      );
    }
  }

  items.forEach(item => {
    item.querySelector('.faq-item__q').addEventListener('click', e => {
      const willOpen = e.currentTarget.getAttribute('aria-expanded') !== 'true';
      items.forEach(i => setItem(i, false));
      if (willOpen) setItem(item, true);
    });
  });

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const filter = chip.dataset.filter;
      chips.forEach(c => c.setAttribute('aria-pressed', String(c === chip)));
      let shown = 0;
      items.forEach(item => {
        const visible = filter === 'all' || item.dataset.category.split(' ').includes(filter);
        item.hidden = !visible;
        if (!visible) setItem(item, false);
        else shown += 1;
      });
      if (status) status.textContent = I18n.t('faq_status').replace('{n}', shown);
    });
  });
}

function initTermsToc() {
  const toc = document.querySelector('[data-toc]');
  if (!toc) return;
  const summary = toc.querySelector('summary');
  const links = [...toc.querySelectorAll('.toc__list a')];
  const desktop = window.matchMedia('(min-width: 1024px)');

  function syncMode() {
    if (desktop.matches) {
      toc.open = true;
      summary.setAttribute('tabindex', '-1');
    } else {
      summary.removeAttribute('tabindex');
      toc.open = false;
    }
  }
  summary.addEventListener('click', e => { if (desktop.matches) e.preventDefault(); });
  desktop.addEventListener('change', syncMode);
  syncMode();

  function activate(link) {
    links.forEach(a => {
      if (a === link) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }

  links.forEach(link => link.addEventListener('click', () => {
    activate(link);
    if (!desktop.matches) toc.open = false;
  }));

  const sections = links.map(a => document.getElementById(a.getAttribute('href').slice(1)));
  let ticking = false;
  let chosen = null;
  links.forEach((link, i) => link.addEventListener('click', () => { chosen = i; }));
  function sync() {
    ticking = false;
    const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
    if (atBottom && chosen !== null) { activate(links[chosen]); return; }
    let index = 0;
    sections.forEach((sec, i) => { if (sec && sec.getBoundingClientRect().top <= 120) index = i; });
    activate(links[index]);
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(sync); } }, { passive: true });
  sync();
}

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const card = form.querySelector('[data-form-card]');
  const sent = form.querySelector('[data-sent]');
  const sentText = form.querySelector('[data-sent-text]');
  const summary = form.querySelector('[data-error-summary]');
  const submit = form.querySelector('[data-submit]');
  const patientNote = form.querySelector('[data-patient-note]');

  const fields = [
    { key: 'name',     input: '#contact-name',     error: 'err-name',     msg: 'err_name',     label: 'form_name',
      valid: el => el.value.trim().length >= 2 },
    { key: 'lastname', input: '#contact-lastname', error: 'err-lastname', msg: 'err_lastname', label: 'form_lastname',
      valid: el => el.value.trim().length >= 2 },
    { key: 'email',    input: '#contact-email',    error: 'err-email',    msg: 'err_email',    label: 'form_email',
      valid: el => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(el.value.trim()) },
    { key: 'phone',    input: '#contact-phone',    error: 'err-phone',    msg: 'err_phone',    label: 'form_phone',
      valid: el => { const v = el.value.replace(/[\s-]/g, ''); return !v || /^(\+?51)?9\d{8}$/.test(v); } },
    { key: 'message',  input: '#contact-message',  error: 'err-message',  msg: 'err_message',  label: 'form_message',
      valid: el => el.value.trim().length >= 20 },
    { key: 'consent',  input: '#contact-consent',  error: 'err-consent',  msg: 'err_consent',  label: 'form_consent_label',
      valid: el => el.checked }
  ].map(f => ({ ...f, input: form.querySelector(f.input), errorEl: document.getElementById(f.error) }));

  function setError(field, show) {
    field.input.setAttribute('aria-invalid', String(show));
    field.errorEl.textContent = show ? I18n.t(field.msg) : '';
    field.shown = show;
  }

  function validate(field) {
    const ok = field.valid(field.input);
    setError(field, !ok);
    return ok;
  }

  function renderSummary(invalid) {
    const title = summary.querySelector('h3');
    const list = summary.querySelector('ul');
    title.textContent = (invalid.length === 1 ? I18n.t('summary_one') : I18n.t('summary_many')).replace('{n}', invalid.length);
    list.replaceChildren(...invalid.map(f => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${f.input.id}`;
      a.textContent = I18n.t(f.label);
      a.addEventListener('click', e => {
        e.preventDefault();
        f.input.focus();
        f.input.scrollIntoView({ block: 'center', behavior: scrollBehavior() });
      });
      li.append(a);
      return li;
    }));
    summary.hidden = false;
  }

  fields.forEach(field => {
    if (field.input.type === 'checkbox') {
      field.input.addEventListener('change', () => validate(field));
      return;
    }
    field.input.addEventListener('blur', () => {
      if (field.input.value.trim() || field.shown) validate(field);
    });
    field.input.addEventListener('input', () => { if (field.shown) validate(field); });
  });

  const radios = [...form.querySelectorAll('input[name="caso"]')];
  function syncCase() {
    const value = radios.find(r => r.checked)?.value;
    patientNote.hidden = value !== 'paciente';
  }
  radios.forEach(r => r.addEventListener('change', syncCase));
  const param = new URLSearchParams(location.search).get('rol');
  const map = { nutricionista: 'nutricionista', paciente: 'paciente', alianzas: 'alianzas', otro: 'alianzas' };
  if (map[param]) radios.find(r => r.value === map[param]).checked = true;
  syncCase();

  let sending = false;
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (sending) return;

    const invalid = fields.filter(f => !validate(f));
    if (invalid.length) {
      renderSummary(invalid);
      summary.focus();
      return;
    }
    summary.hidden = true;

    sending = true;
    submit.textContent = I18n.t('form_sending');
    submit.setAttribute('aria-disabled', 'true');
    const email = fields.find(f => f.key === 'email').input.value.trim();

    setTimeout(() => {
      sending = false;
      submit.removeAttribute('aria-disabled');
      submit.textContent = I18n.t('form_submit');
      sentText.textContent = I18n.t('sent_text').replace('{email}', email);
      sentText.dataset.email = email;
      card.hidden = true;
      sent.hidden = false;
      sent.querySelector('.sent__title').focus();
    }, 700);
  });

  form.querySelector('[data-again]').addEventListener('click', () => {
    form.reset();
    fields.forEach(f => setError(f, false));
    summary.hidden = true;
    radios[0].checked = true;
    syncCase();
    sent.hidden = true;
    card.hidden = false;
    fields[0].input.focus();
  });

  document.addEventListener('i18n:change', () => {
    fields.forEach(f => { if (f.shown) f.errorEl.textContent = I18n.t(f.msg); });
    if (!summary.hidden) renderSummary(fields.filter(f => f.shown));
    if (sentText.dataset.email) sentText.textContent = I18n.t('sent_text').replace('{email}', sentText.dataset.email);
  });
}
