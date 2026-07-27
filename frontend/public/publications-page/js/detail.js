/* ═══════════════════════════════════════════════════════════════════
   The torn-off sheet.

   Click a publication (its row, its title, or its gray box) and its
   square rips along the perforation, flies to the centre of the window,
   and unfurls into one huge square of the same tissue carrying the full
   entry. Close and it blows away.

   The whole thing happens inside this document — the clone, the scrim
   and the sheet are body-level fixed elements — so the animation never
   crosses the iframe boundary. The parent React app is only *told* about
   it (postMessage) so it can mirror the state into the URL hash.
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  const railCol = document.querySelector(".railcol");
  const list    = document.getElementById("list");
  const detail  = document.getElementById("detail");
  const sheet   = document.getElementById("detailSheet");
  const scrim   = document.getElementById("detailScrim");
  if (!detail || !sheet || !scrim || !window.PUB_HTML) return;

  /* one busy flag shared with js/filter.js: a tab mid-rip and a sheet
     mid-flight must not run over each other */
  window.PUB_UI = window.PUB_UI || { busy: false };

  const H = window.PUB_HTML;
  const mobile = () => !railCol || getComputedStyle(railCol).display === "none";
  const U = () => (window.ROLL ? window.ROLL.unit() : 1.5);

  let open = false, openIndex = -1, lastTrigger = null;

  /* the ✕ lives beside the sheet (not in it), so it doesn't scroll away */
  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "detail-close";
  closeBtn.setAttribute("aria-label", "Close");
  closeBtn.textContent = "✕";
  detail.insertBefore(closeBtn, sheet);

  function contentHTML(p) {
    return `<div class="pub">
        <p class="pub-venue">[${H.venueLabel(p.venue)}]</p>
        <p class="pub-body"><span class="pub-title" id="detailTitle">${H.esc(p.title)}</span> <span class="pub-authors">(${H.authorsHTML(p)})</span></p>
        ${H.linksHTML(p)}
        ${p.abstract ? `<p class="detail-abstract">${H.esc(p.abstract)}</p>` : ""}
        ${p.teaser ? `<div class="detail-teaser"><img class="shot" src="${H.esc(p.teaser)}" alt=""><img class="box" src="assets/frame.png" alt=""></div>` : ""}
      </div>`;
  }

  function buildSheet(i) {
    const p = window.PUBLICATIONS[i];
    sheet.innerHTML = contentHTML(p);
    /* every sheet tears its own way — seeded by the publication */
    sheet.style.clipPath = window.TEAR.tornClip(i + 7, { jitter: 4.5 * U() });
    sheet.scrollTop = 0;
  }

  /* ── open ─────────────────────────────────────────────────────────── */

  function openDetail(i, { trigger = null, viaHost = false } = {}) {
    if (window.PUB_UI.busy || !window.PUBLICATIONS[i]) return;
    if (open) {                                  // host jumped between two ids
      if (openIndex !== i) { buildSheet(i); openIndex = i; }
      return;
    }
    window.PUB_UI.busy = true;
    open = true; openIndex = i; lastTrigger = trigger;

    buildSheet(i);
    detail.hidden = false; scrim.hidden = false;
    detail.style.opacity = "0";
    void scrim.offsetWidth;                      // let the transition see opacity:0
    scrim.classList.add("is-on");
    document.documentElement.classList.add("detail-open");
    document.body.classList.add("detail-open");

    const square = !mobile() && window.ROLL &&
      window.ROLL.squares().find(s => s.index === i);

    const finish = () => {
      detail.style.opacity = "";
      window.PUB_UI.busy = false;
      closeBtn.focus({ preventScroll: true });
      if (!viaHost) tellHost(H.slug(window.PUBLICATIONS[i]));
    };

    /* no square to rip (phone, reduced motion, deep link, filtered out):
       the sheet simply settles in */
    if (!square || window.TEAR.reduced() || viaHost) {
      const a = detail.animate(
        [{ opacity: 0, transform: "translateY(12px)" },
         { opacity: 1, transform: "none" }],
        { duration: 240, easing: "ease-out" });
      a.finished.catch(() => {}).then(finish);
      return;
    }

    /* the full ride: rip → fly → unfurl */
    const pair = window.TEAR.buildSquareClone(square);
    window.TEAR.tear(pair);

    const from = pair.clone.getBoundingClientRect();
    const to = sheet.getBoundingClientRect();
    const sx = to.width / from.width, sy = to.height / from.height;
    const dx = (to.left + to.width / 2) - (from.left + from.width / 2);
    const dy = (to.top + to.height / 2) - (from.top + from.height / 2);
    pair.clone.style.transformOrigin = "50% 50%";

    const flight = pair.clone.animate(
      [{ transform: "translate(0, 0) scale(1, 1) rotate(0deg)" },
       { transform: `translate(${dx * .5}px, ${dy * .5}px) scale(${((1 + sx) / 2).toFixed(3)}, ${((1 + sy) / 2).toFixed(3)}) rotate(2deg)`, offset: .5 },
       { transform: `translate(${dx}px, ${dy}px) scale(${sx.toFixed(3)}, ${sy.toFixed(3)}) rotate(0deg)` }],
      { duration: 480, delay: 170, easing: "cubic-bezier(.2,.7,.2,1)", fill: "forwards" });
    /* let the hinge relax on the way */
    pair.inner.animate(
      [{ transform: "rotate(2.5deg)" }, { transform: "rotate(0deg)" }],
      { duration: 480, delay: 170, easing: "ease-out", fill: "forwards" });

    flight.finished.catch(() => {}).then(() => {
      detail.animate([{ opacity: 0 }, { opacity: 1 }],
        { duration: 180, easing: "ease-out" });
      /* the entry's pieces settle on the fresh sheet one after another */
      sheet.querySelectorAll(".pub > *").forEach((el, k) => el.animate(
        [{ opacity: 0, transform: `translateY(${6 * U()}px)` },
         { opacity: 1, transform: "none" }],
        { duration: 240, delay: 60 + k * 45, easing: "ease-out", fill: "backwards" }));
      const gone = pair.clone.animate([{ opacity: 1 }, { opacity: 0 }],
        { duration: 160, easing: "ease-out", fill: "forwards" });
      gone.finished.catch(() => {}).then(() => pair.clone.remove());
      finish();
    });
  }

  /* ── close ────────────────────────────────────────────────────────── */

  function closeDetail({ viaHost = false } = {}) {
    if (!open || window.PUB_UI.busy) return;
    window.PUB_UI.busy = true;

    const simple = mobile() || window.TEAR.reduced();
    const a = simple
      ? detail.animate([{ opacity: 1 }, { opacity: 0 }],
          { duration: 200, easing: "ease-in", fill: "forwards" })
      : detail.animate(                                    /* blown away */
          [{ transform: "none", opacity: 1 },
           { transform: `translate(${30 * U()}px, -46vh) rotate(-6deg)`, opacity: 0 }],
          { duration: 420, easing: "cubic-bezier(.5,0,.85,.5)", fill: "forwards" });
    scrim.classList.remove("is-on");

    a.finished.catch(() => {}).then(() => {
      detail.hidden = true;
      a.cancel();                                          // drop the forwards fill
      setTimeout(() => { scrim.hidden = true; }, 320);
      document.documentElement.classList.remove("detail-open");
      document.body.classList.remove("detail-open");
      open = false; openIndex = -1;
      window.PUB_UI.busy = false;
      if (lastTrigger && document.contains(lastTrigger))
        lastTrigger.focus({ preventScroll: true });
      lastTrigger = null;
      if (!viaHost) tellHost(null);
    });
  }

  /* ── wiring ───────────────────────────────────────────────────────── */

  list.addEventListener("click", e => {
    if (e.target.closest("a")) return;                     // author / DOI links win
    const li = e.target.closest("li.pub");
    if (li) openDetail(+li.dataset.index, { trigger: li.querySelector(".pub-open") });
  });
  list.addEventListener("keydown", e => {
    if ((e.key !== "Enter" && e.key !== " ") || !e.target.classList) return;
    if (!e.target.classList.contains("pub-open")) return;
    e.preventDefault();
    const li = e.target.closest("li.pub");
    if (li) openDetail(+li.dataset.index, { trigger: e.target });
  });
  if (railCol) railCol.addEventListener("click", e => {
    const f = e.target.closest(".frame");
    if (f && f.dataset.index != null) {
      const li = list.querySelector(`li.pub[data-index="${f.dataset.index}"]`);
      openDetail(+f.dataset.index, { trigger: li && li.querySelector(".pub-open") });
    }
  });

  closeBtn.addEventListener("click", () => closeDetail());
  scrim.addEventListener("click", () => closeDetail());

  document.addEventListener("keydown", e => {
    if (!open) return;
    if (e.key === "Escape") { e.preventDefault(); closeDetail(); return; }
    if (e.key !== "Tab") return;
    /* keep Tab inside the sheet while it's the only thing on screen */
    const focusables = detail.querySelectorAll(
      "button, a[href], [tabindex]:not([tabindex='-1'])");
    if (!focusables.length) return;
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ── the parent app: URL hash mirroring ───────────────────────────── */

  function tellHost(id) {
    if (window.parent === window) return;
    try {
      window.parent.postMessage({ source: "tp-pubs", type: "detail", id }, window.location.origin);
    } catch (err) { /* host on another origin: no URL sync */ }
  }

  window.addEventListener("message", e => {
    if (e.origin !== window.location.origin) return;
    const d = e.data;
    if (!d || d.source !== "tp-pubs-host" || d.type !== "detail") return;
    if (d.id) {
      const idx = window.PUBLICATIONS.findIndex(p => H.slug(p) === d.id);
      if (idx >= 0) openDetail(idx, { viaHost: true });
    } else {
      closeDetail({ viaHost: true });
    }
  });
})();
