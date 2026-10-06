  initFAQ();
  initPageScroll();
  initTermsToc();
function initPageScroll() {
  if (!document.body.classList.contains('snap-page')) return;

  const enabled = window.matchMedia('(min-width: 1101px) and (min-height: 640px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const ANIMATION_MS = 850;   // time the page is locked while it moves
  const GESTURE_GAP_MS = 180; // silence needed to consider the next wheel event a new gesture

  let lockedUntil = 0;
  let lastWheel = 0;
  let waitNewGesture = false;

  function getStops() {
    const nav = navHeight();
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const list = [0, max];

    document.querySelectorAll('.snap-section, .terms-section').forEach(el => {
      const top = el.getBoundingClientRect().top + window.scrollY - nav;
      if (el.matches('[data-showcase]')) {
        const steps = el.querySelectorAll('.sc-item').length;
        const travel = el.offsetHeight - (window.innerHeight - nav);
        for (let i = 0; i < steps; i++) list.push(top + (steps > 1 ? travel * i / (steps - 1) : 0));
      } else {
        list.push(top);
      }
    });

    return [...new Set(list.map(y => Math.round(Math.min(Math.max(y, 0), max))))].sort((a, b) => a - b);
  }

  function move(dir) {
    const y = window.scrollY;
    const screen = window.innerHeight - navHeight();
    const stops = getStops();
    let target;

    if (dir > 0) {
      const next = stops.find(s => s > y + 4);
      if (next === undefined) return false;
      target = next - y > screen + 4 ? y + screen * 0.9 : next;
    } else {
      const prev = [...stops].reverse().find(s => s < y - 4);
      if (prev === undefined) return false;
      target = y - prev > screen + 4 ? y - screen * 0.9 : prev;
    }

    lockedUntil = performance.now() + ANIMATION_MS;
    window.scrollTo({ top: target, behavior: reduced.matches ? 'auto' : 'smooth' });
    return true;
  }

  function shouldHandle(target) {
    if (!enabled.matches || document.body.classList.contains('menu-open')) return false;
    return !(target instanceof Element && target.closest('input, textarea, select, [contenteditable="true"]'));
  }

  window.addEventListener('wheel', e => {
    if (!shouldHandle(e.target) || e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    e.preventDefault();

    const now = performance.now();
    const isNewGesture = now - lastWheel > GESTURE_GAP_MS;
    lastWheel = now;

    if (isNewGesture) waitNewGesture = false;
    if (now < lockedUntil || waitNewGesture || Math.abs(e.deltaY) < 2) return;

    if (move(Math.sign(e.deltaY))) waitNewGesture = true; // ignore the rest of this swipe (trackpad inertia)
  }, { passive: false });

  document.addEventListener('keydown', e => {
    if (!shouldHandle(e.target) || e.altKey || e.ctrlKey || e.metaKey) return;
    const down = ['ArrowDown', 'PageDown'].includes(e.key) || (e.key === ' ' && !e.shiftKey);
    const up   = ['ArrowUp', 'PageUp'].includes(e.key)   || (e.key === ' ' && e.shiftKey);
    if (!down && !up) return;
    if (e.key === ' ' && e.target instanceof Element && e.target.closest('button, a')) return;
    e.preventDefault();
    if (performance.now() < lockedUntil) return;
    move(down ? 1 : -1);
  });
}

function initFAQ() {
  document.querySelectorAll('.faq').forEach(faq => {
    const items = faq.querySelectorAll('.faq-item');
    const chips = faq.querySelectorAll('.filter-chip');

    function setItem(item, open) {
      item.classList.toggle('is-open', open);
      item.querySelector('.faq-item__question')?.setAttribute('aria-expanded', String(open));
    }

    items.forEach(item => {
      item.querySelector('.faq-item__question')?.addEventListener('click', () => {
        const willOpen = !item.classList.contains('is-open');
        items.forEach(i => setItem(i, false));
        if (willOpen) setItem(item, true);
      });
    });

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const filter = chip.dataset.filter;

        chips.forEach(c => {
          const active = c === chip;
          c.classList.toggle('is-active', active);
          c.setAttribute('aria-pressed', String(active));
        });

        items.forEach(item => {
          const categories = (item.dataset.category || '').split(' ');
          const visible = filter === 'all' || categories.includes(filter);
          item.hidden = !visible;
          if (!visible) setItem(item, false);
        });
      });
    });
  });
}

