/* ═══════════════════════════════════════════════════════════════════
   Tearing machinery, shared by js/detail.js and js/filter.js.

   A "tear" is three parts:

     tornClip   — a jagged polygon for a clip-path. Seeded, so a given
                  square always rips along the same fibres.
     buildSquareClone — a fixed-position copy of one square of the paper,
                  its grain phase-locked to the rail underneath, so the
                  moment it appears nothing on screen changes.
     tear / flyAway — the rip along the perforation, and the tumble off
                  the page.

   Everything animates through the Web Animations API: the keyframes are
   computed from live geometry, which CSS keyframes can't express.
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  const rail = document.getElementById("rail");

  /* mulberry32 — tiny seeded PRNG so tears are reproducible per square */
  function rng(seed) {
    let a = (seed * 2654435761) >>> 0 || 1;
    return () => {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const css = () => getComputedStyle(document.documentElement);
  const prop = k => parseFloat(css().getPropertyValue("--" + k));
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── torn edges ─────────────────────────────────────────────────────
     One polygon walks left→right across the top, drops to the bottom
     right, walks right→left across the bottom, and closes. Jitter is in
     px so it reads the same on a small square and the huge sheet.
     `flat` zeroes the top jitter but keeps every vertex, because
     clip-path only interpolates between polygons of equal length. */
  function tornPoints(rand, jitter, points) {
    const ys = [];
    for (let i = 0; i <= points; i++) ys.push((rand() * jitter).toFixed(1));
    return ys;
  }
  function polygon(topYs, botYs, points) {
    const pts = [];
    for (let i = 0; i <= points; i++)
      pts.push(`${(i / points * 100).toFixed(2)}% ${topYs ? topYs[i] + "px" : "0%"}`);
    for (let i = points; i >= 0; i--)
      pts.push(`${(i / points * 100).toFixed(2)}% ${botYs ? `calc(100% - ${botYs[i]}px)` : "100%"}`);
    return `polygon(${pts.join(", ")})`;
  }

  /* the animatable pair: straight perforation -> ripped through it */
  function tearPair(seed, jitter) {
    const points = 24;
    const rand = rng(seed);
    const ys = tornPoints(rand, jitter, points);
    return {
      flat:   polygon(null, null, points),
      jagged: polygon(ys, null, points),
    };
  }

  /* a static torn silhouette (top and/or bottom), for the detail sheet */
  function tornClip(seed, { top = true, bottom = true, jitter = 6 } = {}) {
    const points = 30;
    const rand = rng(seed);
    const topYs = top ? tornPoints(rand, jitter, points) : null;
    const botYs = bottom ? tornPoints(rand, jitter, points) : null;
    return polygon(topYs, botYs, points);
  }

  /* ── the clone ──────────────────────────────────────────────────────
     Copies one square (a span of the rail between two perforations) into
     a fixed element. The rail's own recipe is rebuilt inline with every
     layer's phase shifted by the square's offset from the rail's top, so
     grain, cloud AND the roll's cast shadow all line up with the paper
     underneath — the swap is invisible until the tear starts. */
  const SHADE = [[.238, 10.5], [.236, 21.0], [.223, 31.6], [.183, 42.1], [.128, 52.6],
                 [.095, 63.1], [.065, 73.7], [.039, 84.2], [.018, 94.7], [.003, 105.2], [0, 168.4]];

  function buildSquareClone(square) {
    const U = window.ROLL.unit();
    const railRect = window.ROLL.railRect();
    const rise = 5 * prop("grain-tile") * U;

    /* offset of the square's top from the rail ELEMENT's top (which sits
       `rise` above the visible paper top, hidden behind the roll) */
    const off = square.top - window.ROLL.railTop();

    const clone = document.createElement("div");
    clone.className = "clone";
    const h = square.bottom - square.top;
    clone.style.cssText =
      `left:${railRect.left}px; top:${square.perf.getBoundingClientRect().top}px;` +
      `width:${railRect.width}px; height:${h}px;`;

    const inner = document.createElement("div");
    inner.className = "clone-inner";
    const g = prop("grain-tile") * U, c = prop("cloud-tile") * U;
    const shade = SHADE
      .map(([a, u]) => `rgba(22,20,16,${a}) ${(u * U + rise - off).toFixed(1)}px`).join(", ");
    inner.style.backgroundImage =
      'url("assets/grain.png"), url("assets/cloud.png"), ' +
      `linear-gradient(to bottom, ${shade}), ` +
      `linear-gradient(90deg, rgba(22,20,16,.13) 0px, rgba(22,20,16,0) ${(6 * U).toFixed(1)}px, ` +
      `rgba(22,20,16,0) calc(100% - ${(7 * U).toFixed(1)}px), rgba(22,20,16,.16) 100%)`;
    inner.style.backgroundRepeat = "repeat, repeat, no-repeat, no-repeat";
    inner.style.backgroundSize = `${g}px ${g}px, ${c}px ${c}px, 100% 100%, 100% 100%`;
    inner.style.backgroundBlendMode = "multiply, multiply, normal, normal";
    inner.style.backgroundPosition = `0 ${-off}px, 0 ${-off}px, 0 0, 0 0`;
    inner.style.transformOrigin = "50% 100%";
    clone.appendChild(inner);

    /* the square's own perforation dashes ride along on the torn edge */
    const dash = document.createElement("div");
    dash.style.cssText =
      `position:absolute; left:${6 * U}px; right:${6 * U}px; top:0; height:1.6px;` +
      "background:repeating-linear-gradient(90deg, rgba(22,20,16,.40) 0 4px, transparent 4px 10px);";
    inner.appendChild(dash);

    /* carry the gray box (and its teaser) along */
    const frameRect = square.frame.getBoundingClientRect();
    const frame = square.frame.cloneNode(true);
    frame.style.left = (frameRect.left - railRect.left) + "px";
    frame.style.top = (frameRect.top - square.perf.getBoundingClientRect().top) + "px";
    inner.appendChild(frame);

    clone.dataset.index = square.index;
    document.body.appendChild(clone);
    return { clone, inner };
  }

  /* the rip: the top edge tears through the perforation while the sheet
     hinges forward a touch from its still-attached bottom edge */
  function tear({ clone, inner }, { duration = 220, delay = 0 } = {}) {
    const pair = tearPair(+clone.dataset.index + 1, 3.5 * window.ROLL.unit());
    inner.style.clipPath = pair.jagged;                    // final state
    const a = inner.animate(
      [{ clipPath: pair.flat, transform: "rotate(0deg)" },
       { clipPath: pair.jagged, transform: "rotate(2.5deg)" }],
      { duration, delay, easing: "ease-out", fill: "both" });
    return a.finished.catch(() => {});
  }

  /* the tumble: down and off the page with a paper-y wobble */
  function flyAway({ clone }, { dx = 0, rot = 18, delay = 0, duration = 700 } = {}) {
    const a = clone.animate(
      [{ transform: "translate(0, 0) rotate(0deg)", opacity: 1 },
       { transform: `translate(${dx * .35}px, 16vh) rotate(${(rot * .45).toFixed(1)}deg)`,
         opacity: 1, offset: .45 },
       { transform: `translate(${dx * .7}px, 36vh) rotate(${(rot * .8).toFixed(1)}deg)`,
         opacity: .9, offset: .72 },
       { transform: `translate(${dx}px, 62vh) rotate(${rot}deg)`, opacity: 0 }],
      { duration, delay, easing: "cubic-bezier(.45,.05,.85,.4)", fill: "forwards" });
    const done = a.finished.catch(() => {});
    done.then(() => clone.remove());
    return done;
  }

  window.TEAR = { rng, tornClip, tearPair, buildSquareClone, tear, flyAway, reduced };
})();
