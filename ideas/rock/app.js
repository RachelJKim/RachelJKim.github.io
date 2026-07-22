/* Rock pile — interactive physics
   Data comes from data.js (window.ROCK_DATA), which is derived from assets/positions.json.
   Each rock cutout is placed at its stored (x, y). The cursor repels rocks near their
   centroid (cx, cy); larger rocks (bigger area) are heavier and move less.

   ---- Tunables (change these to alter the feel) ----
   R      : reaction radius in display pixels
   REPEL  : how hard the cursor pushes
   K      : spring stiffness pulling each rock back home (higher = snappier return)
   DAMP   : velocity damping (lower = settles faster / less bounce, higher = bouncier)
*/
const R = 125, REPEL = 2.2, K = 0.035, DAMP = 0.74;
const CLICK_IMPULSE = 26;      // strength of the pop when a rock is clicked
const SCATTER_MIN = 14, SCATTER_RANGE = 20;

/* ---- Intro pile-in ----
   Set INTRO_ENABLED to false to skip it — the pile just appears, already settled, and the
   cursor physics behave exactly as before. Override per-visit with ?intro=0 / ?intro=1
   (handy for comparing without editing), and call playRockIntro() to replay it on demand.

   The source photo is shot from directly above, so the screen plane *is* the ground.
   A rock sliding in from the top edge would read as skidding sideways along the ground,
   which is why that looks wrong. Instead each rock falls toward the camera: it starts
   large (near the lens), shrinks to its resting size as it meets the ground, and lands
   with a short squash. Lateral drift is kept tiny so the motion stays vertical-in-depth.  */
const INTRO_ENABLED = true;    // master switch for the pile-in animation
const INTRO_FALL = 620;        // ms for a single rock's fall
const INTRO_STAGGER = 6;       // ms between rocks (big ones land first, forming the base)
const INTRO_JITTER = 110;      // ms of randomness per rock so it doesn't look mechanical
// Cutouts are stored at native coordinate resolution and drawn below 1:1, so a modest
// start scale keeps the intro from ever upscaling past native and going soft.
const INTRO_SCALE = 1.22;      // starting scale — how "close to the lens" a rock begins
const INTRO_DRIFT = 8;         // px of lateral drift while falling
const INTRO_SPIN = 7;          // max degrees of spin, settling to level
const INTRO_FADE = 0.22;       // fraction of the fall spent fading in (short = crisp)

const DATA = window.ROCK_DATA;
const stage = document.getElementById('stage');
const stagewrap = document.getElementById('stagewrap');
const maxA = Math.max(...DATA.rocks.map(r => r.area));
let S = 1;
let localW = 0, localH = 0;   // stage's own (pre-rotation) size in px; used to map the cursor

const rocks = DATA.rocks.map(r => {
  const img = new Image();
  img.src = 'assets/cutouts/' + r.file;
  img.draggable = false;
  stage.appendChild(img);
  const mass = 0.35 + 0.65 * Math.sqrt(r.area / maxA);   // big rocks are heavier
  return {
    ...r, img, mass, ox: 0, oy: 0, vx: 0, vy: 0, rot: 0, vr: 0,
    sc: 1,                                 // render scale (driven by the intro)
    delay: 0, dur: INTRO_FALL,             // intro timing, assigned in playIntro()
    dRot: 0, dx: 0, dy: 0,                 // per-rock intro rotation / drift, ditto
  };
});

// Biggest rocks land first so the pile visibly builds from its base outward.
const fallOrder = [...rocks].sort((a, b) => b.area - a.area);

function layout() {
  // The source image is portrait, so we rotate the whole stage 90 deg to read as
  // landscape and fill the width. S scales original coords to display pixels, sized
  // so the rotated (landscape) width fills 94% of the viewport.
  S = (window.innerWidth * 0.94) / DATA.canvas.h;
  const pw = DATA.canvas.w * S, ph = DATA.canvas.h * S;   // stage's own portrait size
  localW = pw; localH = ph;
  stage.style.width = pw + 'px';
  stage.style.height = ph + 'px';
  stage.style.transform = 'translate(-50%, -50%) rotate(270deg)';
  // Wrapper reserves the rotated (landscape) footprint so page layout stays correct.
  stagewrap.style.width = ph + 'px';
  stagewrap.style.height = pw + 'px';
  for (const r of rocks) {
    r.img.style.width = (r.w * S) + 'px';
    r.img.style.height = (r.h * S) + 'px';
    r.hx = r.x * S;   r.hy = r.y * S;      // home top-left (px)
    r.pcx = r.cx * S; r.pcy = r.cy * S;    // centroid (px)
  }
}
layout();
window.addEventListener('resize', layout);

let mx = -1e5, my = -1e5;
function pos(e) {
  // Invert the 270 deg stage rotation to map the pointer into the stage's own coords.
  const rc = stagewrap.getBoundingClientRect();
  mx = localW - (e.clientY - rc.top);
  my = e.clientX - rc.left;
}
stage.addEventListener('pointermove', pos);
stage.addEventListener('pointerleave', () => { mx = -1e5; my = -1e5; });

// Click a rock -> push it away from the cursor, then let it spring back
stage.addEventListener('pointerdown', e => {
  pos(e);
  const r = rocks.find(o => o.img === e.target);
  if (!r) return;
  let dx = r.pcx + r.ox - mx, dy = r.pcy + r.oy - my, d = Math.hypot(dx, dy) || 1;
  const P = CLICK_IMPULSE / r.mass;
  r.vx += dx / d * P; r.vy += dy / d * P; r.vr += (Math.random() - 0.5) * 10;
  r.img.style.zIndex = 999;
});

