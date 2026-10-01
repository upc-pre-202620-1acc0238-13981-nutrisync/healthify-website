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
}
