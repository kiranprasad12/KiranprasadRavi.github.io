/* Kiran Prasad Ravi, personal site.
   Fixture design demo (research assistant job at the FBK chair, RPTU): one training episode as an illustration.
   CAD part -> Gmsh mesh -> the agent places one fixture element -> FEM check -> reward, four times,
   then a PPO update and the next episode.
   - The bending shapes come from a small beam model that is solved here in the browser. The amounts are
     exaggerated so you can see them. They are not results of the real project.
   - It plays only while it is on screen and stops while the tab is hidden.
   - The stage buttons above the drawing jump to the next step of that kind and pause the episode.
   - "Reduce motion": shows the finished layout without movement; the buttons still step through it.
   If this file fails, the section still reads as text. */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  var fig = doc.getElementById("fx"), svg = doc.getElementById("fx-svg");
  if (!fig || !svg || !svg.querySelector) return;
  var reduce = root.classList.contains("reduce");
  var NS = "http://www.w3.org/2000/svg";
  function T(k, en) { return window.kprT ? window.kprT(k, en) : en; }
  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

  /* ---------- The part, in drawing units ---------- */
  // A block from x 60 to 460 with a pocket on top (x 180 to 260). 20 columns and 3 rows of mesh cells.
  var X0 = 60, LEN = 400, COLS = 20, YS = [150, 165.33, 180.67, 196], P0 = 6, P1 = 10;
  function px(i) { return X0 + LEN * i / COLS; }
  function sx(s) { return X0 + LEN * s; }

  /* ---------- A small beam model (Euler-Bernoulli, 40 elements) ---------- */
  // Locators and point contacts hold the beam up or down at one point. A clamp on top of a locator also
  // stops it from turning there. The cutting force pushes down at s = 0.55.
  function beam(supports, clamps, load) {
    var N = 40, n = 2 * (N + 1), h = 1 / N, i, j, r, c;
    var K = [], f = new Float64Array(n);
    for (i = 0; i < n; i++) K.push(new Float64Array(n));
    var k = [[12, 6 * h, -12, 6 * h], [6 * h, 4 * h * h, -6 * h, 2 * h * h], [-12, -6 * h, 12, -6 * h], [6 * h, 2 * h * h, -6 * h, 4 * h * h]];
    for (var e = 0; e < N; e++) {
      var d = [2 * e, 2 * e + 1, 2 * e + 2, 2 * e + 3];
      for (i = 0; i < 4; i++) for (j = 0; j < 4; j++) K[d[i]][d[j]] += k[i][j] / (h * h * h);
    }
    function node(s) { return Math.round(s * N); }
    var BIG = 1e12;
    supports.forEach(function (s) { K[2 * node(s)][2 * node(s)] += BIG; });
    clamps.forEach(function (s) { K[2 * node(s)][2 * node(s)] += BIG; K[2 * node(s) + 1][2 * node(s) + 1] += BIG; });
    f[2 * node(load)] = -1;
    for (i = 0; i < n; i++) {                                  // Gaussian elimination
      var p = i;
      for (r = i + 1; r < n; r++) if (Math.abs(K[r][i]) > Math.abs(K[p][i])) p = r;
      var tr = K[i]; K[i] = K[p]; K[p] = tr; var tf = f[i]; f[i] = f[p]; f[p] = tf;
      for (r = i + 1; r < n; r++) {
        var m = K[r][i] / K[i][i];
        if (!m) continue;
        for (c = i; c < n; c++) K[r][c] -= m * K[i][c];
        f[r] -= m * f[i];
      }
    }
    var u = new Float64Array(n);
    for (i = n - 1; i >= 0; i--) { var s2 = f[i]; for (c = i + 1; c < n; c++) s2 -= K[i][c] * u[c]; u[i] = s2 / K[i][i]; }
    var out = [];
    for (i = 0; i <= COLS; i++) out.push(-u[2 * i * N / COLS]);   // downwards is positive on screen
    return out;
  }
  var TOOL = 0.55;
  var RAW = {
    2: beam([0.08, 0.92], [], TOOL),            // two locators
    3: beam([0.92], [0.08], TOOL),              // + clamp on the left locator
    4: beam([0.92, 0.58], [0.08], TOOL)         // + point contact next to the cutting force
  };
  function peak(a) { var m = 0; for (var i = 0; i < a.length; i++) m = Math.max(m, Math.abs(a[i])); return m; }
  var REF = peak(RAW[2]), SAG = 22;
  // Shown sag: square root of the real ratio, so the small steps stay visible. The gauge uses the same value.
  var LEVEL = { 0: 0, 1: 1, 2: 1, 3: Math.sqrt(peak(RAW[3]) / REF), 4: Math.sqrt(peak(RAW[4]) / REF) };
  var SHAPE = {};
  [2, 3, 4].forEach(function (n) { var m = peak(RAW[n]); SHAPE[n] = RAW[n].map(function (v) { return v / m * SAG * LEVEL[n]; }); });
  var TARGET = 0.3;                                  // where the 0.2 mm line sits on the gauge
  var REWARD = { 0: 0, 1: 0.05, 2: 0.18, 3: 0.4, 4: 0.92 };

  /* ---------- The episode, step by step ---------- */
  // st: which stage of the pipeline is lit (0 CAD, 1 mesh, 2 agent, 3 FEM, 4 reward). d: how long it stays, ms.
  var FR = [
    { st: 0, k: "cad", d: 1500 },
    { st: 1, k: "mesh", d: 1250 },
    { st: 2, k: "place", el: "l1", d: 1200 },
    { st: 3, k: "fem", n: 1, d: 1600 },
    { st: 4, k: "rew", n: 1, d: 900 },
    { st: 2, k: "place", el: "l2", d: 1200 },
    { st: 3, k: "fem", n: 2, d: 1450 },
    { st: 4, k: "rew", n: 2, d: 900 },
    { st: 2, k: "place", el: "cl", d: 1200 },
    { st: 3, k: "fem", n: 3, d: 1450 },
    { st: 4, k: "rew", n: 3, d: 900 },
    { st: 2, k: "place", el: "pc", d: 1200 },
    { st: 3, k: "fem", n: 4, d: 1600 },
    { st: 4, k: "rew", n: 4, d: 1400 },
    { st: 2, k: "learn", d: 2000 }
  ];
  var CANDS = [0.08, 0.2, 0.32, 0.44, 0.58, 0.7, 0.82, 0.92];   // positions the agent can choose
  // How likely the agent is to pick each position (bar heights, an illustration of a policy)
  var EL = {
    l1: { s: 0.08, y: 196, c: "var(--c-prog)", p: [0.92, 0.42, 0.3, 0.26, 0.38, 0.28, 0.4, 0.62] },
    l2: { s: 0.92, y: 196, c: "var(--c-prog)", p: [0.1, 0.24, 0.2, 0.3, 0.44, 0.36, 0.58, 0.95] },
    cl: { s: 0.08, y: 150, c: "var(--c-emb)", p: [0.9, 0.34, 0.22, 0.2, 0.4, 0.24, 0.3, 0.52] },
    pc: { s: 0.58, y: 196, c: "var(--c-sim)", p: [0.08, 0.14, 0.22, 0.46, 0.96, 0.4, 0.18, 0.1] }
  };
  var LEARN = [0.05, 0.08, 0.12, 0.3, 1, 0.22, 0.09, 0.05];
  var TXT = {
    cad: "The CAD part is loaded.",
    mesh: "Gmsh meshes the part for the FEM model.",
    l1: "Step 1 of 4: the agent places a locator.",
    l2: "Step 2 of 4: the agent places a second locator.",
    cl: "Step 3 of 4: the agent places a clamp.",
    pc: "Step 4 of 4: the agent places a point contact under the cutting force.",
    f1: "FEM check: not stable yet, the part can still move.",
    f2: "FEM check: too much deformation under the cutting force.",
    f3: "FEM check: better, but still above 0.2 mm.",
    f4: "FEM check: within 0.2 mm ✓",
    r1: "Reward: very low.",
    r2: "Reward: low.",
    r3: "Reward: higher.",
    r4: "Reward: high. The episode is done.",
    learn: "PPO update: the agent learns from this episode, then the next one starts."
  };
  function frameText(fr) {
    var key = fr.k === "place" ? fr.el : fr.k === "fem" ? "f" + fr.n : fr.k === "rew" ? "r" + fr.n : fr.k;
    return T("js.fx." + key, TXT[key]);
  }

  /* ---------- Build the mesh, the policy bars and the outline ---------- */
  var meshG = $("#fx-mesh", svg), outline = $("#fx-outline", svg), partG = $("#fx-part", svg);
  var toolG = $("#fx-tool-move", svg), polG = $("#fx-pol", svg), ping = $("#fx-ping", svg);
  var tris = [];
  (function () {
    for (var i = 0; i < COLS; i++) {
      for (var j = 0; j < 3; j++) {
        if (j === 0 && i >= P0 && i < P1) continue;            // the pocket
        var a = [i, j], b = [i + 1, j], c = [i + 1, j + 1], d = [i, j + 1];
        var pair = (i + j) % 2 ? [[a, b, d], [b, c, d]] : [[a, b, c], [a, c, d]];
        pair.forEach(function (t) {
          var p = doc.createElementNS(NS, "polygon");
          p.style.setProperty("--c", i);
          meshG.appendChild(p);
          tris.push({ el: p, n: t });
        });
      }
    }
  })();
  var bars = CANDS.map(function (s, k) {
    var r = doc.createElementNS(NS, "rect");
    r.setAttribute("x", (sx(s) - 6).toFixed(1)); r.setAttribute("y", "258");
    r.setAttribute("width", "12"); r.setAttribute("height", "26"); r.setAttribute("rx", "2");
    r.style.setProperty("--k", k);
    polG.appendChild(r);
    return r;
  });

  var dCur = [], dFrom = [], dTo = [], zero = [];
  for (var z = 0; z <= COLS; z++) { dCur.push(0); zero.push(0); }
  var contour = 0;                                   // 1 when the FEM colours are shown

  function draw() {
    function y(j, i) { return YS[j] + dCur[i]; }
    for (var t = 0; t < tris.length; t++) {
      var tri = tris[t], pts = "", sum = 0;
      for (var q = 0; q < 3; q++) {
        var i = tri.n[q][0], j = tri.n[q][1];
        pts += px(i).toFixed(1) + "," + y(j, i).toFixed(2) + " ";
        sum += Math.abs(dCur[i]);
      }
      tri.el.setAttribute("points", pts);
      tri.el.setAttribute("fill-opacity", (0.05 + contour * 0.75 * clamp(sum / 3 / SAG, 0, 1)).toFixed(3));
    }
    var d = "M" + px(0) + "," + y(0, 0).toFixed(2), i2;
    for (i2 = 1; i2 <= P0; i2++) d += " L" + px(i2) + "," + y(0, i2).toFixed(2);
    for (i2 = P0; i2 <= P1; i2++) d += " L" + px(i2) + "," + y(1, i2).toFixed(2);
    for (i2 = P1; i2 <= COLS; i2++) d += " L" + px(i2) + "," + y(0, i2).toFixed(2);
    for (i2 = COLS; i2 >= 0; i2--) d += " L" + px(i2) + "," + y(3, i2).toFixed(2);
    outline.setAttribute("d", d + " Z");
    if (toolG) toolG.setAttribute("transform", "translate(0 " + dCur[11].toFixed(2) + ")");   // the cutter stays on the part
  }

  /* ---------- Movement: bending, the wobble of an unstable part, the ping where something is placed ---------- */
  var twRaf = 0, tw0 = 0, cFrom = 0, cTo = 0;
  function setShape(n, anim) {
    dTo = n >= 2 ? SHAPE[n] : zero;
    cTo = n >= 2 ? 1 : 0;
    if (!anim) {
      if (twRaf) { cancelAnimationFrame(twRaf); twRaf = 0; }
      dCur = dTo.slice(); contour = cTo; draw(); return;
    }
    dFrom = dCur.slice(); cFrom = contour; tw0 = 0;
    if (!twRaf) twRaf = requestAnimationFrame(tween);
  }
  function tween(now) {
    if (!tw0) tw0 = now;
    var k = clamp((now - tw0) / 800, 0, 1);
    // ease out with a small overshoot, like a part settling under load
    var e = k === 1 ? 1 : 1 - Math.pow(2, -9 * k) * Math.cos(k * 7.2);
    for (var i = 0; i <= COLS; i++) dCur[i] = dFrom[i] + (dTo[i] - dFrom[i]) * e;
    contour = cFrom + (cTo - cFrom) * clamp(k * 1.6, 0, 1);
    draw();
    twRaf = k < 1 ? requestAnimationFrame(tween) : 0;
  }
  var wbRaf = 0;
  function stopWobble() { if (wbRaf) cancelAnimationFrame(wbRaf); wbRaf = 0; partG.removeAttribute("transform"); }
  function wobble() {
    stopWobble();
    var t0 = 0;
    function f(now) {
      if (!t0) t0 = now;
      var t = (now - t0) / 1000;
      // the part tips over the single locator and rocks back, a little less each time
      var a = 2.6 * (1 - Math.cos(2 * Math.PI * t / 0.45)) / 2 * Math.exp(-t / 0.5);
      partG.setAttribute("transform", "rotate(" + a.toFixed(3) + " 92 196)");
      if (t < 1.5) wbRaf = requestAnimationFrame(f); else stopWobble();
    }
    wbRaf = requestAnimationFrame(f);
  }
  function doPing(el) {
    if (!ping) return;
    ping.setAttribute("cx", sx(el.s).toFixed(1));
    ping.setAttribute("cy", String(el.y));
    ping.classList.remove("go");
    void ping.getBoundingClientRect();
    ping.classList.add("go");
  }

  /* ---------- Show one step ---------- */
  var stBtns = $$(".fx-st", fig), loop = $(".fx-loop", fig), els = $$(".fx-el", svg);
  var status = $("#fx-status", fig), defBar = $("#fx-def", fig), rewBar = $("#fx-rew", fig);
  var defM = $("#fx-m-def", fig), rewM = $("#fx-m-rew", fig), playBtn = $("#fx-play", fig);
  var cur = 0;

  function go(f, anim) {
    if (reduce) anim = false;
    var fr = FR[f], i;
    cur = f;
    fig.classList.toggle("instant", !anim);
    stBtns.forEach(function (b, k) {
      if (k === fr.st) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
      b.classList.toggle("is-done", f >= 2 ? k < 2 : k < fr.st);
    });
    fig.classList.toggle("learning", fr.k === "learn");
    if (loop) loop.classList.toggle("on", fr.k === "place" && f > 2);
    fig.classList.toggle("cad", f === 0);
    fig.classList.toggle("meshed", f >= 1);
    fig.classList.toggle("tooled", f >= 2);
    fig.classList.toggle("cutting", fr.k === "fem");
    if (f === 0 && anim) { fig.classList.remove("drawing"); void outline.getBoundingClientRect(); fig.classList.add("drawing"); }

    // fixture elements placed so far
    var placed = {}, femN = 0, rewN = 0;
    for (i = 0; i <= f; i++) {
      if (FR[i].k === "place") placed[FR[i].el] = true;
      if (FR[i].k === "fem") femN = FR[i].n;
      if (FR[i].k === "rew") rewN = FR[i].n;
    }
    els.forEach(function (g) { g.classList.toggle("on", !!placed[g.getAttribute("data-el")]); });

    // the policy: bar heights, the chosen position in the colour of the element
    var p = null, pick = -1;
    if (fr.k === "place") { p = EL[fr.el].p; pick = CANDS.indexOf(EL[fr.el].s); fig.style.setProperty("--pick", EL[fr.el].c); }
    else if (fr.k === "learn") { p = LEARN; pick = 4; fig.style.setProperty("--pick", "var(--accent)"); }
    bars.forEach(function (r, k) {
      r.style.setProperty("--p", p ? p[k].toFixed(2) : "0");
      r.classList.toggle("pick", k === pick);
    });
    fig.classList.toggle("policy", !!p);
    if (fr.k === "place" && anim) setTimeout(function () { if (FR[cur] === fr) doPing(EL[fr.el]); }, 420);

    // FEM: bending and colours, the wobble when the part is not held yet
    if (!(fr.k === "fem" && fr.n === 1 && anim)) stopWobble();
    setShape(femN, anim && (fr.k === "fem" || f === 0));
    if (fr.k === "fem" && fr.n === 1 && anim) wobble();

    // gauges
    var lvl = LEVEL[femN];
    defBar.style.setProperty("--v", (lvl * 100).toFixed(1) + "%");
    defM.classList.toggle("is-unstable", femN === 1);
    defM.classList.toggle("is-ok", femN === 4);
    defM.classList.toggle("is-over", femN > 1 && lvl > TARGET);
    rewBar.style.setProperty("--v", (REWARD[rewN] * 100).toFixed(1) + "%");
    rewM.classList.toggle("is-ok", rewN === 4);
    if (fr.k === "rew" && anim) { rewM.classList.remove("bump"); void rewM.offsetWidth; rewM.classList.add("bump"); }

    status.textContent = frameText(fr);
    status.classList.toggle("is-ok", (fr.k === "fem" || fr.k === "rew") && fr.n === 4);
  }

  /* ---------- Playing, pausing, the stage buttons ---------- */
  var playing = !reduce, visible = false, timer = 0, started = false;
  function schedule() {
    clearTimeout(timer); timer = 0;
    if (!playing || !visible || doc.hidden) return;
    timer = setTimeout(function () { go((cur + 1) % FR.length, true); schedule(); }, FR[cur].d);
  }
  function label() {
    if (!playBtn) return;
    playBtn.textContent = playing ? T("js.fx.pause", "Pause") : T("js.fx.play", "Play");
    playBtn.setAttribute("aria-pressed", String(playing));
  }
  function setPlaying(on) {
    playing = on;
    status.setAttribute("aria-live", on ? "off" : "polite");   // read the steps aloud only when stepping by hand
    label();
    if (on && cur === FR.length - 1) { go(0, true); }
    schedule();
  }
  if (playBtn) playBtn.addEventListener("click", function () { setPlaying(!playing); });
  stBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var st = parseInt(b.getAttribute("data-st"), 10);
      if (playing) setPlaying(false);
      for (var k = 1; k <= FR.length; k++) {                   // the next step of this kind
        var j = (cur + k) % FR.length;
        if (FR[j].st === st) { go(j, true); return; }
      }
    });
  });
  doc.addEventListener("visibilitychange", schedule);
  doc.addEventListener("kpr:lang", function () { status.textContent = frameText(FR[cur]); label(); });

  // Start: reduce motion shows the finished layout. Otherwise the episode starts when the drawing is in view.
  if (reduce) { playing = false; go(12, false); }
  else go(0, false);
  status.setAttribute("aria-live", "off");
  label();
  if (!reduce && "IntersectionObserver" in window) {
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible && !started) { started = true; go(0, true); }
      schedule();
    }, { threshold: 0.35 }).observe(svg);
  } else if (!reduce) {
    visible = true; started = true; go(0, true); schedule();
  }
})();
