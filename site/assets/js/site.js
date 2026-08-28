/* Woodside Ranch — minimal progressive enhancement.
   Two jobs: frost the header once it leaves the hero, and run the mobile menu.
   Everything on the site works with this file absent. */
(function () {
  'use strict';

  /* Header frosts on scroll. IntersectionObserver on a sentinel beats a scroll
     handler — no work on the main thread while scrolling. */
  var header = document.querySelector('.header');
  var sentinel = document.querySelector('[data-stuck-sentinel]');

  if (header && sentinel && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      header.classList.toggle('is-stuck', !entries[0].isIntersecting);
    }, { rootMargin: '-8px 0px 0px 0px', threshold: 0 }).observe(sentinel);
  }

  /* Mobile menu. Click to open — never hover, which is unusable with a tremor
     or a trackpad, and invisible on touch. */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');

  if (toggle && nav) {
    var setOpen = function (open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    };

    toggle.addEventListener('click', function () {
      setOpen(nav.classList.contains('is-open') === false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('is-open')) return;
      if (!nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });

    /* A resize past the breakpoint must not leave the menu in a stuck state. */
    var mq = window.matchMedia('(min-width: 901px)');
    (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(function () {
      if (mq.matches) setOpen(false);
    });
  }
})();
