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
}
