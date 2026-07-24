/* ═══════════════════════════════════════════════════════════════════
   The paper.

   Three jobs, in this order:

     1  place  — cut the rail to length, hang the tail off the end, and put
                 one perforation and one teaser frame against each entry
     2  join   — carry the grain's phase across the rail/tail boundary
     3  turn   — roll the cylinder's surface at the paper's own speed

   Geometry is not duplicated here. Every number comes from the custom
   properties in css/styles.css, so the stylesheet stays the single source
   of truth and this file only decides what moves.
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  const railCol = document.querySelector(".railcol");
  if (!railCol) return;                       // small screens drop the roll

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
    ["roll-h", "lead", "tuck", "tail-h", "tail-gap", "perf-lift",
     "cyl-w", "cyl-h", "grain-tile"].forEach(k => {
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
    readGeometry();
    U = unit();
    const items = [...list.children];
    if (!items.length) return;

    /* Pin entry 01 to --lead so it always clears the roll and its teaser
       frame is fully visible on load. Measure the title block rather than
       assume its height, so a wrapped title or a late font still lands. */
    list.style.paddingTop = "0px";
    const natural = items[0].getBoundingClientRect().top -
                    railCol.getBoundingClientRect().top;
    list.style.paddingTop = Math.max(24 * U, G["lead"] * U - natural) + "px";

    railCol.querySelectorAll(".perf,.frame").forEach(n => n.remove());

    const base = railCol.getBoundingClientRect().top + window.pageYOffset;
    let end = 0;

    items.forEach((li, i) => {
      const box = li.getBoundingClientRect();
      const y = box.top + window.pageYOffset - base;
      end = box.bottom + window.pageYOffset - base;

      const perf = document.createElement("div");
      perf.className = "perf";
      perf.style.top = (y - G["perf-lift"] * U) + "px";
      railCol.appendChild(perf);

      const frame = document.createElement("div");
      frame.className = "frame";
      frame.style.top = y + "px";
      const teaser = window.PUBLICATIONS[i] && window.PUBLICATIONS[i].teaser;
      frame.innerHTML = teaser
        ? `<img src="${teaser}" alt="">`
        : "<b>teaser</b>";
      railCol.appendChild(frame);
    });

    /* End the rail exactly where the tail starts, then shift the tail's
       background up by the rail's height so the grain continues through
       the join. They overlap by 1px so no subpixel gap can open up. */
    const railTop = (G["roll-h"] - G["tuck"]) * U;
    const railH   = Math.max(40 * U, (end + G["tail-gap"] * U) - railTop);
    rail.style.bottom = "auto";
    rail.style.height = railH + "px";
    tail.style.top    = (railTop + railH - 1) + "px";
    const phase = -(railH - 1);
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
    const fed = Math.max(0, window.pageYOffset);
    if (fed === last) return;
    last = fed;
    draw(fed);
  }

  addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(tick); }
  }, { passive: true });

  addEventListener("resize", () => { layout(); last = -1; tick(); });

  layout();
  draw(0);

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  if (window.ResizeObserver) new ResizeObserver(layout).observe(col);

  /* entries dim once they pass above the roll — delete this block to drop it */
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      hits => hits.forEach(h => h.target.classList.toggle("is-out", !h.isIntersecting)),
      { rootMargin: "-14% 0px -8% 0px", threshold: 0.01 });
    [...list.children].forEach(e => io.observe(e));
  }
})();
