  initShowcases();
function navHeight() {
  return document.querySelector('.site-header')?.offsetHeight || 0;
}

function initShowcases() {
  const sections = document.querySelectorAll('[data-showcase]');
  if (!sections.length) return;

  const desktop = window.matchMedia('(min-width: 1101px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  const instances = [...sections].map(section => {
    const items  = [...section.querySelectorAll('.sc-item')];
    const visual = section.querySelector('.showcase__visual');
    const home   = section.querySelector('.showcase__visual-slot');
    const views  = visual ? [...visual.querySelectorAll('[data-visual]')] : [];
    const count  = section.querySelector('[data-showcase-count]');
    const dots   = [...section.querySelectorAll('.showcase__dots i')];
    let active = -1;

    section.style.setProperty('--steps', String(items.length));

    function placeVisual() {
      if (!visual || active < 0) return;
      const target = desktop.matches ? home : items[active].querySelector('.sc-item__visual-slot');
      if (target && visual.parentElement !== target) target.appendChild(visual);
    }

    function setActive(index) {
      if (index === active) return;
      active = index;
      items.forEach((item, i) => {
        const on = i === index;
        item.classList.toggle('is-active', on);
        item.querySelector('.sc-item__head')?.setAttribute('aria-expanded', String(on));
      });
      const key = items[index].dataset.visual;
      views.forEach(view => view.classList.toggle('is-active', view.dataset.visual === key));
      if (count) count.textContent = String(index + 1).padStart(2, '0');
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
      placeVisual();
    }

    function travel() {
      return section.offsetHeight - (window.innerHeight - navHeight());
    }

    function syncWithScroll() {
      if (!desktop.matches) return;
      const distance = travel();
      if (distance <= 0) return;
      const progress = (navHeight() - section.getBoundingClientRect().top) / distance;
      const clamped = Math.min(Math.max(progress, 0), 0.9999);
      setActive(Math.floor(clamped * items.length));
    }

    function scrollToStep(index) {
      const top = section.getBoundingClientRect().top + window.scrollY - navHeight()
                + travel() * ((index + 0.5) / items.length);
      window.scrollTo({ top, behavior: reduced.matches ? 'auto' : 'smooth' });
    }

    items.forEach((item, i) => {
      item.querySelector('.sc-item__head')?.addEventListener('click', () => {
        if (desktop.matches) scrollToStep(i); else setActive(i);
      });
    });

    setActive(0);
    syncWithScroll();
    return { placeVisual, syncWithScroll };
  });

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      instances.forEach(s => s.syncWithScroll());
      ticking = false;
    });
  }, { passive: true });

  desktop.addEventListener('change', () => instances.forEach(s => { s.placeVisual(); s.syncWithScroll(); }));
}
