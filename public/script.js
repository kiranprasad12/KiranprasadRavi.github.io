/* Kiran Prasad Ravi, personal site.
   Plain JavaScript, no libraries. Every feature fails quietly: if something
   is missing, the page still reads as a normal static page. */
(function () {
  "use strict";
  window.__kpr = true;

  var doc = document;
  var root = doc.documentElement;
  var reduce = root.classList.contains("reduce");

  var EMAIL = "kiranprasad200112@gmail.com";
  var GITHUB_USER = "kiranprasad12";

  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function headerH() { return parseInt(getComputedStyle(root).getPropertyValue("--header-h"), 10) || 64; }

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
  $$("[data-theme-set]").forEach(function (b) {
    b.addEventListener("click", function () { setTheme(b.getAttribute("data-theme-set"), true, true); });
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
    if (!el || reduce) return;
    var phrases = [
      "hybrid vehicle energy management.",
      "reinforcement learning for fixture design.",
      "embedded sensing with an ESP32.",
      "simulation, control and data."
    ];
    var pi = 0, ci = phrases[0].length, deleting = true;
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
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -6% 0px" });
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
    if (t) t.textContent = m.text;
    if (s) s.textContent = m.status;
  }

  if (driveScroll && stage && truck) {
    $$("[data-s]", truck).forEach(function (el) {
      driveParts.push({
        el: el,
        s: parseFloat(el.getAttribute("data-s")),
        e: parseFloat(el.getAttribute("data-e")),
        line: el.classList.contains("dr") || el.classList.contains("leader") || el.classList.contains("shaft")
      });
    });

    modeBtns.forEach(function (b, i) {
      b.addEventListener("click", function () { setMode(b.getAttribute("data-mode")); });
      b.addEventListener("keydown", function (e) {
        var n = null;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") n = modeBtns[(i + 1) % modeBtns.length];
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = modeBtns[(i - 1 + modeBtns.length) % modeBtns.length];
        if (n) { e.preventDefault(); n.focus(); n.click(); }
      });
    });
    setMode("electric");

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
        modeBtns.forEach(function (b) { b.disabled = !live; });
      }
      if (hint) {
        hint.textContent = p < 0.02 ? "Scroll down to draw the vehicle."
          : (live ? "Choose a driving mode to see where the energy goes." : "Keep scrolling.");
      }
    };
    modeBtns.forEach(function (b) { b.disabled = true; });
    window.driveProgress = function () {
      var r = driveScroll.getBoundingClientRect();
      var travel = r.height - stage.offsetHeight;
      if (travel <= 40) return 1;
      return clamp((headerH() - r.top) / travel, 0, 1);
    };
    window.applyDrive(window.driveProgress());

    /* CAD-style cursor over the drawing */
    var canvas = $("#drive-canvas"), xh = $("#xhair"), xt = $("#xhair-t");
    if (canvas && xh && window.matchMedia && matchMedia("(pointer: fine)").matches) {
      canvas.addEventListener("pointermove", function (e) {
        var r = canvas.getBoundingClientRect();
        var x = e.clientX - r.left, y = e.clientY - r.top;
        xh.style.setProperty("--cx", x + "px");
        xh.style.setProperty("--cy", y + "px");
        var sc = Math.min(r.width / 1000, r.height / 424);
        var ox = (r.width - 1000 * sc) / 2, oy = (r.height - 424 * sc) / 2;
        if (xt) xt.textContent = "x " + Math.round((x - ox) / sc) + "  y " + Math.round((y - oy) / sc);
        xh.classList.add("on");
      });
      canvas.addEventListener("pointerleave", function () { xh.classList.remove("on"); });
    }
  }

  /* ---------- Fixture agent: step through one episode ---------- */
  (function () {
    var groups = $$(".rl-g"), btns = $$(".rl-step"), play = $("#rl-play"), gauge = $("#rl-gauge");
    if (!groups.length || !btns.length) return;
    var step = 3, timer = null, played = false;

    function setStep(n) {
      step = n;
      groups.forEach(function (g) {
        var on = n >= parseInt(g.getAttribute("data-from"), 10) && n <= parseInt(g.getAttribute("data-to"), 10);
        g.classList.toggle("on", on);
      });
      btns.forEach(function (b) {
        if (parseInt(b.getAttribute("data-step"), 10) === n) b.setAttribute("aria-current", "step");
        else b.removeAttribute("aria-current");
      });
      if (gauge) {
        if (n === 4) setTimeout(function () { gauge.classList.add("full"); }, 60);
        else gauge.classList.remove("full");
      }
    }
    function stop() {
      clearInterval(timer);
      timer = null;
      if (play) play.textContent = "Play episode";
    }
    function start() {
      stop();
      setStep(1);
      if (play) play.textContent = "Stop";
      timer = setInterval(function () {
        if (step >= 5) { stop(); return; }
        setStep(step + 1);
      }, 1900);
    }
    btns.forEach(function (b) {
      b.addEventListener("click", function () { stop(); setStep(parseInt(b.getAttribute("data-step"), 10)); });
    });
    if (play) play.addEventListener("click", function () { if (timer) stop(); else start(); });
    setStep(3);

    var demo = $("#rl-demo");
    if (demo && !reduce && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && !played) { played = true; start(); io.disconnect(); }
        });
      }, { threshold: 0.55 });
      io.observe(demo);
    }
  })();

  /* ---------- Scroll updates: progress bar, ruler, spy, timelines, parallax ---------- */
  var progress = $("#progress"), ruler = $("#ruler"), rulerMark = $("#ruler-mark"), toTop = $("#to-top");
  var secs = $$("[data-sec]");
  var navLinks = $$("#nav a");
  var timelines = $$("[data-scrub]");
  var rulerH = 0, ticking = false;

  function updateTimelines() {
    var vh = window.innerHeight;
    timelines.forEach(function (tl) {
      var r = tl.getBoundingClientRect();
      var p = reduce ? 1 : clamp((vh * 0.72 - r.top) / Math.max(r.height, 1), 0, 1);
      tl.style.setProperty("--p", String(p));
      Array.prototype.forEach.call(tl.children, function (li) {
        if (li.tagName !== "LI") return;
        var on = reduce || li.getBoundingClientRect().top < vh * 0.72 - 8;
        li.classList.toggle("on", on);
      });
    });
  }
  function updateSpy() {
    var mid = window.innerHeight * 0.4, cur = secs[0];
    secs.forEach(function (s) { if (s.getBoundingClientRect().top <= mid) cur = s; });
    if (!cur) return;
    var key = cur.getAttribute("data-nav");
    navLinks.forEach(function (a) { a.classList.toggle("is-current", a.getAttribute("data-nav") === key); });
  }
  function update() {
    ticking = false;
    var y = window.pageYOffset || root.scrollTop;
    var max = Math.max(1, root.scrollHeight - window.innerHeight);
    var prog = clamp(y / max, 0, 1);
    if (progress) progress.style.transform = "scaleX(" + prog + ")";
    if (!reduce) root.style.setProperty("--sy", String(y));
    if (rulerMark && rulerH) rulerMark.style.transform = "translateY(" + Math.round(prog * rulerH) + "px)";
    if (toTop) toTop.classList.toggle("show", y > 900);
    if (window.applyDrive) window.applyDrive(reduce ? 1 : window.driveProgress());
    updateTimelines();
    updateSpy();
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }

  function goTo(el) {
    if (!el) return;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  function buildRuler() {
    if (!ruler) return;
    rulerH = ruler.clientHeight;
    $$(".notch", ruler).forEach(function (n) { n.remove(); });
    var max = Math.max(1, root.scrollHeight - window.innerHeight);
    secs.forEach(function (s) {
      var top = s.getBoundingClientRect().top + (window.pageYOffset || 0) - headerH();
      var frac = clamp(top / max, 0, 1);
      var n = doc.createElement("button");
      n.type = "button";
      n.className = "notch";
      n.tabIndex = -1;
      n.style.top = Math.round(frac * rulerH) + "px";
      n.setAttribute("data-l", s.getAttribute("data-label"));
      n.addEventListener("click", function (e) { e.stopPropagation(); goTo(s); });
      ruler.appendChild(n);
    });
  }
  if (ruler) {
    ruler.addEventListener("click", function (e) {
      var r = ruler.getBoundingClientRect();
      var max = Math.max(1, root.scrollHeight - window.innerHeight);
      window.scrollTo({ top: clamp((e.clientY - r.top) / r.height, 0, 1) * max, behavior: reduce ? "auto" : "smooth" });
    });
  }
  if (toTop) toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { buildRuler(); onScroll(); });
  window.addEventListener("load", function () { buildRuler(); update(); setTimeout(function () { buildRuler(); update(); }, 800); });
  buildRuler();
  update();

  /* ---------- GitHub repositories, loaded live ---------- */
  (function () {
    var state = $("#gh-state"), list = $("#gh-repos");
    if (!state || !list) return;
    if (!window.fetch) { state.textContent = "Open my GitHub profile to see my repositories."; return; }
    fetch("https://api.github.com/users/" + GITHUB_USER + "/repos?per_page=100&sort=updated", {
      headers: { Accept: "application/vnd.github+json" }
    }).then(function (r) {
      if (!r.ok) throw new Error("GitHub answered " + r.status);
      return r.json();
    }).then(function (all) {
      var repos = all.filter(function (r) { return !r.fork; })
        .sort(function (a, b) { return new Date(b.pushed_at) - new Date(a.pushed_at); });
      if (!repos.length) { state.textContent = "No public repositories yet. New work will appear here."; return; }
      state.textContent = repos.length + (repos.length === 1 ? " public repository" : " public repositories") + ", loaded from GitHub.";
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
        u.textContent = "Updated " + new Date(r.pushed_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
        meta.appendChild(u);
        li.appendChild(meta);
        list.appendChild(li);
      });
      list.hidden = false;
    }).catch(function () {
      state.textContent = "The repository list could not be loaded right now. Please open my GitHub profile.";
    });
  })();

  /* ---------- Contact: copy email, mail form, CV button ---------- */
  function copyEmail() {
    function done() { toast("Email address copied"); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(EMAIL).then(done, fallback);
    } else { fallback(); }
    function fallback() {
      var t = doc.createElement("textarea");
      t.value = EMAIL; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
      doc.body.appendChild(t); t.select();
      try { doc.execCommand("copy"); done(); } catch (e) { toast("Copy did not work. Please select the address by hand."); }
      doc.body.removeChild(t);
    }
  }
  var copyBtn = $("#copy-email");
  if (copyBtn) copyBtn.addEventListener("click", copyEmail);

  var form = $("#contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = $("#f-name").value.trim();
      var topic = $("#f-topic").value;
      var msg = $("#f-msg").value.trim();
      var body = (msg || "Hello Kiran,") + (name ? "\n\nFrom: " + name : "");
      window.location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent("Portfolio: " + topic) + "&body=" + encodeURIComponent(body);
      toast("Opening your email app");
    });
  }

  /* ---------- Quick jump palette (Ctrl K or /) ---------- */
  (function () {
    var pal = $("#palette"), input = $("#pal-input"), list = $("#pal-list"), empty = $("#pal-empty"), openBtn = $("#jump-btn");
    if (!pal || !input || !list) return;
    var items = [], shown = [], sel = 0, lastFocus = null;

    function buildItems() {
      items = secs.map(function (s) {
        return { label: s.getAttribute("data-label"), hint: "Section", run: function () { goTo(s); } };
      });
      items.push(
        { label: "Theme: Blueprint", hint: "Action", run: function () { setTheme("blueprint", true, true); } },
        { label: "Theme: Paper", hint: "Action", run: function () { setTheme("paper", true, true); } },
        { label: "Theme: Hi-vis", hint: "Action", run: function () { setTheme("hivis", true, true); } },
        { label: "Open GitHub profile", hint: "Link", run: function () { window.open("https://github.com/" + GITHUB_USER, "_blank", "noopener"); } },
        { label: "Open GitLab profile", hint: "Link", run: function () { window.open("https://gitlab.rhrk.uni-kl.de/ten22byf", "_blank", "noopener"); } },
        { label: "Open LinkedIn profile", hint: "Link", run: function () { window.open("https://www.linkedin.com/in/kiran-prasad-ravi-096106244", "_blank", "noopener"); } },
        { label: "Copy email address", hint: "Action", run: copyEmail },
        { label: "Write an email", hint: "Action", run: function () { window.location.href = "mailto:" + EMAIL; } },
        { label: "Back to top", hint: "Action", run: function () { window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); } }
      );
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
