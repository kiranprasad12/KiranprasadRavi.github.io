/* Kiran Prasad Ravi, personal site.
   Plain JavaScript, no libraries. Every feature fails quietly: if something
   is missing, the page still reads as a normal static page. */
(function () {
  "use strict";
  window.__kpr = true;

  var doc = document;
  var root = doc.documentElement;
  var reduce = root.classList.contains("reduce");

  function T(k, en) { return window.kprT ? window.kprT(k, en) : en; }
  function onLang(fn) { doc.addEventListener("kpr:lang", fn); }

  var EMAIL = "kiranprasad200112@gmail.com";
  var GITHUB_USER = "kiranprasad12";

  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function headerH() { return parseInt(getComputedStyle(root).getPropertyValue("--header-h"), 10) || 64; }

  /* ---------- Sizes and positions, measured when the page changes, not on every frame ---------- */
  // Asking for a position right after something on the page has moved makes the browser redo its
  // layout in the middle of a frame, which makes scrolling stutter on phones. So the scroll code
  // reads these stored numbers. They are measured again when the window or the page changes size.
  var geo = { y: window.pageYOffset || 0, vw: window.innerWidth, vh: window.innerHeight, max: 1, hh: 64 };
  var geoFns = [];
  // Position in the page without transforms, so a card that is still sliding in does not count
  function docTop(el) { var t = 0; while (el) { t += el.offsetTop; el = el.offsetParent; } return t; }
  function measure() {
    geo.y = window.pageYOffset || 0;
    geo.vw = window.innerWidth; geo.vh = window.innerHeight;
    geo.max = Math.max(1, root.scrollHeight - geo.vh);
    geo.hh = headerH();
    for (var i = 0; i < geoFns.length; i++) geoFns[i]();
  }
  window.addEventListener("scroll", function () { geo.y = window.pageYOffset || 0; }, { passive: true });

  var toastEl = $("#toast"), toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  /* ---------- Year ---------- */
  var yr = $("#year");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Theme ---------- */
  var THEME_COLOR = { blueprint: "#0e2747", paper: "#eef2f6", hivis: "#1a1d21" };
  function setTheme(name, save, animate) {
    if (!THEME_COLOR[name]) return;
    if (animate) root.classList.add("theme-fade");
    root.setAttribute("data-theme", name);
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", THEME_COLOR[name]);
    $$("[data-theme-set]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-theme-set") === name));
    });
    if (save) safeSet("kpr-theme", name);
    if (animate) setTimeout(function () { root.classList.remove("theme-fade"); }, 500);
  }
  setTheme(root.getAttribute("data-theme"), false, false);
  // Where the browser supports it, the new theme spreads out from the pressed button.
  function switchTheme(name, ev) {
    if (!doc.startViewTransition || reduce || root.getAttribute("data-theme") === name) { setTheme(name, true, true); return; }
    var x = ev && ev.clientX ? ev.clientX : window.innerWidth / 2;
    var y = ev && ev.clientY ? ev.clientY : 0;
    root.style.setProperty("--vt-x", x + "px");
    root.style.setProperty("--vt-y", y + "px");
    root.classList.add("vt");
    var t = doc.startViewTransition(function () { setTheme(name, true, false); });
    var done = function () { root.classList.remove("vt"); };
    if (t && t.finished) t.finished.then(done, done); else done();
  }
  $$("[data-theme-set]").forEach(function (b) {
    b.addEventListener("click", function (e) { switchTheme(b.getAttribute("data-theme-set"), e); });
  });

  /* ---------- Mobile menu ---------- */
  var header = $("#site-header"), menuBtn = $("#menu-btn");
  function closeMenu() {
    if (!header) return;
    header.classList.remove("nav-open");
    if (menuBtn) { menuBtn.setAttribute("aria-expanded", "false"); menuBtn.setAttribute("aria-label", "Open menu"); }
  }
  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      var open = header.classList.toggle("nav-open");
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
  }
  $$("#nav a").forEach(function (a) { a.addEventListener("click", closeMenu); });

  /* ---------- Typed line in the hero ---------- */
  (function () {
    var el = $("#typed");
    if (!el) return;
    var EN = [
      "hybrid vehicle energy management.",
      "reinforcement learning for fixture design.",
      "embedded sensing with an ESP32.",
      "simulation, control and data."
    ];
    var phrases = T("js.phrases", EN);
    var pi = 0, ci = phrases[0].length, deleting = true;
    el.textContent = phrases[0];
    // Keep the line steady while it types: reserve room for the longest phrase at this width,
    // so the text and buttons below never jump when a phrase wraps onto a second line.
    var line = el.closest ? el.closest(".typed") : null;
    function reserve() {
      if (!line) return;
      var keep = el.textContent, max = 0;
      line.style.minHeight = "";
      phrases.forEach(function (ph) { el.textContent = ph; max = Math.max(max, line.offsetHeight); });
      el.textContent = keep;
      line.style.minHeight = max + "px";
    }
    reserve();
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(reserve);
    var rt = 0;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(reserve, 150); });
    onLang(function () {
      phrases = T("js.phrases", EN);
      pi = 0; ci = phrases[0].length; deleting = true;
      el.textContent = phrases[0];
      reserve();
    });
    if (reduce) return;
    function step() {
      var full = phrases[pi];
      if (!deleting) {
        ci++;
        el.textContent = full.slice(0, ci);
        if (ci >= full.length) { deleting = true; return setTimeout(step, 2400); }
        return setTimeout(step, 55);
      }
      ci--;
      el.textContent = full.slice(0, Math.max(ci, 0));
      if (ci <= 0) { deleting = false; pi = (pi + 1) % phrases.length; return setTimeout(step, 350); }
      setTimeout(step, 26);
    }
    setTimeout(step, 2800);
  })();

  /* ---------- Reveal on scroll, bars, counters ---------- */
  function countUp(el) {
    var end = parseInt(el.getAttribute("data-count"), 10) || 0;
    if (reduce) { el.textContent = end; return; }
    var start = null;
    function frame(t) {
      if (start === null) start = t;
      var k = clamp((t - start) / 1300, 0, 1);
      el.textContent = Math.round(end * ease(k));
      if (k < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  (function () {
    var els = $$("[data-reveal], [data-bars], [data-count]");
    function show(el) {
      el.classList.add("in");
      if (el.hasAttribute("data-count")) countUp(el);
    }
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    $$("[data-count]").forEach(function (el) { el.textContent = "0"; });
    // Reveal as soon as the top edge is a little inside the screen, so tall blocks never leave a blank gap.
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- Filters (projects and skills) ---------- */
  function setupFilter(wrapId, itemSelector) {
    var wrap = $("#" + wrapId);
    if (!wrap) return;
    var btns = $$(".fbtn", wrap);
    var items = $$(itemSelector);
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        btns.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        var f = b.getAttribute("data-filter");
        items.forEach(function (it) {
          var match = f === "all" || it.getAttribute("data-cat") === f;
          var wasHidden = it.classList.contains("is-gone");
          it.classList.add("in");
          it.classList.toggle("is-gone", !match);
          if (match && wasHidden && !reduce) {
            it.classList.remove("pop");
            void it.offsetWidth;
            it.classList.add("pop");
          }
        });
        var cloud = wrap.nextElementSibling;
        if (cloud) cloud.classList.add("in");
      });
    });
  }
  setupFilter("proj-filters", "#proj-grid .proj");
  setupFilter("skill-filters", "#skill-cloud .chip");

  /* ---------- Hybrid powertrain: scroll-drawn truck and driving modes ---------- */
  var driveScroll = $("#drive-scroll"), stage = $("#drive-stage"), truck = $("#truck");
  var driveParts = [];
  var hint = $("#drive-hint");
  var modeBtns = $$(".mode-btn");
  var live = false;

  var MODES = {
    electric: { on: ["motor", "battery"], flows: ["b2m", "m2w"], bat: "drain",
      text: "The battery powers the electric motor. The engine is off.", status: "Battery is discharging" },
    engine: { on: ["engine"], flows: ["e2m", "m2w"], bat: "hold",
      text: "The engine drives the wheels through the motor shaft. The battery is not used.", status: "Battery charge is holding" },
    boost: { on: ["engine", "motor", "battery"], flows: ["e2m", "b2m", "m2w"], bat: "drain",
      text: "Engine and motor drive the wheels together, for example when accelerating with a load.", status: "Battery is discharging" },
    braking: { on: ["motor", "battery"], flows: ["w2m", "m2b"], bat: "charge",
      text: "The motor works as a generator and sends braking energy back into the battery.", status: "Battery is charging" }
  };

  function setMode(name) {
    var m = MODES[name];
    if (!m || !stage) return;
    stage.setAttribute("data-mode", name);
    stage.classList.remove("bat-drain", "bat-charge", "bat-hold");
    stage.classList.add("bat-" + m.bat);
    modeBtns.forEach(function (b) {
      var on = b.getAttribute("data-mode") === name;
      b.setAttribute("aria-checked", String(on));
      b.tabIndex = on ? 0 : -1;
    });
    $$("[data-comp]", truck).forEach(function (c) {
      c.classList.toggle("is-on", m.on.indexOf(c.getAttribute("data-comp")) >= 0);
    });
    $$("[data-flow]", truck).forEach(function (f) {
      f.classList.toggle("is-flow", m.flows.indexOf(f.getAttribute("data-flow")) >= 0);
    });
    var t = $("#mode-text"), s = $("#mode-status");
    if (t) t.textContent = T("js.mode." + name + ".text", m.text);
    if (s) s.textContent = T("js.mode." + name + ".status", m.status);
  }

  onLang(function () {
    setMode(stage ? (stage.getAttribute("data-mode") || "electric") : "electric");
    window.dispatchEvent(new Event("scroll"));
  });

  if (driveScroll && stage && truck) {
    var driveSec = $("#drive"), canvas = $("#drive-canvas"), meter = $("#drive-meter");
    var meterTxt = meter ? $("b", meter) : null;
    // Phones get a tighter crop of the same drawing, so the truck is larger.
    var VB_WIDE = [0, 0, 1000, 424], VB_TIGHT = [84, 96, 852, 312];
    $$("[data-s]", truck).forEach(function (el) {
      driveParts.push({
        el: el,
        s: parseFloat(el.getAttribute("data-s")),
        e: parseFloat(el.getAttribute("data-e")),
        line: el.classList.contains("dr") || el.classList.contains("leader") || el.classList.contains("shaft")
      });
    });

    var shown = 0, goal = 0, pin = false, forced = false, autoGo = false, raf = 0, last = 0, idle = 0, hintState = "";
    var lastW = window.innerWidth, lastH = window.innerHeight;

    function setHint(state) {
      if (!hint || state === hintState) return;
      hintState = state;
      hint.textContent = state === "live" ? T("js.hint.live", "Choose a driving mode to see where the energy goes.")
        : state === "start" ? T("js.hint.start", "Scroll down to draw the vehicle.")
        : T("js.hint.draw", "Drawing the vehicle.");
    }

    window.applyDrive = function (p) {
      driveParts.forEach(function (o) {
        var q = clamp((p - o.s) / (o.e - o.s), 0, 1);
        var qe = ease(q);
        if (o.line) {
          o.el.style.strokeDashoffset = String(1 - qe);
          o.el.style.opacity = q > 0 ? "1" : "0";
        } else {
          o.el.style.opacity = String(qe);
        }
        o.el.style.setProperty("--fo", String(qe));
      });
      var nowLive = p >= 0.9;
      if (nowLive !== live) {
        live = nowLive;
        stage.classList.toggle("is-live", live);
      }
      setHint(live ? "live" : (p < 0.02 && pin ? "start" : "draw"));
      if (meter) {
        meter.style.setProperty("--dp", p.toFixed(3));
        if (meterTxt) meterTxt.textContent = Math.round(p * 100) + "%";
      }
    };

    // The mode buttons always work. If the drawing is not finished yet, a click finishes it.
    modeBtns.forEach(function (b, i) {
      b.addEventListener("click", function () {
        if (shown < 1) { forced = true; window.driveKick(); }
        setMode(b.getAttribute("data-mode"));
      });
      b.addEventListener("keydown", function (e) {
        var n = null;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") n = modeBtns[(i + 1) % modeBtns.length];
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = modeBtns[(i - 1 + modeBtns.length) % modeBtns.length];
        if (n) { e.preventDefault(); n.focus(); n.click(); }
      });
    });
    setMode("electric");

    var ds = { top: 0, h: 0, stageH: 0 };                  // the tall scroll area of the demo
    geoFns.push(function () { ds.top = docTop(driveScroll); ds.h = driveScroll.offsetHeight; ds.stageH = stage.offsetHeight; });
    // Pin the stage only when the whole demo fits on the screen. Otherwise it stays in the normal
    // page flow and draws itself when it comes into view (small phones, landscape, short windows).
    function decidePin() {
      var vb = window.innerWidth <= 640 ? VB_TIGHT : VB_WIDE;
      truck.setAttribute("viewBox", vb.join(" "));
      if (reduce) { pin = false; driveSec.classList.remove("is-pin"); return; }
      var avail = window.innerHeight - headerH();
      var head = $(".drive-head", stage).offsetHeight, ui = $(".drive-ui", stage).offsetHeight;
      var drawH = canvas.clientWidth * vb[3] / vb[2];
      // the drawing may shrink to fit, but it should keep at least about 240 px (less on phones)
      var phone = window.innerWidth <= 640;
      var need = head + ui + Math.max(phone ? 105 : 130, Math.min(drawH * (phone ? 0.75 : 0.82), 240)) + 48;
      var on = avail >= need && avail >= 380;
      if (on !== pin) { pin = on; driveSec.classList.toggle("is-pin", on); }
      if (!pin && canvasVisible()) autoGo = true;
    }
    function canvasVisible() {
      var r = canvas.getBoundingClientRect();
      var vis = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, headerH());
      return r.height > 0 && vis / r.height >= 0.6;
    }
    // Pinned: the drawing starts while the section scrolls into view and is done a little
    // after the stage has pinned. It never draws backwards.
    function scrollGoal() {
      var top = ds.top - geo.y, vh = geo.vh;
      var travel = Math.max(0, ds.h - ds.stageH);
      var startTop = vh * 0.85, endTop = geo.hh - travel * 0.55;
      return clamp((startTop - top) / Math.max(1, startTop - endTop), 0, 1);
    }
    function frame(t) {
      raf = 0;
      var dt = last ? Math.min(0.05, (t - last) / 1000) : 1 / 60;
      last = t;
      if (forced || reduce) goal = 1;
      else if (pin) goal = Math.max(goal, scrollGoal());
      else if (autoGo) goal = 1;
      if (shown < goal) {
        if (pin && !forced) shown += (goal - shown) * (1 - Math.exp(-9 * dt)) + dt * 0.02;
        else shown += dt / (forced ? 0.9 : 1.8);
        if (shown > goal) shown = goal;
        window.applyDrive(shown);
      }
      if (shown < goal) raf = requestAnimationFrame(frame); else last = 0;
    }
    window.driveKick = function () {
      if (shown >= 1) return;                              // fully drawn: nothing left to do
      if (!raf) raf = requestAnimationFrame(frame);
      clearTimeout(idle);
      // When you stop scrolling with the drawing in view, it finishes by itself.
      if (shown < 1 && !reduce) idle = setTimeout(function () { if (canvasVisible()) { forced = true; window.driveKick(); } }, 1300);
    };
    window.drivePinnedNow = function () {
      if (!pin) return false;
      var top = ds.top - geo.y;
      return top <= geo.hh + 1 && top + ds.h >= geo.vh - 2;
    };
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting && !pin) { autoGo = true; window.driveKick(); } });
      }, { threshold: 0.35 }).observe(canvas);
    } else {
      autoGo = true;
    }
    onLang(function () { hintState = ""; window.applyDrive(shown); });

    decidePin();
    if (reduce) { shown = goal = 1; }
    window.applyDrive(shown);
    window.driveKick();
    // Phones change the height when the address bar slides in or out: only react to real changes.
    window.addEventListener("resize", function () {
      var w = window.innerWidth, h = window.innerHeight;
      if (w === lastW && Math.abs(h - lastH) < 150) return;
      lastW = w; lastH = h;
      decidePin();
      window.driveKick();
    });
    window.addEventListener("load", function () { setTimeout(function () { decidePin(); window.driveKick(); }, 60); });

    /* CAD-style cursor over the drawing */
    var xh = $("#xhair");
    if (canvas && xh && window.matchMedia && matchMedia("(pointer: fine)").matches) {
      canvas.addEventListener("pointermove", function (e) {
        var r = canvas.getBoundingClientRect();
        xh.style.setProperty("--cx", (e.clientX - r.left) + "px");
        xh.style.setProperty("--cy", (e.clientY - r.top) + "px");
        xh.classList.add("on");
      });
      canvas.addEventListener("pointerleave", function () { xh.classList.remove("on"); });
    }
  }

  /* ---------- Fixture design demo: see fixture.js ---------- */

  /* ---------- Endless animations wait while their section is out of view ---------- */
  // A blinking caret, flowing energy lines or a turning light keep the browser busy on every
  // frame, even far off screen. Each section gets "is-off" while you cannot see it.
  if ("IntersectionObserver" in window) {
    var offIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle("is-off", !e.isIntersecting); });
    }, { rootMargin: "100px 0px" });
    $$("main > section, #marquee, .site-footer").forEach(function (el) { offIO.observe(el); });
  }

  /* ---------- Drafting grid that drifts with the scroll ---------- */
  // It is its own layer that only moves. Changing a value on the whole page each frame would make
  // the browser restyle every element while scrolling.
  var gridLayer = null, photoBox = $(".hero .photo"), lastPhotoY = -1;
  if (!reduce) {
    gridLayer = doc.createElement("div");
    gridLayer.className = "grid-layer";
    gridLayer.setAttribute("aria-hidden", "true");
    doc.body.insertBefore(gridLayer, doc.body.firstChild);
    root.classList.add("has-grid-layer");
  }

  /* ---------- Scroll updates: progress bar, ruler, spy, timelines, parallax ---------- */
  var progress = $("#progress"), ruler = $("#ruler"), rulerMark = $("#ruler-mark"), toTop = $("#to-top");
  var secs = $$("[data-sec]");
  var navLinks = $$("#nav a");
  var timelines = $$("[data-scrub]");
  var rulerH = 0, ticking = false, lastY = geo.y, goingUp = false;
  var secTop = [], tls = [], notches = [];

  // Stored positions of the sections and the timeline steps (see "Sizes and positions" above)
  geoFns.push(function () {
    secTop = secs.map(docTop);
    tls = timelines.map(function (tl) {
      return {
        el: tl, top: docTop(tl), h: Math.max(tl.offsetHeight, 1), p: -1,
        items: Array.prototype.filter.call(tl.children, function (li) { return li.tagName === "LI"; })
          .map(function (li) { return { el: li, top: docTop(li) }; })
      };
    });
    rulerH = ruler ? ruler.clientHeight : 0;
    placeNotches();
  });

  function updateTimelines(y, vh) {
    tls.forEach(function (t) {
      var p = reduce ? 1 : clamp((vh * 0.72 - (t.top - y)) / t.h, 0, 1);
      if (p !== t.p) { t.p = p; t.el.style.setProperty("--p", String(p)); }
      t.items.forEach(function (it) { it.el.classList.toggle("on", reduce || it.top - y < vh * 0.72 - 8); });
    });
  }
  function updateSpy(y, vh) {
    var mid = vh * 0.4, cur = secs[0];
    for (var i = 0; i < secs.length; i++) if (secTop[i] - y <= mid) cur = secs[i];
    if (!cur) return;
    var key = cur.getAttribute("data-nav");
    navLinks.forEach(function (a) { a.classList.toggle("is-current", a.getAttribute("data-nav") === key); });
  }
  function update() {
    ticking = false;
    var y = geo.y, vh = geo.vh;
    var prog = clamp(y / geo.max, 0, 1);
    if (progress) progress.style.transform = "scaleX(" + prog + ")";
    if (gridLayer) gridLayer.style.transform = "translate3d(0," + (-((y * 0.2) % 120)).toFixed(1) + "px,0)";
    if (photoBox && !reduce) {
      var py = Math.min(Math.round(y), 800);                 // the photo shift stops at 28 px anyway
      if (py !== lastPhotoY) { lastPhotoY = py; photoBox.style.setProperty("--sy", String(py)); }
    }
    if (rulerMark && rulerH) rulerMark.style.transform = "translateY(" + Math.round(prog * rulerH) + "px)";
    // The back-to-top button steps aside while the hybrid demo fills the screen. On narrow screens,
    // where it would cover text, it also hides while you scroll down and comes back when you scroll up.
    if (toTop) {
      if (y > lastY + 4) goingUp = false; else if (y < lastY - 4) goingUp = true;
      var roomy = geo.vw >= 1200;
      toTop.classList.toggle("show", y > 900 && (roomy || goingUp) && !(window.drivePinnedNow && window.drivePinnedNow()));
    }
    lastY = y;
    if (window.driveKick) window.driveKick();
    updateTimelines(y, vh);
    updateSpy(y, vh);
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }

  function goTo(el) {
    if (!el) return;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  // One notch per section on the side ruler. Made once, moved when the page changes size.
  function placeNotches() {
    if (!ruler) return;
    if (!notches.length) {
      secs.forEach(function (s) {
        var n = doc.createElement("button");
        n.type = "button";
        n.className = "notch";
        n.tabIndex = -1;
        n.addEventListener("click", function (e) { e.stopPropagation(); goTo(s); });
        ruler.appendChild(n);
        notches.push(n);
      });
    }
    secs.forEach(function (s, i) {
      var frac = clamp((secTop[i] - geo.hh) / geo.max, 0, 1);
      notches[i].style.top = Math.round(frac * rulerH) + "px";
      notches[i].setAttribute("data-l", s.getAttribute("data-label"));   // the label follows the language
    });
  }
  if (ruler) {
    ruler.addEventListener("click", function (e) {
      var r = ruler.getBoundingClientRect();
      window.scrollTo({ top: clamp((e.clientY - r.top) / r.height, 0, 1) * geo.max, behavior: reduce ? "auto" : "smooth" });
    });
  }
  if (toTop) toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });

  window.addEventListener("scroll", onScroll, { passive: true });
  // Measure again when the window or the page changes size: fonts, images, the language, filters
  function remeasure() { measure(); onScroll(); }
  window.addEventListener("resize", remeasure);
  window.addEventListener("load", function () { remeasure(); setTimeout(remeasure, 800); });
  onLang(function () { setTimeout(remeasure, 0); });
  if (window.ResizeObserver) new ResizeObserver(function () { remeasure(); }).observe(doc.body);
  remeasure();

  /* ---------- GitHub repositories, loaded live ---------- */
  // The list loads when the Code section or the footer comes near, so it does not slow down the
  // first view of the page. It is kept for the rest of the visit, so it does not load twice.
  (function () {
    var state = $("#gh-state"), list = $("#gh-repos");
    if (!state || !list) return;
    var kind = "loading", count = 0, started = false, KEY = "kpr-repos";
    function dateLoc() { return (window.kprLang && window.kprLang() === "de") ? "de-DE" : "en-GB"; }
    function renderState() {
      if (kind === "nofetch") state.textContent = T("js.gh.nofetch", "Open my GitHub profile to see my repositories.");
      else if (kind === "none") state.textContent = T("js.gh.none", "No public repositories yet. New work will appear here.");
      else if (kind === "ok") state.textContent = count + (count === 1 ? T("js.gh.one", " public repository, loaded from GitHub.") : T("js.gh.many", " public repositories, loaded from GitHub."));
      else if (kind === "fail") state.textContent = T("js.gh.fail", "The repository list could not be loaded right now. Please open my GitHub profile.");
      else state.textContent = T("code.4", "Loading my repositories from GitHub.");
      $$("[data-pushed]", list).forEach(function (u) {
        u.textContent = T("js.gh.updated", "Updated ") + new Date(u.getAttribute("data-pushed")).toLocaleDateString(dateLoc(), { month: "short", year: "numeric" });
      });
    }
    onLang(renderState);
    renderState();
    function show(all) {
      // Shared with details.js, which shows the date of the last site update in the footer.
      window.kprRepos = all;
      try { doc.dispatchEvent(new CustomEvent("kpr:repos", { detail: all })); } catch (e) {}
      var repos = all.filter(function (r) { return !r.fork; })
        .sort(function (a, b) { return new Date(b.pushed_at) - new Date(a.pushed_at); });
      if (!repos.length) { kind = "none"; renderState(); return; }
      kind = "ok"; count = repos.length;
      repos.slice(0, 6).forEach(function (r) {
        var li = doc.createElement("li");
        li.className = "repo";
        var a = doc.createElement("a");
        a.href = r.html_url; a.target = "_blank"; a.rel = "noopener";
        a.textContent = r.name;
        li.appendChild(a);
        if (r.description) {
          var p = doc.createElement("p");
          p.textContent = r.description;
          li.appendChild(p);
        }
        var meta = doc.createElement("div");
        meta.className = "meta";
        if (r.language) {
          var l = doc.createElement("span");
          l.className = "lang-dot";
          l.textContent = r.language;
          meta.appendChild(l);
        }
        var u = doc.createElement("span");
        u.setAttribute("data-pushed", r.pushed_at);
        meta.appendChild(u);
        li.appendChild(meta);
        list.appendChild(li);
      });
      list.hidden = false;
      renderState();
    }
    function load() {
      if (started) return;
      started = true;
      if (!window.fetch) { kind = "nofetch"; renderState(); return; }
      // Already loaded in the last 10 minutes of this visit
      try {
        var kept = JSON.parse(sessionStorage.getItem(KEY) || "null");
        if (kept && kept.all && Date.now() - kept.t < 600000) { show(kept.all); return; }
      } catch (e) {}
      fetch("https://api.github.com/users/" + GITHUB_USER + "/repos?per_page=100&sort=updated", {
        headers: { Accept: "application/vnd.github+json" }
      }).then(function (r) {
        if (!r.ok) throw new Error("GitHub answered " + r.status);
        return r.json();
      }).then(function (all) {
        // keep only what the page uses
        all = all.map(function (r) {
          return { name: r.name, html_url: r.html_url, description: r.description, language: r.language, pushed_at: r.pushed_at, fork: r.fork };
        });
        try { sessionStorage.setItem(KEY, JSON.stringify({ t: Date.now(), all: all })); } catch (e) {}
        show(all);
      }).catch(function () {
        kind = "fail"; renderState();
      });
    }
    var near = [$("#code"), $(".site-footer")].filter(Boolean);
    if ("IntersectionObserver" in window && near.length) {
      var io = new IntersectionObserver(function (es) {
        if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); load(); }
      }, { rootMargin: "1200px 0px" });
      near.forEach(function (el) { io.observe(el); });
    } else {
      load();
    }
  })();

  /* ---------- Contact: copy the email address ---------- */
  function copyEmail() {
    function done() { toast(T("js.toast.copied", "Email address copied")); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(EMAIL).then(done, fallback);
    } else { fallback(); }
    function fallback() {
      var t = doc.createElement("textarea");
      t.value = EMAIL; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
      doc.body.appendChild(t); t.select();
      try { doc.execCommand("copy"); done(); } catch (e) { toast(T("js.toast.copyfail", "Copy did not work. Please select the address by hand.")); }
      doc.body.removeChild(t);
    }
  }
  var copyBtn = $("#copy-email");
  if (copyBtn) copyBtn.addEventListener("click", copyEmail);

  /* ---------- Quick jump palette (Ctrl K or /) ---------- */
  (function () {
    var pal = $("#palette"), input = $("#pal-input"), list = $("#pal-list"), empty = $("#pal-empty"), openBtn = $("#jump-btn");
    if (!pal || !input || !list) return;
    var items = [], shown = [], sel = 0, lastFocus = null;

    function buildItems() {
      items = secs.map(function (s) {
        return { label: s.getAttribute("data-label"), hint: T("js.pal.section", "Section"), run: function () { goTo(s); } };
      });
      items.push(
        { label: T("js.pal.t1", "Theme: Blueprint"), hint: T("js.pal.action", "Action"), run: function () { setTheme("blueprint", true, true); } },
        { label: T("js.pal.t2", "Theme: Paper"), hint: T("js.pal.action", "Action"), run: function () { setTheme("paper", true, true); } },
        { label: T("js.pal.t3", "Theme: Hi-vis"), hint: T("js.pal.action", "Action"), run: function () { setTheme("hivis", true, true); } },
        { label: T("js.pal.gh", "Open GitHub profile"), hint: T("js.pal.link", "Link"), run: function () { window.open("https://github.com/" + GITHUB_USER, "_blank", "noopener"); } },
        { label: T("js.pal.gl", "Open GitLab profile"), hint: T("js.pal.link", "Link"), run: function () { window.open("https://gitlab.rhrk.uni-kl.de/ten22byf", "_blank", "noopener"); } },
        { label: T("js.pal.li", "Open LinkedIn profile"), hint: T("js.pal.link", "Link"), run: function () { window.open("https://www.linkedin.com/in/kiran-prasad-ravi-096106244", "_blank", "noopener"); } },
        { label: T("js.pal.copy", "Copy email address"), hint: T("js.pal.action", "Action"), run: copyEmail },
        { label: T("js.pal.mail", "Write an email"), hint: T("js.pal.action", "Action"), run: function () { window.location.href = "mailto:" + EMAIL; } },
        { label: T("js.pal.top", "Back to top"), hint: T("js.pal.action", "Action"), run: function () { window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); } }
      );
      // Other files can add actions here (details.js adds the wireframe view).
      (window.kprPalExtra || []).forEach(function (make) {
        try { var it = make(); if (it) items.push(it); } catch (e) {}
      });
    }
    function render(q) {
      q = q.trim().toLowerCase();
      shown = items.filter(function (it) { return !q || (it.label + " " + it.hint).toLowerCase().indexOf(q) >= 0; });
      sel = 0;
      list.innerHTML = "";
      shown.forEach(function (it, i) {
        var li = doc.createElement("li");
        li.id = "pal-opt-" + i;
        li.setAttribute("role", "option");
        li.setAttribute("aria-selected", String(i === sel));
        var a = doc.createElement("span"); a.textContent = it.label;
        var b = doc.createElement("small"); b.textContent = it.hint;
        li.appendChild(a); li.appendChild(b);
        li.addEventListener("click", function () { run(i); });
        li.addEventListener("mousemove", function () { select(i); });
        list.appendChild(li);
      });
      empty.hidden = shown.length > 0;
      input.setAttribute("aria-activedescendant", shown.length ? "pal-opt-0" : "");
    }
    function select(i) {
      sel = i;
      $$("li", list).forEach(function (li, k) { li.setAttribute("aria-selected", String(k === i)); });
      var cur = $("#pal-opt-" + i);
      input.setAttribute("aria-activedescendant", "pal-opt-" + i);
      if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: "nearest" });
    }
    function open() {
      if (!pal.hidden) return;
      closeMenu();
      lastFocus = doc.activeElement;
      buildItems();
      pal.hidden = false;
      input.value = "";
      render("");
      input.focus();
    }
    function close() {
      if (pal.hidden) return;
      pal.hidden = true;
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    function run(i) {
      var it = shown[i];
      close();
      if (it) setTimeout(it.run, 30);
    }

    input.addEventListener("input", function () { render(input.value); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); if (shown.length) select((sel + 1) % shown.length); }
      else if (e.key === "ArrowUp") { e.preventDefault(); if (shown.length) select((sel - 1 + shown.length) % shown.length); }
      else if (e.key === "Enter") { e.preventDefault(); run(sel); }
      else if (e.key === "Tab") { e.preventDefault(); }
    });
    pal.addEventListener("mousedown", function (e) { if (e.target === pal) close(); });
    if (openBtn) openBtn.addEventListener("click", open);

    doc.addEventListener("keydown", function (e) {
      var tag = (doc.activeElement && doc.activeElement.tagName) || "";
      var typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        pal.hidden ? open() : close();
      } else if (e.key === "/" && !typing && pal.hidden) {
        e.preventDefault();
        open();
      } else if (e.key === "Escape") {
        close();
        closeMenu();
      }
    });
  })();
})();

