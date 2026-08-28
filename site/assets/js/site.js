/* Woodside Ranch — the only script on the site.
   Three jobs: the header's state over a hero, the full-screen mobile menu, and
   the document filter. Every page works with this file absent. */
(function () {
  'use strict';

  document.documentElement.classList.add('has-js');

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

  /* ---------------------------------------------------------- compact nav */
  /* Switch to the drawer when the nav actually stops fitting, rather than at a
     breakpoint guessed in advance. Content width moves with the font swap and
     with any link the board renames later, so measure it. */
  var headerEl = document.querySelector('.header');
  var inner = document.querySelector('.header__inner');
  var brand = document.querySelector('.brand');
  var navEl = document.getElementById('primary-nav');

  function fitNav() {
    if (!headerEl || !inner || !brand || !navEl) return;
    if (navEl.classList.contains('is-open')) return;   /* never yank an open menu */

    /* Measure in the roomy state, then decide. Both happen in one synchronous
       block, so the browser never paints the intermediate layout. */
    headerEl.classList.remove('is-compact');
    var available = inner.clientWidth;
    var gap = parseFloat(getComputedStyle(inner).columnGap) || 32;
    var needed = brand.offsetWidth + navEl.scrollWidth + gap;
    if (needed > available) headerEl.classList.add('is-compact');
  }

  fitNav();
  window.addEventListener('resize', fitNav, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitNav);
  if ('ResizeObserver' in window && inner) new ResizeObserver(fitNav).observe(inner);

  /* ------------------------------------------------------------- mobile nav */
  var header0 = document.querySelector('.header');
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

    /* Close the drawer the moment the nav fits again, whatever width that is. */
    window.addEventListener('resize', function () {
      if (nav.classList.contains('is-open') && !header0.classList.contains('is-compact')) setOpen(false);
    }, { passive: true });
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

  /* ------------------------------------------------------- reveal on scroll */
  /* Stagger cards within a row so a grid arrives as a row, not all at once. */
  Array.prototype.forEach.call(document.querySelectorAll('.grid, .cal, .doc-list'), function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      if (!child.hasAttribute('data-reveal')) child.setAttribute('data-reveal', '');
      child.setAttribute('data-reveal-delay', String(i % 4));
    });
  });

  /* Arm ONLY what is below the fold. Everything already on screen stays as it
     is — no hidden state means no way to get stuck hidden. */
  var armed = [];
  Array.prototype.forEach.call(document.querySelectorAll('[data-reveal]'), function (el) {
    if (el.getBoundingClientRect().top >= window.innerHeight) {
      el.classList.add('will-reveal');
      armed.push(el);
    }
  });

  if (armed.length) {
    var show = function (el) { el.classList.add('is-in'); };
    var sweep = function () {
      for (var i = armed.length - 1; i >= 0; i--) {
        var el = armed[i], b = el.getBoundingClientRect();
        if (b.top < window.innerHeight && b.bottom > 0) { show(el); armed.splice(i, 1); }
      }
    };

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          show(en.target);
          io.unobserve(en.target);
          var k = armed.indexOf(en.target); if (k > -1) armed.splice(k, 1);
        });
      }, { rootMargin: '0px', threshold: 0 });
      armed.slice().forEach(function (el) { io.observe(el); });
    }

    /* Scroll and resize always fire, so correctness rests on these. */
    window.addEventListener('scroll', sweep, { passive: true });
    window.addEventListener('resize', sweep, { passive: true });
    window.addEventListener('load', sweep);
    setTimeout(sweep, 800);
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
