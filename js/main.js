  initFAQ();
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
