/* Kiran Prasad Ravi, personal site.
   Small effects on top of the page. Nothing here is needed to read the site.
   - Everyone (unless "reduce motion" is on): keyword band speeds up while scrolling (and runs
     backwards when you scroll up), button ripple.
   - Desktop with a mouse only: cards tilt and glow, hero depth, cursor ring with a short tag
     (copy, email, PDF, open, skill group), sliding menu underline, skill chip wave, main buttons
     lean towards the pointer.
   If this file fails, the page still works. */
(function () {
  "use strict";
  var doc = document;
  var root = doc.documentElement;
  var reduce = root.classList.contains("reduce");
  var fine = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }

  // Order numbers for the skill chips (used by the stagger in the CSS). Works on every device.
  $$("#skill-cloud .chip").forEach(function (c, i) { c.style.setProperty("--k", i); });

  if (reduce) return;

  /* ---------- Keyword band: faster while you scroll, and it runs backwards when you scroll up ---------- */
  (function () {
    var band = doc.getElementById("marquee");
    var track = band && band.querySelector(".marquee-track");
    if (!track || !track.getAnimations) return;
    var anim = track.getAnimations()[0];
    if (!anim) return;
    var rate = 1, y = window.pageYOffset || 0, lastY = y, vel = 0, raf = 0, visible = false;
    // Runs only while the page scrolls and until the band is back to its normal speed
    function loop() {
      raf = 0;
      vel = vel * 0.88 + (y - lastY) * 0.12;
      lastY = y;
      var target = (vel < -0.6 ? -1 : 1) * (1 + Math.min(Math.abs(vel), 50) * 0.1);
      rate += (target - rate) * 0.1;
      if (Math.abs(vel) < 0.05 && Math.abs(rate - 1) < 0.01) { rate = 1; anim.playbackRate = 1; return; }
      anim.playbackRate = rate;
      raf = requestAnimationFrame(loop);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(loop); }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(band);
    }
    window.addEventListener("scroll", function () {
      y = window.pageYOffset || 0;
      if (visible) kick(); else lastY = y;
    }, { passive: true });
  })();

  /* ---------- Ripple on buttons (tap or click) ---------- */
  doc.addEventListener("pointerdown", function (e) {
    var t = e.target.closest && e.target.closest(".btn, .fbtn, .mode-btn");
    if (!t || t.disabled) return;
    var r = t.getBoundingClientRect();
    var d = Math.max(r.width, r.height) * 2;
    var s = doc.createElement("span");
    s.className = "ripple";
    s.style.width = s.style.height = d + "px";
    s.style.left = (e.clientX - r.left - d / 2) + "px";
    s.style.top = (e.clientY - r.top - d / 2) + "px";
    t.appendChild(s);
    setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 700);
  }, { passive: true });

  if (!fine) return;

  /* ---------- Cards: soft light and tilt ---------- */
  function bindCard(el, tilt) {
    var raf = 0, ev = null, resetTimer = 0;
    el.classList.add("spot");
    el.addEventListener("pointermove", function (e) {
      ev = e;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var r = el.getBoundingClientRect();
        var x = ev.clientX - r.left, y = ev.clientY - r.top;
        el.style.setProperty("--mx", x + "px");
        el.style.setProperty("--my", y + "px");
        if (tilt && el.classList.contains("in")) {
          clearTimeout(resetTimer);
          var px = x / r.width - 0.5, py = y / r.height - 0.5;
          el.classList.add("tilting");
          el.style.transform = "perspective(900px) rotateX(" + (-py * 5).toFixed(2) + "deg) rotateY(" + (px * 6).toFixed(2) + "deg) translateY(-3px)";
        }
      });
    });
    el.addEventListener("pointerleave", function () {
      if (!tilt) return;
      el.style.transform = "";
      clearTimeout(resetTimer);
      resetTimer = setTimeout(function () { el.classList.remove("tilting"); }, 450);
    });
  }
  $$(".proj, .pillar, .panel").forEach(function (el) { bindCard(el, true); });
  $$(".glance > div").forEach(function (el) { bindCard(el, false); });

  /* ---------- Main buttons lean towards the pointer ---------- */
  $$(".btn-primary").forEach(function (b) {
    b.addEventListener("pointermove", function (e) {
      var r = b.getBoundingClientRect();
      var x = (e.clientX - (r.left + r.width / 2)) / r.width;
      var y = (e.clientY - (r.top + r.height / 2)) / r.height;
      b.style.transform = "translate(" + (x * 8).toFixed(1) + "px," + (y * 6).toFixed(1) + "px)";
    });
    b.addEventListener("pointerleave", function () { b.style.transform = ""; });
  });

  /* ---------- Hero depth: card and name move a little with the mouse ---------- */
  (function () {
    var hero = doc.getElementById("home");
    if (!hero) return;
    // The values go only on the two elements that move, so the rest of the hero is not restyled.
    var movers = $$(".hero h1, .hero .titleblock", hero);
    var x = 0, y = 0, tx = 0, ty = 0, raf = 0;
    function step() {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      for (var i = 0; i < movers.length; i++) {
        movers[i].style.setProperty("--px", x.toFixed(3));
        movers[i].style.setProperty("--py", y.toFixed(3));
      }
      raf = (Math.abs(tx - x) > 0.002 || Math.abs(ty - y) > 0.002) ? requestAnimationFrame(step) : 0;
    }
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(step);
    });
    hero.addEventListener("pointerleave", function () { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(step); });
  })();

  /* ---------- Cursor ring ---------- */
  (function () {
    var ring = doc.createElement("div");
    ring.className = "cursor-ring";
    ring.setAttribute("aria-hidden", "true");
    var tag = doc.createElement("span");
    tag.className = "cursor-tag";
    ring.appendChild(tag);
    doc.body.appendChild(ring);
    var cx = 0, cy = 0, tx = 0, ty = 0, raf = 0, seen = false, lastT = null;
    function T(k, en) { return window.kprT ? window.kprT(k, en) : en; }
    // A short tag next to the ring says what a click will do: copy, email, PDF, open in a new tab.
    // Over a skill it shows the skill's group.
    function tagFor(t) {
      var el = t.closest && t.closest("a, button, #skill-cloud .chip");
      if (!el) return null;
      if (el.id === "copy-email") return { text: T("js.tag.copy", "Copy") };
      if (el.tagName === "A") {
        var href = el.getAttribute("href") || "";
        if (href.indexOf("mailto:") === 0) return { text: T("js.tag.mail", "Email") };
        if (el.hasAttribute("download") || /\.pdf$/i.test(href)) return { text: "PDF ↓" };
        if (el.target === "_blank") return { text: T("js.tag.open", "Open") + " ↗" };
        return null;
      }
      if (el.classList.contains("chip")) {
        var cat = el.getAttribute("data-cat"), b = cat && doc.querySelector('#skill-filters [data-filter="' + cat + '"]');
        return b ? { text: b.textContent, color: "var(--c-" + cat + ")" } : null;
      }
      return null;
    }
    doc.addEventListener("kpr:lang", function () { lastT = null; });
    function step() {
      cx += (tx - cx) * 0.22;
      cy += (ty - cy) * 0.22;
      ring.style.transform = "translate3d(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px,0)";
      raf = (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) ? requestAnimationFrame(step) : 0;
    }
    doc.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      tx = e.clientX; ty = e.clientY;
      if (!seen) { cx = tx; cy = ty; seen = true; }
      ring.classList.add("on");
      var t = e.target;
      var text = t.closest && t.closest("input, textarea");
      var link = t.closest && t.closest("a, button, [role='radio'], select, label, .notch, .ruler");
      ring.classList.toggle("is-text", !!text);
      // over the truck drawing the CAD crosshair takes over
      ring.classList.toggle("is-cad", !!(t.closest && t.closest(".drive-canvas")));
      ring.classList.toggle("is-link", !!link && !text);
      if (t !== lastT) {
        lastT = t;
        var info = text ? null : tagFor(t);
        ring.classList.toggle("has-tag", !!info);
        if (info) {
          tag.textContent = info.text;
          if (info.color) tag.style.setProperty("--tc", info.color); else tag.style.removeProperty("--tc");
        }
      }
      if (!raf) raf = requestAnimationFrame(step);
    }, { passive: true });
    doc.addEventListener("pointerdown", function () { ring.classList.add("is-down"); }, { passive: true });
    doc.addEventListener("pointerup", function () { ring.classList.remove("is-down"); }, { passive: true });
    root.addEventListener("mouseleave", function () { ring.classList.remove("on"); });
    root.addEventListener("mouseenter", function () { if (seen) ring.classList.add("on"); });
  })();

  /* ---------- Menu underline that slides between links ---------- */
  (function () {
    var nav = doc.getElementById("nav");
    if (!nav || !window.MutationObserver) return;
    var ind = doc.createElement("span");
    ind.className = "nav-ind";
    ind.setAttribute("aria-hidden", "true");
    nav.appendChild(ind);
    nav.classList.add("has-ind");
    var links = $$("a", nav);
    var shown = false;
    function place() {
      var cur = links.filter(function (a) { return a.classList.contains("is-current"); })[0];
      if (!cur || !cur.offsetWidth) { ind.style.opacity = "0"; shown = false; return; }
      var w = Math.max(0, cur.offsetWidth - 24) + "px";
      var tr = "translateX(" + (cur.offsetLeft + 12) + "px)";
      if (!shown) {
        ind.style.transition = "opacity .3s";
        ind.style.width = w;
        ind.style.transform = tr;
        void ind.offsetWidth;
        ind.style.opacity = "1";
        shown = true;
        setTimeout(function () { ind.style.transition = ""; }, 320);
      } else {
        ind.style.transition = "";
        ind.style.width = w;
        ind.style.transform = tr;
      }
    }
    new MutationObserver(place).observe(nav, { attributes: true, attributeFilter: ["class"], subtree: true });
    window.addEventListener("resize", place);
    doc.addEventListener("kpr:lang", function () { setTimeout(place, 0); });
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(place);
    place();
  })();

  /* ---------- Skill chips: a wave that follows the mouse ---------- */
  (function () {
    var cloud = doc.getElementById("skill-cloud");
    if (!cloud) return;
    var raf = 0, mx = 0, my = 0, active = false;
    function frame() {
      raf = 0;
      if (!active) return;
      var chips = $$(".chip:not(.is-gone)", cloud), i, c, r, rects = [];
      for (i = 0; i < chips.length; i++) rects.push(chips[i].getBoundingClientRect());
      for (i = 0; i < chips.length; i++) {
        c = chips[i]; r = rects[i];
        var dx = mx - (r.left + r.width / 2), dy = my - (r.top + r.height / 2);
        var f = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 130);
        f = f * f;
        c.style.transform = f > 0.01 ? "translateY(" + (-7 * f).toFixed(1) + "px) scale(" + (1 + 0.16 * f).toFixed(3) + ")" : "";
      }
    }
    cloud.addEventListener("pointermove", function (e) {
      mx = e.clientX; my = e.clientY; active = true;
      if (!raf) raf = requestAnimationFrame(frame);
    });
    cloud.addEventListener("pointerleave", function () {
      active = false;
      $$(".chip", cloud).forEach(function (c) { c.style.transform = ""; });
    });
  })();
})();
