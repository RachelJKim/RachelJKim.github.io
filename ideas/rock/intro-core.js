/* Rock pile-in — pure, DOM-free lifecycle logic.
   Shared by app.js (loaded as a <script> in the browser) and intro.test.js (node --test).
   Nothing here touches window/document/performance, so it can be driven with a fake clock
   and asserted on directly. app.js owns everything DOM: it feeds these functions a clock
   and pointer/rock state and renders whatever snapshots they return.

   The one behavior worth pinning down in tests is "leave the page and come back":
   requestAnimationFrame is frozen while a tab is hidden, so when you return, the intro's
   whole duration can look elapsed and the pile snaps to finished instead of animating.
   createController().onVisible() rebases the clock to prevent exactly that. */
;(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();  // node
  else root.RockIntro = factory();                                                  // browser
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Should the intro play? Precedence: reduced-motion wins, then the ?intro= URL param,
  // then the INTRO_ENABLED default. `introParam` is the raw string ('0' | '1' | null | …).
  function resolveIntroOn({ introParam, enabled, reducedMotion }) {
    if (reducedMotion) return false;
    if (introParam === '0') return false;
    if (introParam === '1') return true;
    return !!enabled;
  }

  // Only a bfcache restore (navigating away and back) auto-replays, and only when the
  // intro is enabled for this visit. A normal load is handled by the decode path instead.
  function shouldReplayOnPageshow(persisted, introOn) {
    return !!persisted && !!introOn;
  }

  // Landing ease over t in [0,1]: long soft deceleration (close to easeOutCubic) with a
  // trace of overshoot near t≈0.9, so a rock dips a hair under its rest size and settles
  // rather than snapping. easeLand(0) === 0, easeLand(1) === 1.
  function easeLand(t) {
    return 1 + 1.15 * Math.pow(t - 1, 3) + 0.15 * Math.pow(t - 1, 2);
  }

  // Assign each rock's fall timing and motion. `order` is the rocks sorted biggest-first
  // (big ones land earliest, building the base). `rng` is a 0..1 source — injectable so
  // tests are deterministic. Mutates delay/dur/dRot/dx/dy on each rock.
  function assignTiming(order, rng, c) {
    order.forEach((r, i) => {
      r.delay = i * c.STAGGER + rng() * c.JITTER;
      r.dur = c.FALL * (0.85 + rng() * 0.3);
      r.dRot = (rng() - 0.5) * 2 * c.SPIN;
      const a = rng() * 6.28, d = rng() * c.DRIFT;
      r.dx = Math.cos(a) * d;
      r.dy = Math.sin(a) * d;
    });
  }

  // A rock's rendered state at time `now`. Pure: returns a snapshot, mutates nothing.
  //   phase 'waiting' — not dropped yet (fully transparent, at start scale)
  //   phase 'falling' — mid-fall (scale/offset/rotation eased, opacity ramping then solid)
  //   phase 'landed'  — at rest (scale 1, opacity 1, no offset)
  function stepRock(r, now, introStart, c) {
    const t = (now - introStart - r.delay) / r.dur;
    if (t >= 1) return { phase: 'landed', scale: 1, ox: 0, oy: 0, rot: 0, opacity: 1 };
    if (t <= 0) return { phase: 'waiting', scale: c.SCALE, ox: r.dx, oy: r.dy, rot: r.dRot, opacity: 0 };
    const e = easeLand(t);
    return {
      phase: 'falling',
      scale: c.SCALE + (1 - c.SCALE) * e,
      ox: r.dx * (1 - e),
      oy: r.dy * (1 - e),
      rot: r.dRot * (1 - e),
      // Full opacity by t === FADE, so a rock spends most of its fall solid and 123
      // overlapping cutouts never stack into haze.
      opacity: t >= c.FADE ? 1 : t / c.FADE,
    };
  }

  // Have all rocks landed? (Whole pile settled → intro can hand off to the physics loop.)
  function isComplete(order, now, introStart) {
    return order.every(r => (now - introStart - r.delay) / r.dur >= 1);
  }

  // The "leave & return" state machine. `now` is an injected clock (performance.now in the
  // browser, a fake in tests). Holds just the intro's start time and whether it's running.
  function createController({ now }) {
    let introStart = 0, introing = false;
    return {
      get introing() { return introing; },
      get introStart() { return introStart; },
      begin() { introStart = now(); introing = true; },   // start (or replay) the pile-in
      onVisible() { if (introing) introStart = now(); },   // rebase after a background freeze
      end() { introing = false; },                         // pile settled → physics take over
    };
  }

  return {
    resolveIntroOn, shouldReplayOnPageshow, easeLand,
    assignTiming, stepRock, isComplete, createController,
  };
});
