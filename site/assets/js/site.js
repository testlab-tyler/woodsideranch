/* Woodside Ranch — the only script on the site.
   Three jobs: the header's state over a hero, the full-screen mobile menu, and
   the document filter. Every page works with this file absent. */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- header */
  var header = document.querySelector('.header--over');
  var hero = document.querySelector('.hero');
  if (header && hero && 'IntersectionObserver' in window) {
    /* While any hero remains below the header, the type is on the image and the
       header stays transparent. Inset by the header's own height. */
    new IntersectionObserver(function (entries) {
      header.classList.toggle('is-past', !entries[0].isIntersecting);
    }, { rootMargin: '-76px 0px 0px 0px', threshold: 0 }).observe(hero);
  } else if (header) {
    header.classList.add('is-past');   /* no observer: legible beats pretty */
  }

  /* ------------------------------------------------------------- mobile nav */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');
  var close = nav && nav.querySelector('.nav__close');

  if (toggle && nav) {
    var setOpen = function (open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('is-locked', open);
      if (open) {
        var first = nav.querySelector('.nav__close, a');
        if (first) first.focus();
      }
    };

    toggle.addEventListener('click', function () {
      setOpen(!nav.classList.contains('is-open'));
    });
    if (close) close.addEventListener('click', function () { setOpen(false); toggle.focus(); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    /* Following a link should close the overlay — same-page anchors would
       otherwise leave it covering the thing you just jumped to. */
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    var mq = window.matchMedia('(min-width: 941px)');
    var onChange = function () { if (mq.matches) setOpen(false); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else mq.addListener(onChange);
  }

  /* -------------------------------------------------------- document filter */
  var filters = document.querySelector('[data-doc-filters]');
  if (filters) {
    var docs = Array.prototype.slice.call(document.querySelectorAll('[data-doc-group]'));
    var groups = Array.prototype.slice.call(document.querySelectorAll('[data-doc-section]'));
    var empty = document.querySelector('[data-doc-empty]');

    var apply = function (want) {
      docs.forEach(function (d) {
        d.hidden = !(want === 'all' || d.getAttribute('data-doc-group') === want);
      });
      /* hide a section heading once every row under it is filtered out */
      groups.forEach(function (sec) {
        var rows = sec.querySelectorAll('[data-doc-group]');
        var visible = Array.prototype.filter.call(rows, function (r) { return !r.hidden; });
        sec.hidden = visible.length === 0;
      });
      var anyVisible = docs.some(function (d) { return !d.hidden; });
      if (empty) empty.hidden = anyVisible;
    };

    filters.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-filter]');
      if (!btn) return;
      Array.prototype.forEach.call(filters.querySelectorAll('[data-filter]'), function (b) {
        b.setAttribute('aria-pressed', String(b === btn));
      });
      apply(btn.getAttribute('data-filter'));
    });
  }

  /* ------------------------------------------------- app store, by platform */
  /* Send people to the store their phone can actually install from. Anything
     we cannot identify — including every desktop — keeps the web link. */
  Array.prototype.forEach.call(document.querySelectorAll('[data-app-ios]'), function (el) {
    var ua = navigator.userAgent || '';
    var isIOS = /iPad|iPhone|iPod/.test(ua) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); /* iPadOS */
    var isAndroid = /Android/.test(ua);
    var href = isIOS ? el.getAttribute('data-app-ios')
             : isAndroid ? el.getAttribute('data-app-android')
             : null;
    if (!href) return;
    el.setAttribute('href', href);
    var label = el.querySelector('[data-app-label]');
    if (label) label.textContent = isIOS ? 'Get it on the App Store' : 'Get it on Google Play';
  });
})();
