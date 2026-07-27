/* ═══════════════════════════════════════════════════════════════════
   The category tabs: All · Journal/Conference · Demo/Poster.

   Picking one rips every non-matching square off the roll (they tear
   along their perforations, staggered, and tumble off the page) while
   the surviving squares slide up and close ranks — a FLIP: positions are
   measured before and after the relayout and the difference is played
   back as transforms, so roll.js's real layout code stays in charge of
   where everything actually lives.

   On phones there are no squares, so the rows simply fade.
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  const meta = document.getElementById("meta");
  const list = document.getElementById("list");
  const railCol = document.querySelector(".railcol");
  const rail = document.getElementById("rail");
  if (!meta || !list || !window.PUBLICATIONS) return;

  window.PUB_UI = window.PUB_UI || { busy: false };

  const TABS = [
    ["all", "All"],
    ["journal", "Journal · Conference"],
    ["demo", "Demo · Poster"],
  ];

  const FLIP_DUR = 520, FLIP_DELAY = 140, TEAR_STAG = 70;
  const EASE = "cubic-bezier(.22,.61,.21,1)";

  const mobile = () => !railCol || getComputedStyle(railCol).display === "none";
  const U = () => window.ROLL.unit();

  /* ── the tabs ─────────────────────────────────────────────────────── */

  meta.innerHTML = TABS.map(([key, label]) =>
    `<button type="button" class="tab" data-filter="${key}"
       aria-pressed="${key === "all"}">${label}</button>`).join("");
  const live = document.createElement("span");
  live.className = "vh";
  live.setAttribute("aria-live", "polite");
  meta.appendChild(live);

  let current = "all";

  meta.addEventListener("click", e => {
    const tab = e.target.closest(".tab");
    if (tab) apply(tab.dataset.filter);
  });

  function announce() {
    const n = [...list.children].filter(li => !li.classList.contains("is-filtered")).length;
    live.textContent = `Showing ${n} publication${n === 1 ? "" : "s"}`;
  }

  /* ── the switch ───────────────────────────────────────────────────── */

  function apply(next) {
    if (next === current || window.PUB_UI.busy) return;
    window.PUB_UI.busy = true;
    current = next;
    meta.querySelectorAll(".tab").forEach(t =>
      t.setAttribute("aria-pressed", String(t.dataset.filter === next)));

    const lis = [...list.children];
    const wants = li => next === "all" || li.dataset.type === next;

    if (mobile() || window.TEAR.reduced()) { applySimple(lis, wants); return; }

    /* FIRST — where everything sits now, keyed by publication index so it
       survives place() rebuilding the perf/frame nodes */
    const before = new Map();
    window.ROLL.squares().forEach(s => before.set(s.index, {
      li: s.li.getBoundingClientRect().top,
      perf: s.perf.getBoundingClientRect().top,
      frame: s.frame.getBoundingClientRect().top,
    }));
    const oldTailTop = window.ROLL.tail.getBoundingClientRect().top;
    const oldRailH = rail.getBoundingClientRect().height;

    /* rip the leavers off — their clones carry the visual while the real
       squares are relaid underneath. Offscreen squares just vanish. */
    let k = 0;
    window.ROLL.squares().forEach(s => {
      if (wants(s.li)) return;
      const r = s.perf.getBoundingClientRect();
      if (r.top > innerHeight || s.frame.getBoundingClientRect().bottom < 0) return;
      const pair = window.TEAR.buildSquareClone(s);
      const rand = window.TEAR.rng(s.index + 31);
      window.TEAR.tear(pair, { delay: k * TEAR_STAG });
      window.TEAR.flyAway(pair, {
        dx: (rand() - .35) * 120 * U(),
        rot: (rand() < .5 ? -1 : 1) * (14 + rand() * 14),
        delay: k * TEAR_STAG + 150,
      });
      k++;
    });

    /* relayout for real, then freeze roll.js's observers until the
       slide has finished playing */
    const shown = [];
    lis.forEach(li => {
      const want = wants(li);
      if (want && li.classList.contains("is-filtered")) shown.push(li);
      li.classList.toggle("is-filtered", !want);
    });
    window.ROLL.layout();
    window.ROLL.retick();
    window.PUB_UI.freeze = true;

    /* LAST + INVERT + PLAY — one shared timing for rows, perfs, frames,
       the rail's length and the tail, so the paper moves as one sheet */
    const slide = (el, dy) => {
      if (Math.abs(dy) < .5) return;
      el.animate(
        [{ transform: `translateY(${dy}px)` }, { transform: "none" }],
        { duration: FLIP_DUR, delay: FLIP_DELAY, easing: EASE, fill: "backwards" });
    };
    window.ROLL.squares().forEach(s => {
      const was = before.get(s.index);
      if (shown.includes(s.li)) {
        [s.li, s.perf, s.frame].forEach(el => el.animate(
          [{ opacity: 0, transform: `translateY(${12 * U()}px)` },
           { opacity: 1, transform: "none" }],
          { duration: 380, delay: FLIP_DELAY + 160, easing: "ease-out", fill: "backwards" }));
      } else if (was) {
        slide(s.li, was.li - s.li.getBoundingClientRect().top);
        slide(s.perf, was.perf - s.perf.getBoundingClientRect().top);
        slide(s.frame, was.frame - s.frame.getBoundingClientRect().top);
      }
    });
    slide(window.ROLL.tail, oldTailTop - window.ROLL.tail.getBoundingClientRect().top);
    const newRailH = rail.getBoundingClientRect().height;
    if (Math.abs(newRailH - oldRailH) > .5) rail.animate(
      [{ height: oldRailH + "px" }, { height: newRailH + "px" }],
      { duration: FLIP_DUR, delay: FLIP_DELAY, easing: EASE, fill: "backwards" });

    setTimeout(() => {
      window.PUB_UI.freeze = false;
      if (window.PUB_UI.pendingLayout) {
        window.PUB_UI.pendingLayout = false;
        window.ROLL.layout();
      }
      window.ROLL.retick();
      window.PUB_UI.busy = false;
      announce();
    }, FLIP_DELAY + Math.max(FLIP_DUR, 160 + 380) + 60);
  }

  /* phones / reduced motion: no squares to rip — a quiet crossfade */
  function applySimple(lis, wants) {
    const hiding = lis.filter(li => !wants(li) && !li.classList.contains("is-filtered"));
    const showing = lis.filter(li => wants(li) && li.classList.contains("is-filtered"));
    const fade = window.TEAR.reduced() ? 0 : 180;

    hiding.forEach(li => li.animate([{ opacity: 1 }, { opacity: 0 }],
      { duration: fade, easing: "ease-in", fill: "forwards" }));

    setTimeout(() => {
      lis.forEach(li => li.classList.toggle("is-filtered", !wants(li)));
      hiding.forEach(li => li.getAnimations().forEach(a => a.cancel()));
      window.ROLL.layout();
      window.ROLL.retick();
      showing.forEach(li => li.animate([{ opacity: 0 }, { opacity: 1 }],
        { duration: fade ? 240 : 0, easing: "ease-out" }));
      window.PUB_UI.busy = false;
      announce();
    }, fade);
  }
})();
