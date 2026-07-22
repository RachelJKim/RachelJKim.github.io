'use strict';
/* Tests for the rock pile-in lifecycle — the "leave the page and come back" behavior in
   particular, which is the part that misbehaves on iOS Safari (aggressive bfcache + it
   freezes requestAnimationFrame in backgrounded tabs).

   These drive intro-core.js with a fake clock, so nothing here needs a browser or a DOM.
   Run once:   node --test        (or npm test)
   Watch mode: node --test --watch (or npm run test:watch) — re-runs on every save. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const RI = require('./intro-core.js');

// The same tunables app.js feeds the core (see INTRO_* in app.js). Duplicated here so a
// deliberate change to the feel surfaces as a failing test rather than a silent drift.
const C = { FALL: 620, STAGGER: 6, JITTER: 110, SCALE: 1.22, DRIFT: 8, SPIN: 7, FADE: 0.22 };

// A deterministic clock the tests advance by hand, standing in for performance.now().
function fakeClock(start = 1000) {
  let t = start;
  const now = () => t;
  now.set = v => { t = v; };
  now.advance = d => { t += d; };
  return now;
}

// Three fake rocks with fixed timing (no randomness), biggest-first like fallOrder.
function makeOrder() {
  const rocks = [{}, {}, {}];
  RI.assignTiming(rocks, () => 0.3, C);   // rng constant → reproducible delays/durations
  return rocks;
}

// ---- resolveIntroOn: the on/off decision ----------------------------------------------

test('resolveIntroOn: default follows INTRO_ENABLED', () => {
  assert.equal(RI.resolveIntroOn({ introParam: null, enabled: true,  reducedMotion: false }), true);
  assert.equal(RI.resolveIntroOn({ introParam: null, enabled: false, reducedMotion: false }), false);
});

test('resolveIntroOn: ?intro= overrides the constant', () => {
  assert.equal(RI.resolveIntroOn({ introParam: '1', enabled: false, reducedMotion: false }), true);
  assert.equal(RI.resolveIntroOn({ introParam: '0', enabled: true,  reducedMotion: false }), false);
});

test('resolveIntroOn: reduced-motion wins over everything', () => {
  assert.equal(RI.resolveIntroOn({ introParam: '1', enabled: true, reducedMotion: true }), false);
  assert.equal(RI.resolveIntroOn({ introParam: null, enabled: true, reducedMotion: true }), false);
});

test('resolveIntroOn: unrecognized param falls through to the constant', () => {
  assert.equal(RI.resolveIntroOn({ introParam: 'yes', enabled: true,  reducedMotion: false }), true);
  assert.equal(RI.resolveIntroOn({ introParam: '',    enabled: false, reducedMotion: false }), false);
});

// ---- shouldReplayOnPageshow: bfcache restore --------------------------------------------

test('shouldReplayOnPageshow: only a persisted restore with intro enabled replays', () => {
  assert.equal(RI.shouldReplayOnPageshow(true,  true),  true);
  assert.equal(RI.shouldReplayOnPageshow(false, true),  false);   // fresh load, not bfcache
  assert.equal(RI.shouldReplayOnPageshow(true,  false), false);   // intro disabled this visit
  assert.equal(RI.shouldReplayOnPageshow(false, false), false);
});

// ---- easeLand: the landing curve --------------------------------------------------------

test('easeLand: pinned at the endpoints (0 at start, 1 at rest)', () => {
  assert.ok(Math.abs(RI.easeLand(0) - 0) < 1e-9);
  assert.ok(Math.abs(RI.easeLand(1) - 1) < 1e-9);
});

test('easeLand: has a trace of overshoot just before settling', () => {
  // Near t≈0.91 the ease peaks a hair above 1, which makes the rock dip just under its
  // rest size and settle — the "barely settles rather than snapping" feel.
  assert.ok(RI.easeLand(0.91) > 1);
  assert.ok(RI.easeLand(0.91) < 1.01);   // but only a trace, not a bounce
});

// ---- assignTiming: fall schedule --------------------------------------------------------

test('assignTiming: delays increase down the order and stay within bounds', () => {
  const order = makeOrder();
  assert.ok(order[0].delay < order[1].delay);
  assert.ok(order[1].delay < order[2].delay);          // big rocks land first
  for (const r of order) {
    assert.ok(r.dur >= C.FALL * 0.85 && r.dur <= C.FALL * 1.15);
    assert.ok(Math.abs(r.dRot) <= C.SPIN);
    assert.ok(Math.hypot(r.dx, r.dy) <= C.DRIFT + 1e-9);   // drift capped
  }
});

// ---- stepRock: per-rock render snapshot -------------------------------------------------

test('stepRock: waiting before its delay — transparent, at start scale', () => {
  const r = { delay: 50, dur: 600, dRot: 10, dx: 5, dy: 3 };
  const s = RI.stepRock(r, 1000, 1000, C);   // now === introStart, still 50ms of delay left
  assert.equal(s.phase, 'waiting');
  assert.equal(s.opacity, 0);
  assert.equal(s.scale, C.SCALE);
});

test('stepRock: mid-fall opacity ramps then goes solid at FADE', () => {
  const r = { delay: 0, dur: 1000, dRot: 10, dx: 5, dy: 3 };
  const early = RI.stepRock(r, 100, 0, C);   // t = 0.10, below FADE (0.22)
  assert.equal(early.phase, 'falling');
  assert.ok(early.opacity > 0 && early.opacity < 1);
  const solid = RI.stepRock(r, 300, 0, C);   // t = 0.30, past FADE
  assert.equal(solid.opacity, 1);
});

test('stepRock: landed at rest — scale 1, no offset, opaque', () => {
  const r = { delay: 0, dur: 500, dRot: 10, dx: 5, dy: 3 };
  const s = RI.stepRock(r, 600, 0, C);       // t = 1.2, past the end
  assert.deepEqual(s, { phase: 'landed', scale: 1, ox: 0, oy: 0, rot: 0, opacity: 1 });
});

// ---- isComplete: whole-pile settle ------------------------------------------------------

test('isComplete: false mid-fall, true once every rock has landed', () => {
  const order = makeOrder();
  const maxEnd = Math.max(...order.map(r => r.delay + r.dur));
  assert.equal(RI.isComplete(order, 0 + 10, 0), false);
  assert.equal(RI.isComplete(order, maxEnd + 1, 0), true);
});

// ---- The headline: leave the page and come back -----------------------------------------

test('lifecycle: begin starts the intro and stamps the clock', () => {
  const now = fakeClock(1000);
  const intro = RI.createController({ now });
  assert.equal(intro.introing, false);
  intro.begin();
  assert.equal(intro.introing, true);
  assert.equal(intro.introStart, 1000);
});

test('lifecycle: backgrounding then returning must NOT skip the intro', () => {
  const now = fakeClock(1000);
  const intro = RI.createController({ now });
  const order = makeOrder();
  const rock = order[0];

  intro.begin();                     // decode finished, pile-in starts at t=1000
  now.advance(100);                  // 100ms in — rock is mid-fall
  assert.equal(RI.stepRock(rock, now(), intro.introStart, C).phase, 'falling');

  // Tab goes to the background: rAF is frozen, so no frames run while real time marches on.
  now.set(500000);

  // If the clock were NOT rebased, the rock's whole duration has "elapsed" → it would snap
  // straight to landed. This asserts the bug the rebase exists to prevent.
  assert.equal(RI.stepRock(rock, now(), intro.introStart, C).phase, 'landed');

  // Tab returns to the foreground → onVisible rebases the start to now.
  intro.onVisible();
  assert.equal(intro.introStart, 500000);

  // First frame after returning: the rock is mid-fall again, exactly where it left off —
  // the intro resumes instead of being skipped.
  now.advance(100);
  assert.equal(RI.stepRock(rock, now(), intro.introStart, C).phase, 'falling');
});

test('lifecycle: onVisible is a no-op when no intro is running', () => {
  const now = fakeClock(1000);
  const intro = RI.createController({ now });
  intro.begin();
  intro.end();                       // pile settled; nothing is animating
  const before = intro.introStart;
  now.set(999999);
  intro.onVisible();                 // returning to a settled page must not restart anything
  assert.equal(intro.introStart, before);
  assert.equal(intro.introing, false);
});

test('lifecycle: pageshow replay (via begin) resets the clock and reruns', () => {
  const now = fakeClock(1000);
  const intro = RI.createController({ now });
  intro.begin();
  intro.end();                       // first play finished
  // Navigate away and back → bfcache restore → shouldReplayOnPageshow(true, true) → begin().
  now.set(777000);
  intro.begin();
  assert.equal(intro.introing, true);
  assert.equal(intro.introStart, 777000);   // fresh start, not the stale 1000
});
