  (function () {
    'use strict';

    const section = document.getElementById('rig');
    const canvas  = document.getElementById('rigCanvas');
    const portrait = document.getElementById('photographerPortrait');
    const bar     = document.getElementById('rigBar');
    const caps    = Array.from(document.querySelectorAll('#rig .rig-cap'));
    if (!section || !canvas) return;

    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const FRAME_COUNT = 48;
    const POSTER = 26;
    const images = new Array(FRAME_COUNT);
    const requested = new Set();
    let activeLoads = 0, loadingStarted = false, wantedFrame = POSTER;
    let lastDrawn = -1;

    // Only three requests at once; prioritise the frame nearest the scroll position.
    function pumpFrames() {
      if (!loadingStarted) return;
      const order = reduce ? [POSTER] : [wantedFrame, POSTER,
        ...Array.from({ length: FRAME_COUNT }, (_, i) => i)
          .sort((a, b) => Math.abs(a - wantedFrame) - Math.abs(b - wantedFrame))];
      for (const i of order) {
        if (activeLoads >= 3) break;
        if (requested.has(i)) continue;
        requested.add(i);
        activeLoads++;
        const im = new Image();
        im.decoding = 'async';
        im.onload = () => {
          images[i] = im;
          activeLoads--;
          drawImages(progress());
          pumpFrames();
        };
        im.onerror = () => { activeLoads--; pumpFrames(); };
        im.src = `assets/camera/r7_${String(i).padStart(4, '0')}.webp`;
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
      lastDrawn = -1;
    }

    /* ---------- math helpers ---------- */
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);

    function drawImages(p) {
      wantedFrame = reduce ? POSTER : clamp(Math.round(clamp(p / 0.80, 0, 1) * (FRAME_COUNT - 1)), 0, FRAME_COUNT - 1);
      // Keep the closest available rendered frame while the desired one loads.
      let idx = -1;
      for (let i = 0; i < FRAME_COUNT; i++) {
        if (images[i] && (idx < 0 || Math.abs(i - wantedFrame) < Math.abs(idx - wantedFrame))) idx = i;
      }
      if (idx < 0 || idx === lastDrawn) return;
      const im = images[idx];
      ctx.clearRect(0, 0, size, size);
      const r = Math.min(size / im.width, size / im.height);
      const w = im.width * r, h = im.height * r;
      ctx.drawImage(im, (size - w) / 2, (size - h) / 2, w, h);
      lastDrawn = idx;
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
      drawImages(p);

      // The assembled camera dissolves into the photographer portrait for About.
      const ei = easeInOut(seg(p, 0.82, 0.98));
      const cameraOpacity = 1 - easeInOut(seg(p, 0.84, 0.94));
      canvas.style.opacity = cameraOpacity.toFixed(3);
      canvas.style.filter = `blur(${((1 - cameraOpacity) * 7).toFixed(1)}px)`;
      if (window.innerWidth < 640) {
        const shiftY = window.innerHeight * 0.16;
        canvas.style.transform = `translateY(${(-ei * shiftY).toFixed(1)}px) scale(${(1 - 0.22 * ei).toFixed(3)})`;
        if (portrait) portrait.style.transform = `translateX(-50%) translateY(${((1 - ei) * 24).toFixed(1)}px) scale(${(.94 + .06 * ei).toFixed(3)})`;
      } else {
        const shiftX = window.innerWidth * 0.13;
        canvas.style.transform = `translateX(${(ei * shiftX).toFixed(1)}px) scale(${(1 - 0.12 * ei).toFixed(3)})`;
        if (portrait) portrait.style.transform = `translateY(-50%) translateX(${((1 - ei) * 36).toFixed(1)}px) scale(${(.94 + .06 * ei).toFixed(3)})`;
      }
      if (portrait) {
        portrait.style.opacity = ei.toFixed(3);
        portrait.setAttribute('aria-hidden', String(ei < 0.5));
      }

      updateCaps(p);
      if (bar) bar.style.height = (p * 100).toFixed(1) + '%';
      if (running) rafId = requestAnimationFrame(frame);
    }
    function start() { loadingStarted = true; pumpFrames(); if (!running) { running = true; rafId = requestAnimationFrame(frame); } }
    function stop()  { running = false; cancelAnimationFrame(rafId); }

    const io = new IntersectionObserver(
      es => es.forEach(e => (e.isIntersecting ? start() : stop())),
      { rootMargin: '900px 0px' }
    );

    resize();
    io.observe(section);
    frame(performance.now());        // paint once immediately
    window.addEventListener('resize', () => { resize(); frame(performance.now()); });
  })();
