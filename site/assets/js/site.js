/* Woodside Ranch — the only script on the site.
   One job: the mobile menu. Everything else works with this file absent. */
(function () {
  'use strict';

  /* A transparent header over the hero must stop being white-on-white the
     moment it leaves the image. Sentinel + IntersectionObserver so nothing
     runs on the main thread while scrolling. */
  var header = document.querySelector('.header--over');
  var hero = document.querySelector('.hero');
  if (header && hero && 'IntersectionObserver' in window) {
    /* Watch the hero itself, inset from the top by the header's own height:
       while any hero remains below the header the type is on the image, so the
       header stays transparent. A zero-height sentinel cannot express this —
       it only reports the instant it crosses the line. */
    new IntersectionObserver(function (entries) {
      header.classList.toggle('is-past', !entries[0].isIntersecting);
    }, { rootMargin: '-76px 0px 0px 0px', threshold: 0 }).observe(hero);
  } else if (header) {
    header.classList.add('is-past');   /* no observer: legible beats pretty */
  }

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');
  if (!toggle || !nav) return;

  function setOpen(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  }

  /* Click, never hover — hover menus are unusable with a tremor or a trackpad,
     and invisible on touch. */
  toggle.addEventListener('click', function () {
    setOpen(!nav.classList.contains('is-open'));
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

  /* Resizing past the breakpoint must not leave the menu stuck open. */
  var mq = window.matchMedia('(min-width: 941px)');
  var onChange = function () { if (mq.matches) setOpen(false); };
  if (mq.addEventListener) mq.addEventListener('change', onChange);
  else mq.addListener(onChange);
})();
