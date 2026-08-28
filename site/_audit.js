/* Dev-only contrast auditor. Not linked from any page; loaded manually during
   review to catch text that renders too close to the surface behind it. */
window.__audit = function () {
  var lum = function (c) {
    var m = c.match(/[\d.]+/g); if (!m) return null;
    var r = +m[0], g = +m[1], b = +m[2], a = m.length > 3 ? +m[3] : 1;
    if (a === 0) return null;
    var f = function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  var bgOf = function (el) {
    var n = el;
    while (n && n !== document.documentElement) {
      var c = getComputedStyle(n).backgroundColor;
      var m = c.match(/[\d.]+/g);
      if (m && (m.length < 4 || +m[3] > 0.5)) return c;
      n = n.parentElement;
    }
    return 'rgb(252,252,247)';
  };
  var bad = [], skipped = 0;
  document.querySelectorAll('a,p,h1,h2,h3,span,button,li,time,strong').forEach(function (el) {
    if (!el.textContent.trim()) return;
    /* A transparent header sits over a photograph, so there is no opaque
       surface to compare against and walking up finds the page ground —
       a false failure. Those are measured against the image itself. */
    if (el.closest('.header--over:not(.is-past)')) { skipped++; return; }
    var ownText = Array.prototype.some.call(el.childNodes, function (n) {
      return n.nodeType === 3 && n.textContent.trim();
    });
    if (el.children.length && !ownText) return;
    var cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.1) return;
    var r = el.getBoundingClientRect(); if (!r.width || !r.height) return;
    var fg = lum(cs.color), bg = lum(bgOf(el));
    if (fg === null || bg === null) return;
    var ratio = (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
    var size = parseFloat(cs.fontSize);
    var large = size >= 24 || (size >= 18.66 && +cs.fontWeight >= 700);
    var need = large ? 3 : 4.5;
    if (ratio < need) bad.push({
      text: el.textContent.trim().slice(0, 38),
      cls: (el.className || '').toString().slice(0, 28),
      color: cs.color, bg: bgOf(el), size: cs.fontSize,
      ratio: +ratio.toFixed(2), need: need
    });
  });
  return { page: location.pathname, failures: bad.length, skippedOverImage: skipped, items: bad.slice(0, 10) };
};
