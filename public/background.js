/* Kiran Prasad Ravi, personal site.
   Animated background: a slow "signal network" drawn on one canvas behind the page.
   - Desktop: the mouse gently pushes the dots away and draws lines to the nearest ones.
   - Phone: fewer dots, a lower frame rate, and the network drifts with your scroll.
   - Click or tap on an empty spot: a wave runs out from that point, pushes the dots aside
     and marks the point.
   - It follows the colour theme, pauses when the tab is hidden, and shows one still
     picture when "reduce motion" is on. If anything fails, the page still works. */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var canvas = doc.createElement("canvas");
  canvas.id = "bg-canvas";
  canvas.setAttribute("aria-hidden", "true");
  var ctx = canvas.getContext && canvas.getContext("2d");
  if (!ctx) return;
  doc.body.insertBefore(canvas, doc.body.firstChild);

  var reduce = root.classList.contains("reduce");
  var mqSmall = window.matchMedia ? matchMedia("(max-width: 760px), (pointer: coarse)") : { matches: false };

  var W = 0, H = 0, dpr = 1;
  var small = mqSmall.matches;
  var nodes = [], pulses = [], links = [], waves = [];
  var WAVE_LIFE = 1.4, WAVE_SPEED = 620;
  var col = { a: "116,212,255", b: "255,191,63", dark: true };
  var pointer = { x: -9999, y: -9999, on: false };
  var par = { x: 0, y: 0 };
  var scrollY = window.pageYOffset || 0, scrollSmooth = scrollY;
  var raf = 0, last = 0, acc = 0, nextPulse = 0, slowFrames = 0, scaleDown = 1;

  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  function hexToRgb(h) {
    h = (h || "").trim();
    var m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(h);
    if (!m) return null;
    var s = m[1];
    if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
    return parseInt(s.slice(0, 2), 16) + "," + parseInt(s.slice(2, 4), 16) + "," + parseInt(s.slice(4, 6), 16);
  }
  function readColours() {
    var cs = getComputedStyle(root);
    col.a = hexToRgb(cs.getPropertyValue("--accent2")) || col.a;
    col.b = hexToRgb(cs.getPropertyValue("--accent")) || col.b;
    col.dark = (root.getAttribute("data-theme") !== "paper");
  }

  function targetCount() {
    var area = W * H;
    var n = small ? area / 21000 : area / 17000;
    n = small ? clamp(n, 16, 34) : clamp(n, 30, 85);
    return Math.round(n * scaleDown);
  }

  function makeNode() {
    var depth = rnd(0.35, 1);              // far dots are smaller, dimmer and move less
    var ang = rnd(0, Math.PI * 2);
    var sp = rnd(5, 15) * (small ? 0.8 : 1);
    return {
      x: rnd(0, W), y: rnd(0, H),
      vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, ix: 0, iy: 0,
      d: depth, cross: Math.random() < 0.22, ph: rnd(0, 6.28)
    };
  }

  function setup() {
    small = mqSmall.matches;
    dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
    // Cap the height: some page viewers stretch the frame to the full page height.
    var w = window.innerWidth, h = Math.min(window.innerHeight, 2400);
    // On phones the address bar changes the height while scrolling. Ignore small changes.
    if (W && small && Math.abs(w - W) < 2 && Math.abs(h - H) < 140) return;
    var oldW = W || w, oldH = H || h;
    W = w; H = h;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    nodes.forEach(function (n) { n.x = n.x / oldW * W; n.y = n.y / oldH * H; });
    var want = targetCount();
    while (nodes.length < want) nodes.push(makeNode());
    if (nodes.length > want) nodes.length = want;
    pulses.length = 0;
    if (reduce) drawStill();
  }

  /* ---------- One frame ---------- */
  function step(dt) {
    par.x += ((pointer.on && !small ? pointer.x / W - 0.5 : 0) - par.x) * Math.min(1, dt * 3);
    par.y += ((pointer.on && !small ? pointer.y / H - 0.5 : 0) - par.y) * Math.min(1, dt * 3);
    var linkD = small ? 118 : 155;
    var ptrR = 170;
    var i, n, w;
    for (i = waves.length - 1; i >= 0; i--) {
      waves[i].age += dt;
      if (waves[i].age > WAVE_LIFE) waves.splice(i, 1);
    }
    var damp = Math.exp(-2.6 * dt);
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      // a click wave pushes the dots outwards as its front passes them
      for (var k = 0; k < waves.length; k++) {
        w = waves[k];
        var wx = n.x - w.x, wy = wrapY(n.y - scrollSmooth * n.d * 0.12) - w.y;
        var wd = Math.sqrt(wx * wx + wy * wy) || 1;
        var band = 1 - Math.abs(wd - w.age * WAVE_SPEED) / 46;
        if (band > 0) {
          var push = band * (1 - w.age / WAVE_LIFE) * 1500 * dt * (0.5 + n.d * 0.5);
          n.ix += wx / wd * push; n.iy += wy / wd * push;
        }
      }
      n.x += (n.vx * n.d + n.ix) * dt;
      n.y += (n.vy * n.d + n.iy) * dt;
      n.ix *= damp; n.iy *= damp;
      if (pointer.on && !small) {
        var dx = n.x - pointer.x, dy = n.y - pointer.y, dd = dx * dx + dy * dy;
        if (dd < ptrR * ptrR && dd > 1) {
          var dist = Math.sqrt(dd), f = (1 - dist / ptrR) * 60 * dt;
          n.x += dx / dist * f; n.y += dy / dist * f;
        }
      }
      if (n.x < -20) n.x = W + 20; else if (n.x > W + 20) n.x = -20;
      if (n.y < -20) n.y = H + 20; else if (n.y > H + 20) n.y = -20;
    }
    // Build the list of links once per frame, so lines and pulses share it.
    links.length = 0;
    var lim = linkD * linkD;
    for (i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var ax = nodes[i].x - nodes[j].x, ay = nodes[i].y - nodes[j].y;
        var d2 = ax * ax + ay * ay;
        if (d2 < lim) links.push({ a: nodes[i], b: nodes[j], t: 1 - Math.sqrt(d2) / linkD });
      }
    }
    // Pulses: a small light that travels along a random line
    nextPulse -= dt;
    var maxP = small ? 3 : 7;
    if (nextPulse <= 0 && pulses.length < maxP && links.length) {
      var l = links[(Math.random() * links.length) | 0];
      pulses.push({ a: l.a, b: l.b, p: 0, sp: rnd(0.45, 0.8) });
      nextPulse = rnd(small ? 1.2 : 0.7, small ? 2.4 : 1.6);
    }
    for (i = pulses.length - 1; i >= 0; i--) {
      pulses[i].p += pulses[i].sp * dt;
      if (pulses[i].p >= 1) pulses.splice(i, 1);
    }
  }


  // Large dial outlines (like a wheel or a gauge) that turn slowly and follow the scroll.
  function ring(cx, cy, r, rot, a) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(" + col.a + "," + a + ")";
    ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.2832); ctx.stroke();
    ctx.setLineDash([2, 9]);
    ctx.beginPath(); ctx.arc(0, 0, r * 0.82, 0, 6.2832); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    for (var i = 0; i < 36; i++) {
      var an = i * Math.PI / 18, len = (i % 3 === 0) ? 15 : 7;
      ctx.moveTo(Math.cos(an) * r, Math.sin(an) * r);
      ctx.lineTo(Math.cos(an) * (r - len), Math.sin(an) * (r - len));
    }
    ctx.stroke();
    ctx.strokeStyle = "rgba(" + col.b + "," + (a * 2.2) + ")";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.92, 0, 0.95); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, r * 0.92, 3.14, 3.5); ctx.stroke();
    ctx.restore();
  }

  function drawFrame(t, still) {
    ctx.clearRect(0, 0, W, H);
    var k = col.dark ? 1 : 0.8;
    var i, n, l;

    // Two large soft glows that drift slowly
    var gx1 = W * (0.25 + 0.12 * Math.sin(t * 0.00006)), gy1 = H * (0.3 + 0.12 * Math.cos(t * 0.00005));
    var gx2 = W * (0.78 + 0.1 * Math.cos(t * 0.00005)), gy2 = H * (0.75 + 0.1 * Math.sin(t * 0.00007));
    var gr = Math.max(W, H) * (small ? 0.75 : 0.55);
    var g = ctx.createRadialGradient(gx1, gy1, 0, gx1, gy1, gr);
    g.addColorStop(0, "rgba(" + col.a + "," + (0.10 * k) + ")"); g.addColorStop(1, "rgba(" + col.a + ",0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    g = ctx.createRadialGradient(gx2, gy2, 0, gx2, gy2, gr * 0.9);
    g.addColorStop(0, "rgba(" + col.b + "," + (0.07 * k) + ")"); g.addColorStop(1, "rgba(" + col.b + ",0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // Soft light under the mouse (desktop)
    if (pointer.on && !small && !still) {
      g = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 240);
      g.addColorStop(0, "rgba(" + col.a + "," + (0.12 * k) + ")"); g.addColorStop(1, "rgba(" + col.a + ",0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }


    // Dials in the corners
    var m = Math.min(W, H);
    var sc = scrollSmooth;
    var r1 = small ? W * 0.52 : clamp(m * 0.34, 150, 360);
    var r2 = small ? W * 0.34 : clamp(m * 0.22, 100, 250);
    ring(W * (small ? 0.96 : 0.9) - par.x * 40, H * 0.2 + Math.sin(sc * 0.0012) * 40 - par.y * 30, r1, t * 0.00005 + sc * 0.0008, 0.11 * k);
    ring(W * (small ? 0.02 : 0.06) + par.x * 28, H * 0.84 + Math.cos(sc * 0.001) * 36 + par.y * 24, r2, -(t * 0.00007) - sc * 0.001, 0.1 * k);

    // Scroll parallax: nearer dots shift more when you scroll
    var off = scrollSmooth;
    ctx.lineWidth = 1;
    for (i = 0; i < links.length; i++) {
      l = links[i];
      var ay = l.a.y - off * l.a.d * 0.12, by = l.b.y - off * l.b.d * 0.12;
      ctx.strokeStyle = "rgba(" + col.a + "," + (l.t * (small ? 0.38 : 0.3) * k) + ")";
      ctx.beginPath(); ctx.moveTo(l.a.x, wrapY(ay)); ctx.lineTo(l.b.x, wrapY(by));
      // skip lines that would stretch across a wrap seam
      if (Math.abs(wrapY(ay) - wrapY(by)) < 220) ctx.stroke(); else ctx.beginPath();
    }

    // Lines from the mouse to nearby dots (desktop)
    if (pointer.on && !small && !still) {
      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        var py = wrapY(n.y - off * n.d * 0.12);
        var ddx = n.x - pointer.x, ddy = py - pointer.y, dist = Math.sqrt(ddx * ddx + ddy * ddy);
        if (dist < 190) {
          ctx.strokeStyle = "rgba(" + col.b + "," + ((1 - dist / 190) * 0.5 * k) + ")";
          ctx.beginPath(); ctx.moveTo(pointer.x, pointer.y); ctx.lineTo(n.x, py); ctx.stroke();
        }
      }
    }

    // Click waves: two rings and a marked point
    if (!still) {
      for (i = 0; i < waves.length; i++) {
        var wv = waves[i], age = wv.age / WAVE_LIFE, R = wv.age * WAVE_SPEED, al = 1 - age;
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "rgba(" + col.a + "," + (0.55 * al * k) + ")";
        ctx.beginPath(); ctx.arc(wv.x, wv.y, R, 0, 6.2832); ctx.stroke();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(" + col.b + "," + (0.4 * al * k) + ")";
        ctx.beginPath(); ctx.arc(wv.x, wv.y, R * 0.62, 0, 6.2832); ctx.stroke();
        var mk = Math.max(0, 1 - wv.age / 1.1);
        if (mk > 0) {
          ctx.strokeStyle = "rgba(" + col.b + "," + (0.95 * mk) + ")";
          ctx.beginPath();
          ctx.moveTo(wv.x - 10, wv.y); ctx.lineTo(wv.x - 3, wv.y); ctx.moveTo(wv.x + 3, wv.y); ctx.lineTo(wv.x + 10, wv.y);
          ctx.moveTo(wv.x, wv.y - 10); ctx.lineTo(wv.x, wv.y - 3); ctx.moveTo(wv.x, wv.y + 3); ctx.lineTo(wv.x, wv.y + 10);
          ctx.stroke();
          ctx.beginPath(); ctx.arc(wv.x, wv.y, 5, 0, 6.2832); ctx.stroke();
        }
      }
    }

    // Pulses
    if (!still) {
      for (i = 0; i < pulses.length; i++) {
        var p = pulses[i];
        var px = p.a.x + (p.b.x - p.a.x) * p.p;
        var py2 = wrapY(p.a.y - off * p.a.d * 0.12) + (wrapY(p.b.y - off * p.b.d * 0.12) - wrapY(p.a.y - off * p.a.d * 0.12)) * p.p;
        var fade = Math.sin(p.p * Math.PI);
        ctx.fillStyle = "rgba(" + col.b + "," + (0.9 * fade) + ")";
        ctx.fillRect(px - 2.5, py2 - 2.5, 5, 5);
        ctx.fillStyle = "rgba(" + col.b + "," + (0.18 * fade) + ")";
        ctx.fillRect(px - 7, py2 - 7, 14, 14);
      }
    }

    // Dots: small squares and a few crosshairs, to match the blueprint look
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      var y = wrapY(n.y - off * n.d * 0.12);
      var s = (small ? 2 : 1.6) + n.d * 1.8;
      var tw = still ? 1 : 0.75 + 0.25 * Math.sin(t * 0.001 + n.ph);
      ctx.fillStyle = "rgba(" + col.a + "," + (0.7 * n.d * tw * k) + ")";
      if (n.cross) {
        var c = 5 + n.d * 3;
        ctx.strokeStyle = "rgba(" + col.a + "," + (0.5 * n.d * tw * k) + ")";
        ctx.beginPath(); ctx.moveTo(n.x - c, y); ctx.lineTo(n.x + c, y); ctx.moveTo(n.x, y - c); ctx.lineTo(n.x, y + c); ctx.stroke();
      } else {
        ctx.fillRect(n.x - s / 2, y - s / 2, s, s);
      }
    }
  }
  function drawStill() { step(0); drawFrame(0, true); }
  function wrapY(y) { var m = H + 40; return ((y + 20) % m + m) % m - 20; }

  function frame(ts) {
    raf = 0;
    if (doc.hidden) return;
    var interval = small ? 1000 / 30 : 1000 / 60;
    var dt = last ? (ts - last) / 1000 : 0.016;
    if (ts - last >= interval - 2 || !last) {
      dt = Math.min(dt, 0.05);
      scrollSmooth += (scrollY - scrollSmooth) * Math.min(1, dt * 6);
      step(dt);
      drawFrame(ts, false);
      // If the device struggles, use fewer dots (once).
      if (dt > (small ? 0.05 : 0.03)) slowFrames++; else slowFrames = Math.max(0, slowFrames - 1);
      if (slowFrames > 40 && scaleDown === 1) { scaleDown = 0.6; nodes.length = Math.max(12, Math.round(nodes.length * 0.6)); }
      last = ts;
    }
    raf = requestAnimationFrame(frame);
  }
  function start() { if (!raf && !reduce) { last = 0; raf = requestAnimationFrame(frame); } }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

  /* ---------- Events ---------- */
  var rt = 0;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(setup, 150); });
  window.addEventListener("scroll", function () { scrollY = window.pageYOffset || 0; if (reduce) { scrollSmooth = scrollY; drawStill(); } }, { passive: true });
  doc.addEventListener("visibilitychange", function () { if (doc.hidden) stop(); else start(); });
  doc.addEventListener("pointermove", function (e) {
    if (e.pointerType === "touch") return;
    pointer.x = e.clientX; pointer.y = e.clientY; pointer.on = true;
  }, { passive: true });
  root.addEventListener("mouseleave", function () { pointer.on = false; });
  // Click or tap on an empty spot (not on a link, button, form field, demo or selected text)
  doc.addEventListener("click", function (e) {
    if (reduce || e.button) return;
    var t = e.target;
    if (!t || !t.closest || t.closest("a, button, input, select, textarea, label, summary, [role='radio'], [role='dialog'], .chip, .drive-canvas, .rl-svg, .th-fig, .ruler, .boot, .sbar")) return;
    if (window.getSelection && String(window.getSelection())) return;
    waves.push({ x: e.clientX, y: e.clientY, age: 0 });
    if (waves.length > 4) waves.shift();
    start();
  });
  window.addEventListener("blur", function () { pointer.on = false; });
  if (mqSmall.addEventListener) mqSmall.addEventListener("change", function () { W = 0; nodes.length = 0; scaleDown = 1; setup(); });
  if (window.MutationObserver) {
    new MutationObserver(function () { readColours(); if (reduce) drawStill(); })
      .observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  }

  readColours();
  setup();
  if (reduce) drawStill(); else start();
})();
