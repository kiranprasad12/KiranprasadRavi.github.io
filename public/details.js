/* Kiran Prasad Ravi, personal site.
   Detail layer: small engineering touches on top of the page. Nothing here is needed to read it.
   - Everyone: a short intro on the first visit in a tab (a roller door opens), a small hybrid
     truck that drives along the progress line, headings that decode, dimension lines with
     arrowheads, drawing zones around the hero sheet, number roll-ups, a live local time
     in the footer, a redraw line when the language changes, a progress frame on "back to top".
   - Desktop with a mouse: grips on cards, the name lit by the pointer.
   - "Reduce motion": only the still parts stay (zones, clock, progress frame).
   If this file fails, the page still works. */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  var reduce = root.classList.contains("reduce");
  var fine = !!(window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches);
  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }
  function T(k, en) { return window.kprT ? window.kprT(k, en) : en; }
  function isDe() { return !!(window.kprLang && window.kprLang() === "de"); }
  function loc() { return isDe() ? "de-DE" : "en-GB"; }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function num(v, d) { var s = v.toFixed(d); return isDe() ? s.replace(".", ",") : s; }
  function onLang(fn) { doc.addEventListener("kpr:lang", fn); }
  function debounce(fn, ms) { var t = 0; return function () { clearTimeout(t); t = setTimeout(fn, ms); }; }

  /* ---------- Sizes and the scroll position, stored ---------- */
  // The animations below read these numbers instead of asking the browser on every frame, which
  // would make it redo its layout in the middle of a frame. They are measured again when the
  // window or the page changes size.
  var header = $("#site-header"), ruler = $("#ruler");
  var geo = { y: window.pageYOffset || 0, vw: window.innerWidth, vh: window.innerHeight, max: 1, hw: 0, rw: 0 };
  function measure() {
    geo.y = window.pageYOffset || 0;
    geo.vw = window.innerWidth; geo.vh = window.innerHeight;
    geo.max = Math.max(1, root.scrollHeight - geo.vh);
    geo.hw = header ? header.clientWidth : geo.vw;
    geo.rw = ruler ? ruler.offsetWidth : 0;
  }
  measure();
  window.addEventListener("scroll", function () { geo.y = window.pageYOffset || 0; }, { passive: true });
  function scrollP() { return clamp(geo.y / geo.max, 0, 1); }

  /* ---------- The small truck (used in the intro and on the progress line) ---------- */
  var TRUCK = '<svg class="rig-svg" viewBox="0 0 30 13" width="30" height="13" aria-hidden="true" focusable="false">' +
    '<path class="rig-beam" d="M28.4 7.6 L42 4.6 V11.8 Z"/>' +
    '<path class="rig-wind" d="M-2.5 2.6 H-8 M-1.5 5.4 H-10.5 M-2.5 8.2 H-7"/>' +
    '<g class="rig-body">' +
      '<rect class="rig-box" x=".6" y=".6" width="18.2" height="8.6" rx=".6"/>' +
      '<path class="rig-stripe" d="M2.2 3 H17.2"/>' +
      '<rect class="rig-socbg" x="2.2" y="5.5" width="7.4" height="1.9"/>' +
      '<rect class="rig-soc" x="2.2" y="5.5" width="7.4" height="1.9"/>' +
      '<path class="rig-cab" d="M19.4 3.1 H24.3 Q25.1 3.1 25.6 3.8 L28.4 7.3 V9.2 H19.4 Z"/>' +
      '<path class="rig-win" d="M20.8 4.2 H24 L25.9 6.6 H20.8 Z"/>' +
      '<rect class="rig-head" x="27.6" y="7.4" width="1.2" height="1"/>' +
      '<rect class="rig-brake" x="0" y="6" width="1.1" height="2.2"/>' +
      '<rect class="rig-rev" x="0" y="3.4" width="1.1" height="1.7"/>' +
      '<path class="rig-chassis" d="M.6 9.7 H28.4"/>' +
    '</g>' +
    '<g class="rig-wheel"><circle cx="5.4" cy="10.7" r="2.15"/><path d="M5.4 8.55 V12.85 M3.25 10.7 H7.55"/></g>' +
    '<g class="rig-wheel"><circle cx="23.6" cy="10.7" r="2.15"/><path d="M23.6 8.55 V12.85 M21.45 10.7 H25.75"/></g>' +
    '</svg>';
  function makeTruck(host) {
    host.innerHTML = TRUCK;
    var svg = host.firstChild, ang = 0, wheels = $$(".rig-wheel", svg);
    return {
      body: $(".rig-body", svg), soc: $(".rig-soc", svg),
      roll: function (dx) {                              // wheels turn with the distance driven
        ang = (ang + dx / 2.15 * 57.29578) % 360;
        var t = "rotate(" + ang.toFixed(1) + "deg)";
        for (var i = 0; i < wheels.length; i++) wheels[i].style.transform = t;
      }
    };
  }

  /* ---------- 1. Intro on the first visit in a tab: a roller door opens ---------- */
  var bootDone = !root.classList.contains("booting");
  function afterBoot(fn) { if (bootDone) fn(); else doc.addEventListener("kpr:booted", fn); }
  function replayHero() {                                // restart the hero entrance so it plays as the door opens
    root.classList.add("replay");
    void root.offsetWidth;
    root.classList.remove("replay");
  }
  (function () {
    var boot = doc.getElementById("boot");
    function finish() {
      root.classList.remove("booting", "boot-lock");
      if (boot && boot.parentNode) boot.parentNode.removeChild(boot);
      if (bootDone) return;
      bootDone = true;
      doc.dispatchEvent(new CustomEvent("kpr:booted"));
    }
    if (bootDone || !boot || reduce) { finish(); return; }
    var mark = $(".boot-mark", boot), numEl = $(".boot-num b", boot), log = $(".boot-log", boot);
    var fill = $(".boot-fill", boot), road = $(".boot-road", boot), host = $(".boot-truck", boot);
    var roadW = road ? road.clientWidth : 0;
    window.addEventListener("resize", function () { if (!gone && road) roadW = road.clientWidth; });
    var truck = host ? makeTruck(host) : null;
    var lines = [
      T("js.boot.1", "Sheet 1/1 · Scale 1:1 · Units mm"),
      $$("[data-sec]").length + " " + T("js.boot.2", "sections") + " · " +
        $$("#proj-grid .proj").length + " " + T("js.boot.3", "projects") + " · " +
        $$("#skill-cloud .chip").length + " " + T("js.boot.4", "skills"),
      T("js.boot.5", "Drawing the page"),
      T("js.boot.6", "Ready")
    ];
    var t0 = 0, DUR = 860, shown = 0, gone = false, lastX = 0;
    root.classList.add("boot-lock");
    function addLine(i) {
      var li = doc.createElement("li");
      li.textContent = lines[i];
      if (i === lines.length - 1) li.className = "ok";
      log.appendChild(li);
    }
    function frame(now) {
      if (gone) return;
      if (!t0) t0 = now;
      var k = clamp((now - t0) / DUR, 0, 1), e = 1 - Math.pow(1 - k, 3), p = Math.round(e * 100);
      if (numEl) numEl.textContent = (p < 10 ? "00" : p < 100 ? "0" : "") + p;
      if (fill) fill.style.transform = "scaleX(" + e.toFixed(4) + ")";
      if (truck && road) {
        var x = e * Math.max(0, roadW - 36);
        truck.roll(x - lastX);
        lastX = x;
        host.style.transform = "translate3d(" + x.toFixed(1) + "px,0,0)";
        host.style.setProperty("--brake", k > 0.62 && k < 1 ? "1" : "0");
      }
      var want = k < 0.2 ? 1 : k < 0.55 ? 2 : k < 1 ? 3 : 4;
      while (shown < want && shown < lines.length) addLine(shown++);
      if (k < 1) requestAnimationFrame(frame);
      else setTimeout(function () { exit(false); }, 280);
    }
    function exit(fast) {
      if (gone) return;
      gone = true;
      while (shown < lines.length) addLine(shown++);
      if (numEl) numEl.textContent = "100";
      root.classList.remove("boot-lock");
      if (fast) boot.classList.add("is-fast");
      boot.classList.add("is-out");
      // the KR mark flies to its place in the header
      var bm = $(".site-header .brand-mark");
      if (mark && bm && mark.animate) {
        var a = mark.getBoundingClientRect(), b = bm.getBoundingClientRect();
        if (a.width && b.width) {
          var s = b.width / a.width;
          var dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
          var end = "translate(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px) scale(" + s.toFixed(4) + ")";
          mark.animate([
            { transform: "translate(0,0) scale(1)", opacity: 1 },
            { transform: end, opacity: 1, offset: 0.9 },
            { transform: end, opacity: 0 }
          ], { duration: fast ? 440 : 860, easing: "cubic-bezier(.7,0,.2,1)", fill: "forwards" });
        }
      }
      setTimeout(replayHero, fast ? 40 : 250);
      setTimeout(finish, fast ? 480 : 920);
    }
    function skip() { exit(true); }
    ["pointerdown", "keydown", "wheel", "touchstart"].forEach(function (ev) {
      doc.addEventListener(ev, skip, { once: true, passive: true });
    });
    requestAnimationFrame(frame);
  })();

  /* ---------- 2. Dimension lines: no arrowheads where a line is very short ---------- */
  var dims = $$(".sec-head .dim");
  function dimsRefresh() { dims.forEach(function (d) { d.classList.toggle("is-tiny", d.offsetWidth < 36); }); }
  dimsRefresh();
  window.addEventListener("resize", debounce(dimsRefresh, 150));
  window.addEventListener("load", dimsRefresh);
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(dimsRefresh);
  onLang(function () { setTimeout(dimsRefresh, 30); });

  /* ---------- 3. Drawing zones around the hero sheet, like a real drawing frame ---------- */
  (function () {
    var sheet = $(".hero .sheet");
    if (!sheet) return;
    var z = doc.createElement("div"), h = "", i;
    z.className = "zones";
    z.setAttribute("aria-hidden", "true");
    for (i = 0; i < 6; i++) h += '<span class="zl zt" style="--i:' + i + ';left:' + ((i + 0.5) / 6 * 100).toFixed(3) + '%">' + (i + 1) + "</span>";
    for (i = 0; i < 4; i++) h += '<span class="zl zs" style="--i:' + (i + 6) + ';top:' + ((i + 0.5) / 4 * 100) + '%">' + "ABCD".charAt(i) + "</span>";
    for (i = 1; i < 6; i++) h += '<i class="zk zkh" style="left:' + (i / 6 * 100).toFixed(3) + '%"></i>';
    for (i = 1; i < 4; i++) h += '<i class="zk zkv" style="top:' + (i / 4 * 100) + '%"></i>';
    z.innerHTML = h;
    sheet.appendChild(z);
  })();

  /* ---------- 4. Numbers with the right decimal mark, rolling up with the bars ---------- */
  var vals = $$(".bar-val").map(function (el) {
    var t = el.textContent.trim(), n = parseFloat(t);
    return isNaN(n) ? null : { el: el, n: n, d: (t.split(".")[1] || "").length };
  }).filter(Boolean);
  function valsShow(k) { vals.forEach(function (o) { o.el.textContent = num(o.n * k, o.d); }); }
  var valsDone = reduce;
  valsShow(1);
  onLang(function () { if (valsDone) valsShow(1); });

  /* ---------- 5. Footer: live local time in Kaiserslautern and the last site update ---------- */
  var clock = { fmt: null, time: "", tz: "" };
  function clockInit() {
    try {
      clock.fmt = new Intl.DateTimeFormat(loc(), { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZoneName: "short" });
    } catch (e) { clock.fmt = null; }
  }
  var tbTime = $("#tb-time");
  function clockTick() {
    if (clock.fmt && clock.fmt.formatToParts) {
      var parts = clock.fmt.formatToParts(new Date()), hh = "", mi = "", ss = "", tz = "";
      parts.forEach(function (p) {
        if (p.type === "hour") hh = p.value; else if (p.type === "minute") mi = p.value;
        else if (p.type === "second") ss = p.value; else if (p.type === "timeZoneName") tz = p.value;
      });
      clock.time = (hh === "24" ? "00" : hh) + ":" + mi + ":" + ss;
      clock.tz = tz;
      if (tbTime) tbTime.textContent = clock.time + " " + tz;
    }
    setTimeout(clockTick, 1000 - (Date.now() % 1000) + 5);
  }
  onLang(function () { clockInit(); });
  var upd = { cell: $("#tb-upd-cell"), el: $("#tb-upd"), date: null };
  function updShow() {
    if (!upd.el || !upd.date || isNaN(upd.date)) return;
    upd.el.textContent = upd.date.toLocaleDateString(loc(), { day: "numeric", month: "short", year: "numeric" });
    if (upd.cell) upd.cell.hidden = false;
  }
  function updFrom(all) {
    if (!all || !all.length) return;
    for (var i = 0; i < all.length; i++) {
      if (/\.github\.io$/i.test(all[i].name || "") && all[i].pushed_at) { upd.date = new Date(all[i].pushed_at); updShow(); return; }
    }
  }
  doc.addEventListener("kpr:repos", function (e) { updFrom(e.detail); });
  updFrom(window.kprRepos);
  onLang(updShow);

  /* ---------- 6. Back to top: a frame fills up with the scroll position ---------- */
  var tt = $("#to-top"), ttRect = null;
  if (tt) {
    tt.insertAdjacentHTML("beforeend", '<svg class="tt-ring" viewBox="0 0 44 44" preserveAspectRatio="none" aria-hidden="true" focusable="false"><rect x="1" y="1" width="42" height="42" pathLength="1"/></svg>');
    ttRect = $(".tt-ring rect", tt);
  }
  function ttUpdate() { if (ttRect) ttRect.style.strokeDashoffset = (1 - scrollP()).toFixed(4); }

  /* ---------- 7. Wireframe view, from the quick jump (Ctrl K) ---------- */
  (function () {
    var badge = null;
    function label() {
      if (!badge) return;
      badge.textContent = T("js.wire.badge", "Wireframe view") + " ";
      var k = doc.createElement("kbd");
      k.textContent = "Esc";
      badge.appendChild(k);
    }
    function setWire(on) {
      root.classList.toggle("wire", on);
      if (on && !badge) {
        badge = doc.createElement("button");
        badge.type = "button";
        badge.className = "wire-badge";
        badge.addEventListener("click", function () { setWire(false); });
        doc.body.appendChild(badge);
      }
      if (badge) { badge.hidden = !on; label(); }
    }
    window.kprPalExtra = window.kprPalExtra || [];
    window.kprPalExtra.push(function () {
      var on = root.classList.contains("wire");
      return {
        label: on ? T("js.pal.wireoff", "View: normal") : T("js.pal.wire", "View: wireframe"),
        hint: T("js.pal.action", "Action"),
        run: function () { setWire(!on); }
      };
    });
    // capture phase: decide before the quick jump closes itself on the same key
    doc.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" || !root.classList.contains("wire")) return;
      var pal = $("#palette");
      if (!pal || pal.hidden) setWire(false);
    }, true);
    onLang(label);
  })();

  /* ---------- 8. A note for people who open the developer console ---------- */
  try {
    console.info("%c KR %c Kiran Prasad Ravi · plain HTML, CSS and JavaScript · source: github.com/kiranprasad12/kiranprasadravi.github.io · Ctrl K opens the quick jump",
      "background:#ffbf3f;color:#1a1300;font-weight:700;padding:2px 5px", "");
  } catch (e) {}

  // Start the clock when the browser has a quiet moment: setting up the time zone takes a while on slow phones
  function clockStart() { clockInit(); clockTick(); }
  if (window.requestIdleCallback) requestIdleCallback(clockStart, { timeout: 1500 }); else setTimeout(clockStart, 400);

  /* ---------- Scroll hook shared by the parts below ---------- */
  var scrollFns = [ttUpdate], sRaf = 0;
  function onScrollFrame() { sRaf = 0; for (var i = 0; i < scrollFns.length; i++) scrollFns[i](); }
  function scrollKick() { if (!sRaf) sRaf = requestAnimationFrame(onScrollFrame); }
  window.addEventListener("scroll", scrollKick, { passive: true });
  // Measure again when the window or the page changes size (fonts, images, language, filters)
  function remeasure() { measure(); scrollKick(); }
  window.addEventListener("resize", remeasure);
  window.addEventListener("load", remeasure);
  onLang(function () { setTimeout(remeasure, 0); });
  if (window.ResizeObserver) new ResizeObserver(remeasure).observe(doc.body);
  ttUpdate();

  if (reduce) return;

  /* ====================== Motion from here on ====================== */

  /* ---------- 9. Text that decodes letter by letter ---------- */
  var GLYPH = { U: "ABCDEFGHJKLMNPRSTUVXYZ", L: "abcdefghkmnoprstuvxyz", D: "0123456789" };
  function kind(ch) {
    if (/[A-ZÄÖÜ]/.test(ch)) return "U";
    if (/[a-zäöüß]/.test(ch)) return "L";
    if (/[0-9]/.test(ch)) return "D";
    return "";
  }
  var decoding = [];
  function decode(el, dur) {
    if (!el || el.children.length || el.__dec) return;
    var fin = el.textContent;
    if (!fin.trim()) return;
    // keep the language switch working: it stores the English text the first time it runs
    if (el.hasAttribute("data-i18n") && el.__en === undefined && !isDe()) el.__en = el.hasAttribute("data-i18n-html") ? el.innerHTML : el.textContent;
    var r = el.getBoundingClientRect();
    var job = { el: el };
    el.__dec = job;
    decoding.push(job);
    if (r.width) { el.style.width = r.width + "px"; el.style.height = r.height + "px"; }
    el.setAttribute("aria-label", fin);
    var n = fin.length, at = [], i, start = 0, last = 0;
    for (i = 0; i < n; i++) at.push(0.12 + (i / Math.max(1, n - 1)) * 0.68 + Math.random() * 0.14);
    function clean() {
      el.style.width = ""; el.style.height = "";
      el.removeAttribute("aria-label");
      el.__dec = null;
      var j = decoding.indexOf(job);
      if (j >= 0) decoding.splice(j, 1);
    }
    job.cancel = clean;
    function frame(now) {
      if (el.__dec !== job) return;
      if (!start) start = now;
      var k = (now - start) / dur;
      if (k >= 1) { el.textContent = fin; clean(); return; }
      if (now - last > 42) {
        last = now;
        var out = "";
        for (i = 0; i < n; i++) {
          var ch = fin.charAt(i), c = kind(ch);
          out += (!c || k >= at[i]) ? ch : GLYPH[c].charAt((Math.random() * GLYPH[c].length) | 0);
        }
        el.textContent = out;
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  // When the language changes, the new text has already been written: stop, do not write the old text back.
  onLang(function () { decoding.slice().forEach(function (j) { j.cancel(); }); });

  if ("IntersectionObserver" in window) {
    var headIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        headIO.unobserve(e.target);
        decode($("h2", e.target), 900);
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -6% 0px" });
    $$(".sec-head").forEach(function (h) { headIO.observe(h); });

    var smallIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        smallIO.unobserve(e.target);
        var d = parseInt(e.target.getAttribute("data-dk") || "0", 10);
        setTimeout(function () { decode(e.target, 650); }, d);
      });
    }, { threshold: 0.6 });
    [".glance dt", ".proj .kind", ".tb-k"].forEach(function (sel) {
      $$(sel).forEach(function (el, i) { el.setAttribute("data-dk", String((i % 6) * 90)); smallIO.observe(el); });
    });

    var barIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        barIO.unobserve(e.target);
        var mine = vals.filter(function (o) { return e.target.contains(o.el); });
        mine.forEach(function (o, i) {
          var start = 0, delay = i * 180;
          o.el.textContent = num(0, o.d);
          function f(now) {
            if (!start) start = now + delay;
            var k = clamp((now - start) / 1300, 0, 1);
            o.el.textContent = num(o.n * (1 - Math.pow(1 - k, 3)), o.d);
            if (k < 1) requestAnimationFrame(f); else valsDone = true;
          }
          requestAnimationFrame(f);
        });
      });
    }, { threshold: 0, rootMargin: "0px 0px -8% 0px" });
    $$("[data-bars]").forEach(function (b) {
      if (vals.some(function (o) { return b.contains(o.el); })) {
        vals.forEach(function (o) { if (b.contains(o.el)) o.el.textContent = num(0, o.d); });
        barIO.observe(b);
      }
    });
  } else {
    valsDone = true;
  }
  // The profile card labels decode as the card comes in
  afterBoot(function () {
    $$(".titleblock dt").forEach(function (dt, i) { setTimeout(function () { decode(dt, 600); }, 620 + i * 80); });
  });

  /* ---------- 10. The truck on the progress line, with a toy hybrid energy manager ---------- */
  var rigEl = null, rig = null;
  if (header) {
    rigEl = doc.createElement("div");
    rigEl.className = "rig";
    rigEl.setAttribute("aria-hidden", "true");
    header.appendChild(rigEl);
    rig = makeTruck(rigEl);
  }
  // Speed is shown against a 90 km/h limit, like the speed limiter of a truck in the EU.
  var car = { x: -44, v: 0, a: 0, soc: 82, mode: "ready", hold: 0, odo: 0, atEnd: false, low: false };
  var carRaf = 0, carLast = 0, parked = !bootDone;
  // The middle of the truck sits on the end of the orange progress line. It never parks on top
  // of the side ruler (when the ruler is shown) and never leaves the right edge.
  function laneStart() { return geo.rw ? geo.rw + 6 : 0; }
  function laneEnd() { return Math.max(laneStart(), geo.hw - 30); }
  function laneX(p) { return clamp(p * geo.hw - 15, laneStart(), laneEnd()); }
  function vmax() { return clamp(geo.vw * 0.34, 150, 560); }
  function ems(dt, sp, along, moving) {
    var m;
    if (!moving) m = "ready";
    else if (along < -0.9) m = "regen";                  // braking: the motor works as a generator
    else if (along > 2.2 || sp > 0.97) m = "boost";      // hard acceleration or top speed: engine and motor
    else {
      if (car.soc < 22) car.low = true; else if (car.soc > 40) car.low = false;
      m = car.low ? "engine" : "ev";
    }
    if (m === "regen") car.soc += Math.min(3, -along) * dt * 2.4;
    else if (m === "boost") car.soc -= (0.6 + sp) * dt * 3.2;
    else if (m === "ev") car.soc -= sp * dt * 3;
    else if (m === "engine") car.soc += dt * 1.6;
    car.soc = clamp(car.soc, 4, 100);
    car.hold -= dt;
    if (m !== car.mode && (car.hold <= 0 || m === "regen" || m === "boost")) { car.mode = m; car.hold = 0.35; }
    if (rig) {
      rig.soc.style.transform = "scaleX(" + (car.soc / 100).toFixed(3) + ")";
      rigEl.classList.toggle("is-regen", car.mode === "regen");
    }
  }
  function carTick(now) {
    carRaf = 0;
    if (!rig) return;
    var dt = carLast ? Math.min(0.05, (now - carLast) / 1000) : 1 / 60;
    carLast = now;
    var vm = vmax(), xEnd = laneEnd(), tx = parked ? -44 : laneX(scrollP());
    var acc = 34 * (tx - car.x) - 11.7 * car.v;          // spring and damper, close to critical damping
    var v = clamp(car.v + acc * dt, -vm, vm);
    car.a += ((v - car.v) / dt - car.a) * Math.min(1, dt * 12);
    var dx = v * dt;
    car.x += dx; car.v = v;
    car.odo += Math.abs(dx) * 25 / vm;                   // metres, consistent with the speed shown
    rig.roll(dx);
    var sp = Math.abs(v) / vm, dir = v >= 0 ? 1 : -1, along = car.a * dir / vm;
    var moving = Math.abs(v) > 4;
    var pitch = clamp(-car.a / vm * 1.6, -4, 4);
    var bob = moving ? Math.sin(car.odo * 9) * 0.35 * Math.min(1, sp * 3) : 0;
    rigEl.style.transform = "translate3d(" + car.x.toFixed(2) + "px,0,0)";
    rig.body.style.transform = "translateY(" + bob.toFixed(2) + "px) rotate(" + pitch.toFixed(2) + "deg)";
    rigEl.style.setProperty("--brake", moving && along < -0.9 ? "1" : "0");
    rigEl.style.setProperty("--rev", v < -4 ? "1" : "0");
    rigEl.style.setProperty("--wind", v > 0 ? clamp((sp - 0.45) * 2.2, 0, 1).toFixed(2) : "0");
    rigEl.style.setProperty("--hl", (0.3 + sp * 0.7).toFixed(2));
    ems(dt, sp, along, moving);
    // hazard lights once the truck has parked at the end of the page
    var end = !parked && tx >= xEnd - 0.5;
    if (end && !moving && Math.abs(tx - car.x) < 0.6 && !car.atEnd) {
      car.atEnd = true;
      rigEl.classList.remove("is-haz"); void rigEl.offsetWidth; rigEl.classList.add("is-haz");
    }
    if (!end) car.atEnd = false;
    if (Math.abs(tx - car.x) > 0.25 || Math.abs(v) > 0.6) carRaf = requestAnimationFrame(carTick);
    else {
      car.v = 0; car.a = 0; carLast = 0; car.hold = 0;
      rigEl.style.setProperty("--brake", "0");
      rigEl.style.setProperty("--wind", "0");
      ems(0, 0, 0, false);
    }
  }
  function carKick() { if (!carRaf && rig) { carLast = 0; carRaf = requestAnimationFrame(carTick); } }
  scrollFns.push(carKick);
  // After the intro the truck drives in from the left edge
  afterBoot(function () { setTimeout(function () { parked = false; carKick(); }, 350); });

  /* ---------- 11. Cards: grips in the corners when the mouse is over them (desktop) ---------- */
  if (fine) {
    $$(".proj, .pillar, .panel").forEach(function (card) {
      var g = doc.createElement("span");
      g.className = "grips";
      g.setAttribute("aria-hidden", "true");
      g.innerHTML = "<i></i><i></i><i></i><i></i>";
      card.appendChild(g);
      card.classList.add("has-grips");
    });
  }

  /* ---------- 12. The name: a light passes over it, and on desktop it follows the pointer ---------- */
  (function () {
    var hero = $("#home"), h1 = $(".hero h1");
    if (!hero || !h1) return;
    h1.classList.add("lit");
    if (!fine) return;
    var nms = $$(".nm", h1), raf = 0, ev = null;
    hero.addEventListener("pointermove", function (e) {
      ev = e;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        nms.forEach(function (n) {
          var r = n.getBoundingClientRect();
          n.style.setProperty("--lx", Math.round(ev.clientX - r.left) + "px");
          n.style.setProperty("--ly", Math.round(ev.clientY - r.top) + "px");
          n.style.setProperty("--la", "1");
        });
      });
    });
    hero.addEventListener("pointerleave", function () { nms.forEach(function (n) { n.style.setProperty("--la", "0"); }); });
  })();

  /* ---------- 13. Language switch: a line runs down the screen and the text is drawn again ---------- */
  onLang(function () {
    var line = doc.createElement("div");
    line.className = "relang-scan";
    line.setAttribute("aria-hidden", "true");
    doc.body.appendChild(line);
    setTimeout(function () { if (line.parentNode) line.parentNode.removeChild(line); }, 700);
    var vh = window.innerHeight;
    $$("[data-i18n]").forEach(function (el) {
      if (!el.animate) return;
      var r = el.getBoundingClientRect();
      if (!r.width || r.bottom < 0 || r.top > vh) return;
      el.animate([{ opacity: 0.12 }, { opacity: 1 }], { duration: 360, delay: Math.max(0, r.top) / vh * 460, easing: "ease-out", fill: "backwards" });
    });
    $$(".sec-head h2").forEach(function (h) {
      var r = h.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh && (!h.closest("[data-reveal]") || h.closest(".in"))) decode(h, 700);
    });
  });
})();
