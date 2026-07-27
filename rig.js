  (function () {
    'use strict';

    const section = document.getElementById('rig');
    const canvas  = document.getElementById('rigCanvas');
    const bar     = document.getElementById('rigBar');
    const caps    = Array.from(document.querySelectorAll('#rig .rig-cap'));
    if (!section || !canvas) return;

    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ----------------------------------------------------------------
       FRAME SOURCE
       Default 'procedural' draws the camera on canvas (no assets needed).
       To use a real Blender PNG sequence of the Canon R7 instead:
         1) Render ~120-150 frames of the assembly to frames/r7_0001.png …
         2) Set mode:'images', count to your frame total, keep `path`.
       The scroll/scrub mechanism below is identical for both modes.
    ---------------------------------------------------------------- */
    const SEQ = {
      mode: 'procedural',                 // 'procedural' | 'images'
      count: 120,
      path: i => `frames/r7_${String(i + 1).padStart(4, '0')}.png`,
    };

    // Preload images if using a real sequence
    const images = [];
    let loaded = 0;
    if (SEQ.mode === 'images') {
      for (let i = 0; i < SEQ.count; i++) {
        const im = new Image();
        im.onload = () => { loaded++; };
        im.src = SEQ.path(i);
        images[i] = im;
      }
    }

    /* ---------- sizing (DPR aware) ---------- */
    let size = 0;
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = Math.round(Math.min(window.innerWidth * 0.92, window.innerHeight * 0.78, 760));
      canvas.style.width = size + 'px';
      canvas.style.height = size + 'px';
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    /* ---------- math helpers ---------- */
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const lerp  = (a, b, t) => a + (b - a) * t;
    const easeOut = t => 1 - Math.pow(1 - t, 3);
    const easeOutBack = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
    const easeOutBackSoft = t => { const c1 = 0.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
    const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);

    function rr(c, x, y, w, h, r) {
      if (c.roundRect) { c.beginPath(); c.roundRect(x, y, w, h, r); return; }
      c.beginPath();
      c.moveTo(x + r, y);
      c.arcTo(x + w, y, x + w, y + h, r);
      c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r);
      c.arcTo(x, y, x + w, y, r);
      c.closePath();
    }

    /* ---------- part wrapper: fly in from offset + fade ---------- */
    function part(prog, ox, oy, draw, opts) {
      if (prog <= 0) return;
      const e = easeOut(prog);
      const m = reduce ? e : easeOutBackSoft(prog); // slight overshoot: parts "snap" into place
      ctx.save();
      ctx.globalAlpha = clamp(prog * 1.25, 0, 1);
      ctx.translate(lerp(ox, 0, m), lerp(oy, 0, m));
      if (opts && opts.scale) { const s = lerp(opts.scale, 1, m); ctx.scale(s, s); }
      if (opts && opts.rot)   { ctx.rotate(lerp(opts.rot, 0, m)); }
      draw(ctx, e);
      ctx.restore();
    }

    /* ---------- individual camera parts (front 3/4 view) ---------- */
    function drawHump(c) {
      c.fillStyle = '#2C2C31';
      c.beginPath();
      c.moveTo(-58, -80); c.lineTo(-40, -138); c.lineTo(40, -138); c.lineTo(58, -80);
      c.closePath(); c.fill();
      c.fillStyle = '#1C1C20'; rr(c, -26, -152, 52, 18, 6); c.fill();
    }
    function drawBody(c) {
      const g = c.createLinearGradient(0, -80, 0, 140);
      g.addColorStop(0, '#3B3B42'); g.addColorStop(0.5, '#2B2B30'); g.addColorStop(1, '#1F1F23');
      c.fillStyle = g; rr(c, -180, -80, 360, 220, 28); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.05)'; rr(c, -166, -70, 332, 40, 18); c.fill();
    }
    function drawGrip(c) {
      const g = c.createLinearGradient(138, 0, 250, 0);
      g.addColorStop(0, '#33333A'); g.addColorStop(1, '#1B1B1F');
      c.fillStyle = g; rr(c, 138, -58, 112, 200, 30); c.fill();
      c.strokeStyle = 'rgba(0,0,0,0.28)'; c.lineWidth = 2;
      for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(212 + i * 7, -40); c.lineTo(212 + i * 7, 120); c.stroke(); }
    }
    function drawDial(c) {
      c.save(); c.translate(-120, -96);
      c.fillStyle = '#3A3A40'; c.beginPath(); c.arc(0, 0, 30, 0, 7); c.fill();
      c.fillStyle = '#24242A'; c.beginPath(); c.arc(0, 0, 21, 0, 7); c.fill();
      c.strokeStyle = '#56565F'; c.lineWidth = 3;
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.beginPath(); c.moveTo(Math.cos(a) * 24, Math.sin(a) * 24); c.lineTo(Math.cos(a) * 29, Math.sin(a) * 29); c.stroke(); }
      c.restore();
    }
    function drawShutter(c) {
      c.save(); c.translate(150, -90);
      c.fillStyle = '#9C988F'; c.beginPath(); c.arc(0, 0, 17, 0, 7); c.fill();
      c.fillStyle = '#44444C'; c.beginPath(); c.arc(0, 0, 16, 0, 7); c.fill();
      c.fillStyle = '#2A2A2F'; c.beginPath(); c.arc(0, 0, 9, 0, 7); c.fill();
      c.restore();
    }
    function drawLens(c) {
      c.save(); c.translate(0, 30);
      let g = c.createRadialGradient(-34, -34, 18, 0, 0, 120);
      g.addColorStop(0, '#45454D'); g.addColorStop(1, '#1E1E22');
      c.fillStyle = g; c.beginPath(); c.arc(0, 0, 118, 0, 7); c.fill();
      c.strokeStyle = 'rgba(0,0,0,0.32)'; c.lineWidth = 2;
      [111, 104].forEach(r => { c.beginPath(); c.arc(0, 0, r, 0, 7); c.stroke(); });
      c.fillStyle = '#2A2A30'; c.beginPath(); c.arc(0, 0, 92, 0, 7); c.fill();
      let gg = c.createRadialGradient(-26, -28, 8, 0, 0, 74);
      gg.addColorStop(0, '#A6C7E0'); gg.addColorStop(0.35, '#48657F'); gg.addColorStop(0.75, '#1E2A38'); gg.addColorStop(1, '#0D131B');
      c.fillStyle = gg; c.beginPath(); c.arc(0, 0, 74, 0, 7); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.20)'; c.beginPath(); c.ellipse(-28, -30, 27, 12, -0.7, 0, 7); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.10)'; c.beginPath(); c.ellipse(26, 30, 14, 6, -0.7, 0, 7); c.fill();
      c.restore();
    }
    function drawRedRing(c) {
      c.save(); c.translate(0, 30);
      c.strokeStyle = '#C0392B'; c.lineWidth = 5; c.beginPath(); c.arc(0, 0, 86, 0, 7); c.stroke();
      c.restore();
    }
    function drawLamp(c) {
      c.fillStyle = '#E0A33C'; c.beginPath(); c.arc(120, -28, 6, 0, 7); c.fill();
    }

    /* ---------- full scene at scroll progress p ---------- */
    function drawProcedural(p, now) {
      ctx.clearRect(0, 0, size, size);
      ctx.save();
      ctx.translate(size / 2, size / 2 + 8);
      const fit = size / 640;
      ctx.scale(fit, fit);

      const ap = clamp(p / 0.72, 0, 1);              // assembly progress
      const exitE = easeInOut(seg(p, 0.82, 0.98));   // slide-away phase

      const bob = reduce ? 0 : Math.sin(now / 1400) * 5 * easeOut(ap) * (1 - exitE);
      ctx.translate(0, bob);
      const gs = lerp(0.8, 1, easeOut(ap));
      ctx.scale(gs, gs);

      // ground shadow (unrotated)
      ctx.save();
      ctx.globalAlpha = 0.16 * easeOut(ap) * (1 - 0.5 * exitE);
      ctx.fillStyle = '#171717';
      ctx.beginPath(); ctx.ellipse(0, 184, 176, 26, 0, 0, 7); ctx.fill();
      ctx.restore();

      ctx.rotate(lerp(-0.18, 0, easeOutBack(clamp(p / 0.70, 0, 1))) - 0.09 * exitE);

      part(seg(p, 0.03, 0.19), 0, -320, drawHump);
      part(seg(p, 0.00, 0.16), 0,  320, drawBody);
      part(seg(p, 0.09, 0.26), 330,   0, drawGrip);
      part(seg(p, 0.22, 0.37), -320, -200, drawDial);
      part(seg(p, 0.29, 0.43), 240, -280, drawShutter);
      part(seg(p, 0.35, 0.58), 480,  -40, drawLens, { scale: 1.5, rot: 0.55 });
      part(seg(p, 0.54, 0.66), 0, 0, drawRedRing, { scale: 0.35 });
      part(seg(p, 0.62, 0.72), 140, -170, drawLamp, { scale: 0.2 });

      // branding fades in once assembled
      const bp = seg(p, 0.64, 0.74);
      if (bp > 0) {
        ctx.save();
        ctx.globalAlpha = bp;
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(240,240,238,0.92)';
        ctx.font = 'italic 700 21px Georgia, serif';
        ctx.fillText('Canon', 0, -103);
        ctx.fillStyle = 'rgba(240,240,238,0.55)';
        ctx.font = '600 13px Montserrat, sans-serif';
        ctx.fillText('R7', -150, -34);
        ctx.restore();
      }

      // sheen sweeping across the lens glass after the last part lands
      const sh = seg(p, 0.66, 0.78);
      if (sh > 0 && sh < 1) {
        ctx.save();
        ctx.translate(0, 30);
        ctx.beginPath(); ctx.arc(0, 0, 74, 0, 7); ctx.clip();
        ctx.rotate(-0.5);
        const sx = lerp(-150, 150, sh);
        const g = ctx.createLinearGradient(sx - 45, 0, sx + 45, 0);
        g.addColorStop(0, 'rgba(255,255,255,0)');
        g.addColorStop(0.5, 'rgba(255,255,255,0.35)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(-170, -170, 340, 340);
        ctx.restore();
      }

      ctx.restore();
    }

    function drawImages(p) {
      ctx.clearRect(0, 0, size, size);
      const idx = clamp(Math.round(p * (SEQ.count - 1)), 0, SEQ.count - 1);
      const im = images[idx];
      if (!im || !im.complete) return;
      const r = Math.min(size / im.width, size / im.height);
      const w = im.width * r, h = im.height * r;
      ctx.drawImage(im, (size - w) / 2, (size - h) / 2, w, h);
    }

    /* ---------- captions opacity by progress window ---------- */
    function fade(p, from, to) {
      if (p < from || p > to) return 0;
      const fIn = clamp((p - from) / 0.06, 0, 1);
      const fOut = clamp((to - p) / 0.06, 0, 1);
      return Math.min(fIn, fOut);
    }
    function updateCaps(p) {
      const sideways = window.innerWidth >= 640;   // на телефоне всё выезжает снизу
      caps.forEach(c => {
        const o = fade(p, +c.dataset.from, +c.dataset.to);
        c.style.opacity = o;
        c.style.transform = (c.dataset.slide === 'x' && sideways)
          ? `translateX(${(1 - o) * -28}px)`
          : `translateY(${(1 - o) * 12}px)`;
        c.style.pointerEvents = o > 0.5 ? '' : 'none';
      });
    }

    /* ---------- progress from pinned section ---------- */
    function progress() {
      const total = section.offsetHeight - window.innerHeight;
      if (total <= 0) return 0;
      return clamp(-section.getBoundingClientRect().top / total, 0, 1);
    }

    /* ---------- render loop (only while section is near viewport) ---------- */
    let running = false, rafId = 0;
    function frame(now) {
      const p = progress();
      if (SEQ.mode === 'images') drawImages(p); else drawProcedural(p, now);

      // assembled camera makes room for the About intro:
      // на телефоне уезжает ВВЕРХ (текст встаёт под ней), с sm: — вправо (текст слева)
      const ei = easeInOut(seg(p, 0.82, 0.98));
      if (window.innerWidth < 640) {
        const shiftY = window.innerHeight * 0.22;
        canvas.style.transform = `translateY(${(-ei * shiftY).toFixed(1)}px) scale(${(1 - 0.30 * ei).toFixed(3)})`;
      } else {
        const shiftX = window.innerWidth * (window.innerWidth >= 1024 ? 0.27 : 0.26);
        canvas.style.transform = `translateX(${(ei * shiftX).toFixed(1)}px) scale(${(1 - 0.10 * ei).toFixed(3)})`;
      }

      updateCaps(p);
      if (bar) bar.style.height = (p * 100).toFixed(1) + '%';
      if (running) rafId = requestAnimationFrame(frame);
    }
    function start() { if (!running) { running = true; rafId = requestAnimationFrame(frame); } }
    function stop()  { running = false; cancelAnimationFrame(rafId); }

    const io = new IntersectionObserver(
      es => es.forEach(e => (e.isIntersecting ? start() : stop())),
      { rootMargin: '120px 0px' }
    );

    resize();
    io.observe(section);
    frame(performance.now());        // paint once immediately
    window.addEventListener('resize', () => { resize(); frame(performance.now()); });
  })();
