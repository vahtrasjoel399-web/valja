const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');

function harness(reduced = false, width = 1200) {
  let notify, top = 0, nextFrame;
  const pending = [], requests = [], draws = [];
  const canvas = { style: {}, getContext: () => ({
    setTransform() {}, clearRect() {}, drawImage(image) { draws.push(image.src); },
  }) };
  const section = { offsetHeight: 4000, getBoundingClientRect: () => ({ top }) };
  const context = {
    document: { getElementById: id => ({ rig: section, rigCanvas: canvas })[id], querySelectorAll: () => [] },
    window: { innerWidth: width, innerHeight: 800, devicePixelRatio: 1,
      matchMedia: () => ({ matches: reduced }), addEventListener(event, callback) { if (event === "scroll") nextFrame = callback; } },
    performance: { now: () => 0 },
    requestAnimationFrame: callback => { nextFrame = callback; return 1; }, cancelAnimationFrame() {},
    IntersectionObserver: class { constructor(callback) { notify = callback; } observe() {} },
    Image: class {
      constructor() { this.width = this.height = 1100; }
      set src(value) { this.url = value; pending.push(this); requests.push(value); }
      get src() { return this.url; }
    },
  };
  vm.runInNewContext(fs.readFileSync('rig.js', 'utf8'), context);
  return { requests, draws, pending,
    enter() { notify([{ isIntersecting: true }]); },
    scroll(progress) { top = -progress * 3200; nextFrame(0); },
    drain(failFirst = false) {
      let count = 0;
      while (pending.length) {
        assert.ok(pending.length <= 3, 'at most three concurrent image requests');
        assert.ok(++count < 100, 'bounded prefetch window');
        const image = pending.shift();
        if (failFirst) { failFirst = false; image.onerror(); } else image.onload();
      }
    },
  };
}

test('camera loads only near viewport, prefetches a bounded window and follows jumps both ways', () => {
  const page = harness();
  assert.equal(page.requests.length, 0);
  page.enter(); page.drain();
  assert.ok(page.requests.length < 20, 'does not fetch all 80 frames up front');
  page.scroll(.8); page.drain();
  assert.match(page.draws.at(-1), /r8_0079.webp$/);
  page.scroll(0); page.drain();
  assert.match(page.draws.at(-1), /r8_0000.webp$/);
});

test('camera tolerates a missing frame and keeps a rendered fallback', () => {
  const page = harness(); page.enter(); page.drain(true);
  assert.ok(page.draws.length > 0);
});

test('reduced motion requests only one assembled mobile frame', () => {
  const page = harness(true, 390); page.enter(); page.drain();
  page.scroll(.8); page.drain();
  assert.deepEqual(page.requests, ['assets/camera/r8-mobile_0062.webp']);
});