document.getElementById('scatter').onclick = () => {
  for (const r of rocks) {
    const a = Math.random() * 6.28, p = (SCATTER_MIN + Math.random() * SCATTER_RANGE) / r.mass;
    r.vx += Math.cos(a) * p; r.vy += Math.sin(a) * p; r.vr += (Math.random() - 0.5) * 10;
  }
};
document.getElementById('reset').onclick = () => {
  for (const r of rocks) { r.ox = r.oy = r.vx = r.vy = r.rot = r.vr = 0; r.img.style.zIndex = ''; }
};

// All intro math/lifecycle lives in intro-core.js (DOM-free, so it's unit-testable).
// IC bundles the tunables above into the shape those functions expect.
const IC = {
  FALL: INTRO_FALL, STAGGER: INTRO_STAGGER, JITTER: INTRO_JITTER,
  SCALE: INTRO_SCALE, DRIFT: INTRO_DRIFT, SPIN: INTRO_SPIN, FADE: INTRO_FADE,
};
const intro = RockIntro.createController({ now: () => performance.now() });

/* Start (or restart) the pile-in. Exposed as window.playRockIntro() so a route change can
   replay it when this page is entered from another one — this always plays, even when the
   automatic intro is turned off, which is the hook for the React version. */
function playIntro() {
  RockIntro.assignTiming(fallOrder, Math.random, IC);
  for (const r of rocks) {
    r.ox = r.oy = r.vx = r.vy = r.rot = r.vr = 0;
    r.sc = INTRO_SCALE;
    r.img.style.opacity = '0';
    r.img.style.zIndex = '';
  }
  intro.begin();
}
window.playRockIntro = playIntro;

function frame(now) {
  if (intro.introing) {
    let allLanded = true;
    for (const r of rocks) {
      const s = RockIntro.stepRock(r, now, intro.introStart, IC);
      if (s.phase !== 'landed') allLanded = false;
      if (s.phase === 'waiting') { r.img.style.opacity = '0'; continue; }   // not yet dropped
      r.sc = s.scale; r.ox = s.ox; r.oy = s.oy; r.rot = s.rot;
      r.img.style.opacity = s.phase === 'landed' ? '' : (s.opacity === 1 ? '1' : s.opacity.toFixed(2));
      r.img.style.transform =
        'translate(' + (r.hx + r.ox).toFixed(1) + 'px,' + (r.hy + r.oy).toFixed(1) + 'px)' +
        ' rotate(' + r.rot.toFixed(2) + 'deg) scale(' + r.sc.toFixed(3) + ')';
    }
    if (allLanded) intro.end();
    requestAnimationFrame(frame);
    return;
  }
  for (const r of rocks) {
    // Repel from cursor
    const dx = (r.pcx + r.ox) - mx, dy = (r.pcy + r.oy) - my, d = Math.hypot(dx, dy) || 0.001;
    if (d < R) {
      const f = (R - d) / R, push = f * f * REPEL * R / r.mass;
      r.vx += dx / d * push * 0.12; r.vy += dy / d * push * 0.12;
    }
    // Spring back home + damping
    r.vx += (-r.ox) * K; r.vy += (-r.oy) * K;
    r.vx *= DAMP; r.vy *= DAMP;
    r.ox += r.vx; r.oy += r.vy;
    // Gentle lean toward horizontal motion, settling back to level
    r.vr += (-r.rot) * 0.06 - r.vx * 0.18; r.vr *= 0.72; r.rot += r.vr * 0.1;
    // Drop the raised z-index once a clicked rock has settled
    if (Math.abs(r.vx) < 0.02 && Math.abs(r.vy) < 0.02 &&
        Math.abs(r.ox) < 0.4 && Math.abs(r.oy) < 0.4 && r.img.style.zIndex === '999') {
      r.img.style.zIndex = '';
    }
    r.img.style.transform =
      'translate(' + (r.hx + r.ox).toFixed(1) + 'px,' + (r.hy + r.oy).toFixed(1) + 'px)' +
      ' rotate(' + r.rot.toFixed(2) + 'deg)';
  }
  requestAnimationFrame(frame);
}

// ?intro=0 / ?intro=1 overrides the constant for this visit; otherwise INTRO_ENABLED wins.
// A reduced-motion preference disables it regardless.
const introParam = new URLSearchParams(location.search).get('intro');
const introOn = RockIntro.resolveIntroOn({
  introParam,
  enabled: INTRO_ENABLED,
  reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
});

requestAnimationFrame(frame);

// Registered unconditionally: rAF is frozen while the tab is hidden, so on return the
// intro's whole duration can look elapsed and the pile snaps to finished. Rebasing the
// clock resumes it instead. A manually-triggered intro (React route change) needs this too.
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) intro.onVisible();
});

if (introOn) {
  // Hide the pile until the intro starts, so nothing flashes into place first.
  for (const r of rocks) r.img.style.opacity = '0';
  // Wait for the cutouts to decode, otherwise early rocks land as blank gaps.
  Promise.all(rocks.map(r => r.img.decode().catch(() => {}))).then(playIntro);
}

// Coming back to the page (bfcache restore) replays the pile-in when it's enabled.
window.addEventListener('pageshow', e => {
  if (RockIntro.shouldReplayOnPageshow(e.persisted, introOn)) playIntro();
});
