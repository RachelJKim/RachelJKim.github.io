/* ═══════════════════════════════════════════════════════════════════
   The paper.

   Three jobs, in this order:

     1  place  — cut the rail to length, hang the tail off the end, drop one
                 perforation per entry, and centre one gray-box frame in each
                 square of the paper
     2  join   — carry the grain's phase across the rail/tail boundary
     3  turn   — roll the cylinder's surface at the paper's own speed

   Unlike the original prototype the whole page does NOT scroll: only #port
   (the inner window) does. So the cylinder turns from port.scrollTop, and
   everything the paper carries lives inside that same scrolling context.

   Geometry is not duplicated here. Every number comes from the custom
   properties in css/styles.css, so the stylesheet stays the single source
   of truth and this file only decides what moves.
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  const railCol = document.querySelector(".railcol");
  if (!railCol) return;                       // small screens drop the roll

  const port  = document.getElementById("port");
  const col   = document.querySelector(".col");
  const list  = document.getElementById("list");
  const rail  = document.getElementById("rail");
  const tail  = document.getElementById("tail");
  const cv    = document.getElementById("spin");
  const ctx   = cv.getContext("2d");
  const dpr   = Math.min(window.devicePixelRatio || 1, 2);

  /* How strongly the embossed surface reads as it turns. 0 turns it off. */
  const TEXTURE = 0.55;

  const css = getComputedStyle(document.documentElement);
  const G = {};                               // geometry, in design units
  function readGeometry() {
    ["roll-h", "roll-shift", "lead", "tuck", "tail-h", "tail-gap", "perf-lift",
     "frame-h", "cyl-w", "cyl-h", "grain-tile"].forEach(k => {
      G[k] = parseFloat(css.getPropertyValue("--" + k));
    });
  }

  /* one design unit, in pixels — measured rather than recomputed, so the
     media query that redefines --s needs no mirror here */
  function unit() {
    const probe = document.createElement("div");
    probe.style.cssText = "position:absolute;visibility:hidden;width:calc(var(--s) * 100)";
    document.body.appendChild(probe);
    const u = probe.getBoundingClientRect().width / 100;
    probe.remove();
    return u;
  }

  let U = 1, CW = 0, CH = 0, R = 1, cy = 0;

  /* ── 1 + 2 · place and join ────────────────────────────────────── */

  let laying = false;
  function layout() {
    if (laying) return;
    laying = true;
    try { place(); } finally { requestAnimationFrame(() => { laying = false; }); }
  }

  function place() {
    /* small screens hide the roll: let CSS lay the page out normally and
       don't add the "clear the roll" padding that would leave a big gap */
    if (getComputedStyle(railCol).display === "none") {
      list.style.paddingTop = "";
      return;
    }

    readGeometry();
    U = unit();
    const items = [...list.children];
    if (!items.length) return;

    /* Pin entry 01 to --lead so it always clears the roll and its gray box
       is fully visible on load. Measure the title block rather than assume
       its height, so a wrapped title or a late font still lands. Because the
       rail and the list share one scrolling context, rect differences are
       independent of how far #port is scrolled. */
    list.style.paddingTop = "0px";
    const natural = items[0].getBoundingClientRect().top -
                    railCol.getBoundingClientRect().top;
    list.style.paddingTop = Math.max(24 * U, G["lead"] * U - natural) + "px";

    railCol.querySelectorAll(".perf,.frame").forEach(n => n.remove());

    const base = railCol.getBoundingClientRect().top;   // scroll-independent origin
    let end = 0;
    const perfTops = [], frames = [];

    items.forEach((li, i) => {
      const box = li.getBoundingClientRect();
      const y = box.top - base;
      end = box.bottom - base;

      const perfTop = y - G["perf-lift"] * U;
      const perf = document.createElement("div");
      perf.className = "perf";
      perf.style.top = perfTop + "px";
      railCol.appendChild(perf);

      const frame = document.createElement("div");
      frame.className = "frame";
      const teaser = window.PUBLICATIONS[i] && window.PUBLICATIONS[i].teaser;
      frame.innerHTML =
        (teaser ? `<img class="shot" src="${teaser}" alt="">` : "") +
        `<img class="box" src="assets/frame.png" alt="">`;
      railCol.appendChild(frame);

      perfTops.push(perfTop);
      frames.push(frame);
    });

    /* Each square runs from its own perforation to the next one's (the last
       one runs to where the tail begins). Centre the gray box in that span. */
    const frameH = G["frame-h"] * U;
    const lastBottom = end + G["tail-gap"] * U;
    frames.forEach((f, i) => {
      const top    = perfTops[i];
      const bottom = (i < perfTops.length - 1) ? perfTops[i + 1] : lastBottom;
      f.style.top = (top + (bottom - top - frameH) / 2) + "px";
    });

    /* End the rail exactly where the tail starts, then shift the tail's
       background up by the rail's height so the grain continues through
       the join. They overlap by 1px so no subpixel gap can open up. */
    const railTop = (G["roll-h"] - G["tuck"] - G["roll-shift"]) * U;
    const railH   = Math.max(40 * U, (end + G["tail-gap"] * U) - railTop);

    /* Extend the sheet UP behind the roll by several grain tiles, so an upward
       overscroll bounce — which drags the paper down past its tuck — always finds
       paper under the roll, however far it's pulled. Rising by a whole number of
       grain tiles keeps the visible grain phase identical.

       The roll's cast-shadow gradient is rebuilt with every stop pushed DOWN by the
       rise, so its fade stays anchored just below the roll exactly as before — the
       at-rest look is unchanged, since the extra sheet hides behind the roll — while
       the whole added top region is held at the shadow's darkest tone. A bounce then
       reveals continuous shaded paper that matches the first square, not a pale gap. */
    const rise = 5 * G["grain-tile"] * U;
    rail.style.bottom = "auto";
    rail.style.top    = (railTop - rise) + "px";
    rail.style.height = (railH + rise) + "px";

    const shade = [[.238, 10.5], [.236, 21.0], [.223, 31.6], [.183, 42.1], [.128, 52.6],
                   [.095, 63.1], [.065, 73.7], [.039, 84.2], [.018, 94.7], [.003, 105.2], [0, 168.4]]
      .map(([a, u]) => `rgba(22,20,16,${a}) ${(u * U + rise).toFixed(1)}px`).join(", ");
    rail.style.backgroundImage =
      'url("assets/grain.png"), url("assets/cloud.png"), ' +
      `linear-gradient(to bottom, ${shade}), ` +
      `linear-gradient(90deg, rgba(22,20,16,.13) 0px, rgba(22,20,16,0) ${(6 * U).toFixed(1)}px, ` +
      `rgba(22,20,16,0) calc(100% - ${(7 * U).toFixed(1)}px), rgba(22,20,16,.16) 100%)`;

    tail.style.top    = (railTop + railH - 1) + "px";
    const phase = -(railH + rise - 1);
    tail.style.backgroundPosition = `0 ${phase}px, 0 ${phase}px, 0 0`;
    railCol.style.minHeight = (railTop + railH + G["tail-h"] * U + 4) + "px";

    CW = G["cyl-w"] * U; CH = G["cyl-h"] * U;
    R = CH / 2; cy = CH / 2;
    cv.width = CW * dpr; cv.height = CH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingQuality = "high";
    buildBand();
  }

  /* ── 3 · turn ──────────────────────────────────────────────────── */

  const grain = new Image();
  let band = null, off = null, octx = null, fade = null, tile = 0;

  grain.onload = () => { buildBand(); last = -1; tick(); };
  grain.src = "assets/grain.png";

  function buildBand() {
    if (!grain.naturalWidth || !CW) { band = null; return; }

    /* the roll's own paper, tiled once into a strip we can sample rows from */
    tile = Math.max(8, Math.round(G["grain-tile"] * U));
    band = document.createElement("canvas");
    band.width = Math.ceil(CW);
    band.height = tile * 4;
    const b = band.getContext("2d");
    for (let y = 0; y < band.height; y += tile)
      for (let x = 0; x < band.width; x += tile)
        b.drawImage(grain, x, y, tile, tile);

    off = document.createElement("canvas");
    off.width = Math.ceil(CW); off.height = Math.ceil(CH);
    octx = off.getContext("2d");

    /* Silhouette falloff as one smooth ramp. Stepping the alpha row by row
       was itself drawing faint horizontal bands. */
    fade = octx.createLinearGradient(0, 0, 0, CH);
    for (let i = 0; i <= 40; i++) {
      const t = i / 40, s = (cy - t * CH) / R;
      const c = Math.abs(s) >= 1 ? 0 : Math.pow(1 - s * s, 0.25);
      fade.addColorStop(t, `rgba(0,0,0,${c.toFixed(3)})`);
    }
  }

  function draw(fed) {
    ctx.clearRect(0, 0, CW, CH);
    if (!band || TEXTURE <= 0) return;

    /* θ = fed ÷ R, so the surface travels at exactly the paper's speed.
       A point at angle θ sits at y = cy − R·sinθ, so a row at y is looking
       at arc position R·asin((cy−y)/R) + fed. Rows near the silhouette
       cover more arc, which is why the texture compresses there on its own. */
    octx.clearRect(0, 0, CW, CH);
    octx.globalCompositeOperation = "source-over";

    const STEP = 2;
    for (let y = 0; y < CH; y += STEP) {
      const s = (cy - (y + STEP / 2)) / R;
      if (s <= -0.999 || s >= 0.999) continue;
      const c = Math.sqrt(1 - s * s);
      let v = (R * Math.asin(s) + fed) % tile;
      if (v < 0) v += tile;
      /* cap the squash, or the slice averages to a flat tone and reads
         as a line */
      const sh = Math.min(STEP / c, STEP * 6);
      octx.drawImage(band, 0, v + tile - sh / 2, band.width, sh, 0, y, CW, STEP);
    }

    octx.globalCompositeOperation = "destination-in";
    octx.fillStyle = fade;
    octx.fillRect(0, 0, CW, CH);

    ctx.globalAlpha = TEXTURE;
    ctx.drawImage(off, 0, 0);
    ctx.globalAlpha = 1;
  }

  /* ── wiring ────────────────────────────────────────────────────── */

  let ticking = false, last = -1;
  function tick() {
    ticking = false;
    const fed = Math.max(0, port.scrollTop);   // the inner window drives the roll
    if (fed === last) return;
    last = fed;
    draw(fed);
  }

  port.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(tick); }
  }, { passive: true });

  /* ── a hard-capped bounce at the very top ──────────────────────────
     overscroll-behavior:none (CSS) killed the native rubber-band, because a hard
     fling could stretch it past the spare tissue and reveal a cut. This puts the
     bounce back with a firm ceiling: the paper springs down a little, resisting
     more the further it's pulled, and can never pass the spare sheet. It moves the
     paper + list together (a transform, so the grid layout is untouched) while the
     roll stays frozen. Desktop only — small screens hide the roll. */
  let pull = 0, spring = 0, idle = 0, locked = false;
  function setPull(p) {
    pull = p;
    const t = p > 0.5 ? `translateY(${p.toFixed(1)}px)` : "";
    railCol.style.transform = t;
    col.style.transform = t;
  }
  function springBack() {
    cancelAnimationFrame(spring);
    (function step() {
      if (pull > 0.5) { setPull(pull * 0.72); spring = requestAnimationFrame(step); }
      else setPull(0);
    })();
  }
  port.addEventListener("wheel", (e) => {
    /* A downward scroll always wins: it cancels any bounce/lock and passes straight
       through to native scrolling, so you can scroll into the list the instant the
       paper starts coming back from the top — never intercepted, never stuck. */
    if (e.deltaY >= 0) {
      if (locked || pull > 0.5) { locked = false; clearTimeout(idle); springBack(); }
      return;
    }
    if (port.scrollTop > 0) return;         // upward but not at the top → normal scroll
    e.preventDefault();
    /* One fling = one bounce. Each upward wheel keeps the gesture "alive"; the bounce
       only resets once the fling has gone quiet (no wheels for a beat), so the inertia
       tail can't re-trigger a second bounce (the self-oscillation). */
    clearTimeout(idle);
    idle = setTimeout(() => { locked = false; springBack(); }, 160);
    if (locked) return;                     // already bounced this gesture — hold at rest
    const max = 120 * U;                    // the ceiling, well within the tissue
    setPull(Math.min(max, pull + (-e.deltaY) * (1 - pull / max) * 0.5));  // resist near the cap
    if (pull >= max - 0.5) { locked = true; springBack(); }               // hit the top → rebound once
  }, { passive: false });

  addEventListener("resize", () => { layout(); last = -1; tick(); });

  layout();
  draw(0);

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  if (window.ResizeObserver) new ResizeObserver(layout).observe(col);

  /* entries dim once they pass up behind the roll — delete this block to drop it.
     The root is the port now, since that is what scrolls. */
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      hits => hits.forEach(h => h.target.classList.toggle("is-out", !h.isIntersecting)),
      { root: port, rootMargin: "-14% 0px -8% 0px", threshold: 0.01 });
    [...list.children].forEach(e => io.observe(e));
  }
})();
