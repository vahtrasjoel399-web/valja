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
      const g = c.createLinearGradient(-55, -148, 55, -76);
      g.addColorStop(0, '#151619'); g.addColorStop(0.48, '#35373b'); g.addColorStop(1, '#111215');
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(-65, -78); c.lineTo(-43, -139); c.quadraticCurveTo(-36, -149, -24, -149);
      c.lineTo(25, -149); c.quadraticCurveTo(37, -148, 43, -138); c.lineTo(65, -78);
      c.closePath(); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 1; c.stroke();
      c.fillStyle = '#0b0c0e'; rr(c, -29, -158, 58, 17, 4); c.fill();
      c.fillStyle = '#292b2f'; rr(c, -23, -155, 46, 7, 2); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.16)'; c.lineWidth = 1;
      for (let x = -18; x <= 18; x += 6) { c.beginPath(); c.moveTo(x, -154); c.lineTo(x, -149); c.stroke(); }
    }
    function drawBody(c) {
      c.save();
      c.shadowColor = 'rgba(0,0,0,.4)'; c.shadowBlur = 22; c.shadowOffsetY = 12;
      const g = c.createLinearGradient(-150, -90, 175, 145);
      g.addColorStop(0, '#404247'); g.addColorStop(.18, '#282a2e'); g.addColorStop(.68, '#17181b'); g.addColorStop(1, '#090a0c');
      c.fillStyle = g; rr(c, -186, -82, 372, 226, 29); c.fill();
      c.shadowColor = 'transparent';
      c.strokeStyle = 'rgba(255,255,255,.13)'; c.lineWidth = 1.4; c.stroke();
      const top = c.createLinearGradient(0, -80, 0, -25);
      top.addColorStop(0, 'rgba(255,255,255,.16)'); top.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = top; rr(c, -172, -71, 344, 48, 17); c.fill();
      // subtle magnesium-alloy texture
      c.fillStyle = 'rgba(255,255,255,.035)';
      for (let y = -55; y < 130; y += 9) for (let x = -165; x < 170; x += 11) {
        const n = Math.sin(x * 12.17 + y * 3.11); if (n > .15) c.fillRect(x + n * 2, y, 1.2, 1.2);
      }
      // lens mount visible behind the lens
      c.fillStyle = '#090a0c'; c.beginPath(); c.arc(0, 30, 132, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#77797b'; c.lineWidth = 7; c.beginPath(); c.arc(0, 30, 126, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = '#202226'; c.lineWidth = 5; c.beginPath(); c.arc(0, 30, 116, 0, Math.PI * 2); c.stroke();
      // body seams and front controls
      c.strokeStyle = 'rgba(0,0,0,.55)'; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(-170, 112); c.quadraticCurveTo(0, 126, 169, 111); c.stroke();
      c.fillStyle = '#0d0e10'; c.beginPath(); c.arc(-145, 1, 8, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#55585c'; c.lineWidth = 1; c.stroke();
      // strap lugs and the sculpted top plate
      c.fillStyle = '#111216'; rr(c, -205, -47, 27, 58, 7); c.fill();
      c.strokeStyle = '#777a7d'; c.lineWidth = 4; rr(c, -204, -34, 13, 29, 5); c.stroke();
      c.fillStyle = '#111216'; rr(c, 178, -43, 27, 55, 7); c.fill();
      c.strokeStyle = '#777a7d'; c.lineWidth = 4; rr(c, 191, -30, 13, 27, 5); c.stroke();
      const plate = c.createLinearGradient(0, -88, 0, -62);
      plate.addColorStop(0, '#4a4c50'); plate.addColorStop(1, '#1b1c20');
      c.fillStyle = plate; rr(c, -166, -88, 332, 18, 8); c.fill();
      c.restore();
    }
    function drawSensor(c) {
      c.save(); c.translate(0, 30);
      c.fillStyle = '#090a0c'; c.beginPath(); c.arc(0, 0, 111, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#aaa9a4'; c.lineWidth = 5; c.beginPath(); c.arc(0, 0, 106, 0, Math.PI * 2); c.stroke();
      // mount screws
      [[0,-99],[84,-53],[91,45],[0,99],[-91,45],[-84,-53]].forEach(([x,y]) => {
        const sg = c.createRadialGradient(x-1,y-1,0,x,y,5);
        sg.addColorStop(0,'#f0f0ec'); sg.addColorStop(.35,'#888a8c'); sg.addColorStop(1,'#252629');
        c.fillStyle = sg; c.beginPath(); c.arc(x,y,5,0,Math.PI*2); c.fill();
        c.strokeStyle = '#303236'; c.lineWidth = 1; c.beginPath(); c.moveTo(x-3,y); c.lineTo(x+3,y); c.stroke();
      });
      const sg = c.createLinearGradient(-55,-42,55,42);
      sg.addColorStop(0,'#789a9e'); sg.addColorStop(.24,'#29475d'); sg.addColorStop(.55,'#6c4970'); sg.addColorStop(1,'#182839');
      c.fillStyle = sg; rr(c,-57,-43,114,86,4); c.fill();
      c.strokeStyle = 'rgba(220,235,235,.55)'; c.lineWidth = 2; c.stroke();
      c.fillStyle = 'rgba(255,255,255,.17)'; rr(c,-49,-36,98,9,2); c.fill();
      c.restore();
    }
    function drawGrip(c) {
      const g = c.createLinearGradient(138, 0, 250, 0);
      g.addColorStop(0, '#303237'); g.addColorStop(.42, '#191a1e'); g.addColorStop(1, '#08090b');
      c.fillStyle = g; rr(c, 138, -61, 118, 205, 31); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.10)'; c.lineWidth = 1.2; c.stroke();
      c.save(); rr(c, 190, -45, 55, 171, 20); c.clip();
      c.strokeStyle = 'rgba(255,255,255,.075)'; c.lineWidth = 1;
      for (let y = -55; y < 150; y += 8) for (let x = 180; x < 260; x += 8) {
        c.beginPath(); c.moveTo(x, y); c.lineTo(x + 5, y + 5); c.stroke();
      }
      c.restore();
    }
    function drawDial(c) {
      // From the front the mode dial only peeks over the left shoulder.
      c.save(); c.translate(-127, -82); c.rotate(0.05); c.scale(1, .42);
      c.fillStyle = '#08090b'; c.beginPath(); c.ellipse(0, 7, 29, 28, 0, 0, 7); c.fill();
      c.fillStyle = '#303238'; c.beginPath(); c.arc(0, 0, 27, 0, 7); c.fill();
      c.fillStyle = '#1b1d20'; c.beginPath(); c.arc(0, 0, 19, 0, 7); c.fill();
      c.strokeStyle = '#777a7e'; c.lineWidth = 2;
      for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; c.beginPath(); c.moveTo(Math.cos(a) * 23, Math.sin(a) * 23); c.lineTo(Math.cos(a) * 27, Math.sin(a) * 27); c.stroke(); }
      c.fillStyle = 'rgba(255,255,255,.58)'; c.beginPath(); c.arc(-6, -6, 1.8, 0, 7); c.fill();
      c.restore();
    }
    function drawShutter(c) {
      // The shutter is embedded in the sloped front edge of the hand grip.
      c.save(); c.translate(181, -61); c.rotate(-0.16); c.scale(1, .58);
      c.fillStyle = '#111317'; rr(c, -22, -17, 44, 34, 12); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.09)'; c.lineWidth = 1; c.stroke();
      let g = c.createRadialGradient(-5, -7, 2, 0, 0, 18);
      g.addColorStop(0, '#aeb1b3'); g.addColorStop(.2, '#55585c'); g.addColorStop(1, '#151619');
      c.fillStyle = g; c.beginPath(); c.arc(0, 0, 13, 0, 7); c.fill();
      c.fillStyle = '#191a1d'; c.beginPath(); c.arc(0, 0, 7.5, 0, 7); c.fill();
      c.fillStyle = 'rgba(255,255,255,.22)'; c.beginPath(); c.arc(-3, -4, 2.2, 0, 7); c.fill();
      c.restore();
    }
    function drawLens(c) {
      c.save(); c.translate(0, 30);
      c.shadowColor = 'rgba(0,0,0,.55)'; c.shadowBlur = 18; c.shadowOffsetY = 8;
      let g = c.createRadialGradient(-40, -45, 5, 12, 16, 128);
      g.addColorStop(0, '#55585d'); g.addColorStop(.45, '#25272b'); g.addColorStop(1, '#08090b');
      c.fillStyle = g; c.beginPath(); c.arc(0, 0, 124, 0, Math.PI * 2); c.fill();
      c.shadowColor = 'transparent';
      // finely ribbed focus ring
      c.strokeStyle = '#474a4e'; c.lineWidth = 2;
      for (let i = 0; i < 72; i++) { const a = i / 72 * Math.PI * 2; c.beginPath(); c.moveTo(Math.cos(a)*110, Math.sin(a)*110); c.lineTo(Math.cos(a)*121, Math.sin(a)*121); c.stroke(); }
      c.strokeStyle = '#050607'; c.lineWidth = 7; c.beginPath(); c.arc(0, 0, 105, 0, 7); c.stroke();
      c.strokeStyle = '#65686b'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 99, 0, 7); c.stroke();
      c.fillStyle = '#080a0d'; c.beginPath(); c.arc(0, 0, 94, 0, 7); c.fill();
      c.strokeStyle = '#22262c'; c.lineWidth = 10; c.beginPath(); c.arc(0, 0, 84, 0, 7); c.stroke();
      let gg = c.createRadialGradient(-29, -34, 3, 10, 13, 79);
      gg.addColorStop(0, '#d4e2dd'); gg.addColorStop(.09, '#769b9f'); gg.addColorStop(.28, '#315873');
      gg.addColorStop(.53, '#263a50'); gg.addColorStop(.74, '#121c29'); gg.addColorStop(1, '#020407');
      c.fillStyle = gg; c.beginPath(); c.arc(0, 0, 78, 0, 7); c.fill();
      // aperture blades deep inside the glass
      c.save(); c.globalAlpha = .5; c.translate(4, 6); c.fillStyle = '#040506';
      for (let i = 0; i < 8; i++) { c.rotate(Math.PI / 4); c.beginPath(); c.moveTo(0, 0); c.lineTo(48, -17); c.lineTo(42, 22); c.closePath(); c.fill(); }
      c.restore();
      const refl = c.createLinearGradient(-58, -62, 35, 35);
      refl.addColorStop(0, 'rgba(255,255,255,.48)'); refl.addColorStop(.25, 'rgba(170,215,225,.13)'); refl.addColorStop(.52, 'rgba(255,255,255,0)');
      c.fillStyle = refl; c.beginPath(); c.ellipse(-27, -31, 38, 16, -.68, 0, 7); c.fill();
      c.fillStyle = 'rgba(116,151,193,.13)'; c.beginPath(); c.ellipse(31, 35, 20, 8, -.68, 0, 7); c.fill();
      c.fillStyle = 'rgba(238,238,230,.72)'; c.font = '600 7px Montserrat, sans-serif'; c.textAlign = 'center';
      c.fillText('RF 24–70mm  1:2.8 L IS USM', 0, -91);
      c.fillStyle = 'rgba(255,255,255,.5)'; c.font = '500 6px Montserrat, sans-serif';
      c.fillText('Ø82', 68, -56);
      c.restore();
    }
    function drawRedRing(c) {
      c.save(); c.translate(0, 30);
      c.strokeStyle = '#9f1718'; c.lineWidth = 5; c.beginPath(); c.arc(0, 0, 89, 0, 7); c.stroke();
      c.strokeStyle = 'rgba(255,111,101,.65)'; c.lineWidth = 1; c.beginPath(); c.arc(0, 0, 87, Math.PI * 1.08, Math.PI * 1.72); c.stroke();
      c.restore();
    }
    function drawLamp(c) {
      c.shadowColor = '#edb04a'; c.shadowBlur = 8; c.fillStyle = '#e8ac45'; c.beginPath(); c.arc(120, -28, 5, 0, 7); c.fill(); c.shadowBlur = 0;
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
      part(seg(p, 0.22, 0.37), -360, -35, drawDial);
      part(seg(p, 0.29, 0.43), 380, 20, drawShutter);
      part(seg(p, 0.30, 0.46), -250, 170, drawSensor, { scale: 0.55, rot: -0.32 });
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
        ctx.textAlign = 'left'; ctx.font = '500 7px Montserrat, sans-serif';
        ctx.fillStyle = 'rgba(240,240,238,.45)';
        ctx.fillText('EOS', -164, -48);
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