function initTermsToc() {
  const links = document.querySelectorAll('.toc__list a');
  if (!links.length || !('IntersectionObserver' in window)) return;

  const byId = new Map([...links].map(a => [a.getAttribute('href').slice(1), a]));

  function activate(link) {
    links.forEach(a => {
      a.classList.toggle('is-active', a === link);
      if (a === link) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) activate(byId.get(entry.target.id));
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  byId.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });

  links.forEach(link => link.addEventListener('click', () => activate(link)));
  initHeroCarousel();
function initHeroCarousel() {
  const root = document.querySelector('[data-carousel]');
  if (!root) return;

  const track  = root.querySelector('.hero__track');
  const slides = [...root.querySelectorAll('.hero__slide')];
  const dots   = [...root.querySelectorAll('.hero__dot')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compact = window.matchMedia('(max-width: 1100px)');
  const viewport = root.querySelector('.hero__viewport');
  const AUTOPLAY_MS = 7000;

  let index = 0;
  let timer = null;
  let hovering = false;
  let focusInside = false;
  let inView = true;
  let videoStarted = false;
  let wheelLockedUntil = 0;

  function canAutoplay() {
    return !reduced.matches && !hovering && !focusInside && inView && !videoStarted
      && document.visibilityState === 'visible';
  }

  function restart() {
    clearTimeout(timer);
    if (canAutoplay()) timer = setTimeout(() => go(index + 1), AUTOPLAY_MS);
  }

  function fitHeight() {
    if (!viewport) return;
    viewport.style.height = compact.matches ? `${slides[index].offsetHeight}px` : '';
  }

  function pauseVideos() {
    root.querySelectorAll('.hero__video iframe').forEach(frame => {
      frame.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }), '*');
    });
  }

  function go(next, byUser = false) {
    index = (next + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    slides.forEach((slide, i) => {
      const on = i === index;
      slide.classList.toggle('is-active', on);
      slide.setAttribute('aria-hidden', String(!on));
      slide.inert = !on;
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === index);
      if (i === index) dot.setAttribute('aria-current', 'true'); else dot.removeAttribute('aria-current');
    });
    track.setAttribute('aria-live', byUser ? 'polite' : 'off');
    if (byUser) pauseVideos();
    fitHeight();
    restart();
  }

  root.querySelector('.hero__arrow--prev')?.addEventListener('click', () => go(index - 1, true));
  root.querySelector('.hero__arrow--next')?.addEventListener('click', () => go(index + 1, true));
  dots.forEach((dot, i) => dot.addEventListener('click', () => go(i, true)));

  root.querySelectorAll('[data-hero-go]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      go(Number(link.dataset.heroGo), true);
    });
  });

  const HOVER_ZONES = '.hero__content, .hero__video-inner, .hero__arrow, .hero__dots';
  root.addEventListener('mouseover', e => {
    const over = e.target instanceof Element && Boolean(e.target.closest(HOVER_ZONES));
    if (over === hovering) return;
    hovering = over;
    if (over) clearTimeout(timer); else restart();
  });
  root.addEventListener('mouseleave', () => { hovering = false; restart(); });

  root.addEventListener('focusin', e => {
    if (e.target instanceof Element && e.target.matches(':focus-visible')) { focusInside = true; clearTimeout(timer); }
  });
  root.addEventListener('focusout', e => {
    if (!root.contains(e.relatedTarget)) { focusInside = false; restart(); }
  });

  compact.addEventListener('change', fitHeight);
  window.addEventListener('resize', fitHeight);
  document.addEventListener('i18n:change', fitHeight);
  window.addEventListener('load', fitHeight);

  root.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); go(index - 1, true); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1, true); }
  });

  let startX = 0;
  let startY = 0;
  root.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });
  root.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1), true);
  }, { passive: true });

  root.addEventListener('wheel', e => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 20) return;
    e.preventDefault();
    if (performance.now() < wheelLockedUntil) return;
    wheelLockedUntil = performance.now() + 900;
    go(index + (e.deltaX > 0 ? 1 : -1), true);
  }, { passive: false });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      restart();
    }, { threshold: 0.5 }).observe(root);
  }
  document.addEventListener('visibilitychange', restart);

  root.querySelectorAll('.hero__video').forEach(box => {
    const id = (box.dataset.youtubeId || '').trim();
    const button = box.querySelector('.hero__video-play');
    const label = box.querySelector('.hero__video-label');
    if (!id || !button) return;

    button.disabled = false;
    label?.setAttribute('data-i18n', 'video_play');
    if (label) label.textContent = I18n.t('video_play');

    button.addEventListener('click', () => {
      const frame = document.createElement('iframe');
      frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&enablejsapi=1`;
      frame.title = I18n.t(box.dataset.videoTitleKey || 'video_play');
      frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      frame.allowFullscreen = true;
      box.replaceChildren(frame);
      videoStarted = true;
      clearTimeout(timer);
    });
  });

  go(0);
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