/* ---------- thermal demo ---------- */
(function () {
  "use strict";
  var cv = document.getElementById("th-cv");
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext("2d");
  var layersG = document.getElementById("th-layers");
  var noz = document.getElementById("th-nozzle");
  var peakEl = document.getElementById("th-peak");
  var playBtn = document.getElementById("th-play");
  var reduce = document.documentElement.classList.contains("reduce");
  function TX(k, en) { return window.kprT ? window.kprT(k, en) : en; }
  var W = 32, H = 24, N = 14, AMB = 25, MAXT = 220, BED = 60, STEP = 1 / 30;
  var NS = "http://www.w3.org/2000/svg";

  var T = new Float32Array(W * H), solid = new Uint8Array(W * H), tmp = new Float32Array(W * H);
  var speed = 12, wall = "thick", c0 = 8, c1 = 24;
  var layer = 0, nx = 0, dir = 1, wait = 0, acc = 0, last = 0, running = true, visible = false, raf = 0, rects = [];

  var STOPS = [[0, [11, 6, 20]], [0.25, [59, 15, 112]], [0.5, [160, 42, 108]], [0.7, [237, 92, 58]], [0.88, [251, 180, 26]], [1, [252, 253, 191]]];
  function color(t) {
    var f = Math.max(0, Math.min(1, (t - AMB) / (MAXT - AMB)));
    for (var i = 1; i < STOPS.length; i++) {
      if (f <= STOPS[i][0]) {
        var a = STOPS[i - 1], b = STOPS[i], k = (f - a[0]) / (b[0] - a[0]);
        return [a[1][0] + (b[1][0] - a[1][0]) * k, a[1][1] + (b[1][1] - a[1][1]) * k, a[1][2] + (b[1][2] - a[1][2]) * k];
      }
    }
    return STOPS[STOPS.length - 1][1];
  }
  // The colours are worked out once into a table, and the picture buffer is reused every frame
  var LUT = new Uint8ClampedArray(256 * 3);
  (function () {
    for (var j = 0; j < 256; j++) {
      var c = color(AMB + (MAXT - AMB) * j / 255);
      LUT[j * 3] = c[0]; LUT[j * 3 + 1] = c[1]; LUT[j * 3 + 2] = c[2];
    }
  })();
  var img = ctx.createImageData(W, H);

  function reset() {
    var i, x;
    for (i = 0; i < W * H; i++) { T[i] = AMB; solid[i] = 0; }
    for (x = 0; x < W; x++) { T[(H - 1) * W + x] = BED; solid[(H - 1) * W + x] = 1; }
    c0 = wall === "thin" ? 12 : 8;
    c1 = wall === "thin" ? 20 : 24;
    layer = 0; dir = 1; nx = c0; wait = 0;
    while (layersG.firstChild) layersG.removeChild(layersG.firstChild);
    rects = [];
    for (i = 0; i < N; i++) {
      var r = document.createElementNS(NS, "rect");
      r.setAttribute("class", "th-layer");
      r.setAttribute("x", c0 * 7); r.setAttribute("y", (H - 2 - i) * 7);
      r.setAttribute("width", (c1 - c0) * 7); r.setAttribute("height", 7);
      r.style.display = "none";
      layersG.appendChild(r); rects.push(r);
    }
  }

  function tick() {
    var row = H - 2 - layer, x, y, i;
    if (wait > 0) { wait -= 1; if (wait === 0 && layer >= N) reset(); }
    else {
      nx += dir * speed * STEP;
      if (nx > c1 - 0.5) { nx = c1 - 0.5; dir = -1; layer++; }
      else if (nx < c0 + 0.5) { nx = c0 + 0.5; dir = 1; layer++; }
      for (x = Math.max(0, Math.floor(nx - 1)); x <= Math.min(W - 1, Math.ceil(nx + 1)); x++) {
        if (x < c0 || x >= c1) continue;
        i = row * W + x;
        solid[i] = 1;
        if (Math.abs(x + 0.5 - nx) < 1.3) T[i] = MAXT - 10;
        rects[layer < N ? layer : N - 1].style.display = "";
      }
      if (layer >= N) wait = 45;
    }
    for (y = 0; y < H; y++) {
      for (x = 0; x < W; x++) {
        i = y * W + x;
        var s = T[i], n = 0, a = 0;
        if (x > 0) { a += T[i - 1]; n++; }
        if (x < W - 1) { a += T[i + 1]; n++; }
        if (y > 0) { a += T[i - W]; n++; }
        if (y < H - 1) { a += T[i + W]; n++; }
        var v = s + 0.22 * (a / n - s);
        v -= (solid[i] ? 0.012 : 0.3) * (v - AMB);
        if (y === H - 1) v = BED;
        tmp[i] = v;
      }
    }
    var t = T; T = tmp; tmp = t;
  }

  function draw() {
    var d = img.data, i, j, peak = AMB;
    for (i = 0; i < W * H; i++) {
      var v = T[i]; if (i < (H - 1) * W && v > peak) peak = v;
      j = Math.round(Math.max(0, Math.min(1, (v - AMB) / (MAXT - AMB))) * 255) * 3;
      d[i * 4] = LUT[j]; d[i * 4 + 1] = LUT[j + 1]; d[i * 4 + 2] = LUT[j + 2]; d[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    peakEl.textContent = Math.round(peak) + " \u00b0C";
    noz.setAttribute("transform", "translate(" + (nx * 7).toFixed(1) + "," + (Math.min((H - 2 - layer), H - 2) * 7).toFixed(1) + ")");
    var shown = Math.min(layer + 1, N);
    for (i = 0; i < N; i++) if (i >= shown) rects[i].style.display = "none";
  }

  function frame(ts) {
    raf = 0;
    if (!running || !visible) return;
    if (!last) last = ts;
    acc += Math.min(0.1, (ts - last) / 1000); last = ts;
    while (acc >= STEP) { tick(); acc -= STEP; }
    draw();
    raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && running && visible) { last = 0; raf = requestAnimationFrame(frame); } }

  function setRunning(on) {
    running = on;
    playBtn.textContent = on ? TX("js.th.pause", "Pause") : TX("js.th.play", "Play");
    playBtn.setAttribute("aria-pressed", on ? "true" : "false");
    if (on) kick();
  }

  Array.prototype.forEach.call(document.querySelectorAll('input[name="th-speed"]'), function (r) {
    r.addEventListener("change", function () { if (r.checked) speed = parseFloat(r.value); });
  });
  Array.prototype.forEach.call(document.querySelectorAll('input[name="th-wall"]'), function (r) {
    r.addEventListener("change", function () { if (r.checked) { wall = r.value; reset(); draw(); kick(); } });
  });
  playBtn.addEventListener("click", function () { setRunning(!running); });
  document.addEventListener("kpr:lang", function () { playBtn.textContent = running ? TX("js.th.pause", "Pause") : TX("js.th.play", "Play"); });
  playBtn.textContent = running ? TX("js.th.pause", "Pause") : TX("js.th.play", "Play");

  reset();
  var k;
  for (k = 0; k < 150; k++) tick();
  draw();
  if (reduce) { running = false; playBtn.textContent = TX("js.th.play", "Play"); playBtn.setAttribute("aria-pressed", "false"); }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible) kick();
    }, { threshold: 0.2 }).observe(document.getElementById("th-demo"));
  } else { visible = true; kick(); }
})();
