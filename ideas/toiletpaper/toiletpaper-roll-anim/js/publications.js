/* ═══════════════════════════════════════════════════════════════════
   The list. This is the file to edit.

   Add a paper by adding an object to PUBLICATIONS. Everything else —
   the perforations, the teaser frames, the length of the paper — follows
   from this array, so you never have to touch the layout.

     venue    rendered as [UIST 26]
     title    wraps freely; the entry grows and the frame moves with it
     authors  me:true underlines that name
     links    omit the array and the row is skipped
     teaser   optional image path; fills that paper's frame
   ═══════════════════════════════════════════════════════════════════ */

window.PUBLICATIONS = [
  {
    venue: "UIST 26",
    title: "DOBI: Dynamic Opportunistic Body Input via Spare Body Region Recruitment for Hands-Free XR",
    authors: [{ name: "Rachel Kim", me: true }, { name: "Xun Qian" }, { name: "Sang Ho Yoon" }],
    links: [{ label: "DOI", href: "#" }, { label: "PDF", href: "#" }, { label: "Video", href: "#" }],
    // teaser: "assets/teasers/dobi.jpg",
  },
  {
    venue: "ToH 26",
    title: "Rendering Localized Pseudo-Haptic Weight on the Forearm with Asymmetric Skin Stretch",
    authors: [{ name: "Rachel Kim", me: true }, { name: "Xun Qian" }, { name: "Sang Ho Yoon" }],
    links: [{ label: "DOI", href: "#" }, { label: "PDF", href: "#" }, { label: "Video", href: "#" }],
  },
  {
    venue: "CHI 26",
    title: "Peripheral Glance: Repurposing Idle Gaze Dwell Time as a Low-Cost Confirmation Channel",
    authors: [{ name: "Rachel Kim", me: true }, { name: "Sang Ho Yoon" }],
    links: [{ label: "DOI", href: "#" }, { label: "PDF", href: "#" }],
  },
  {
    venue: "IMWUT 25",
    title: "ThumbRail: Single-Handed Micro-Gestures on the Index Finger for Eyes-Free Wearable Control",
    authors: [{ name: "Rachel Kim", me: true }, { name: "Xun Qian" }, { name: "Sang Ho Yoon" }],
    links: [{ label: "DOI", href: "#" }, { label: "PDF", href: "#" }, { label: "Video", href: "#" }],
  },
  {
    venue: "UIST 25",
    title: "SkinScroll: Continuous Scrolling via Forearm Skin Deformation Sensing",
    authors: [{ name: "Rachel Kim", me: true }, { name: "Sang Ho Yoon" }],
    links: [{ label: "DOI", href: "#" }, { label: "PDF", href: "#" }, { label: "Video", href: "#" }],
  },
  {
    venue: "CHI 25",
    title: "Elastic Anchors: Reusing Physical Furniture Edges as Passive Haptic Proxies in Room-Scale VR",
    authors: [{ name: "Rachel Kim", me: true }, { name: "Xun Qian" }, { name: "Sang Ho Yoon" }],
    links: [{ label: "DOI", href: "#" }, { label: "PDF", href: "#" }],
  },
  {
    venue: "ISMAR 24",
    title: "Off-Screen Cues: Directing Attention Beyond the Field of View with Peripheral Vibrotactile Arrays",
    authors: [{ name: "Rachel Kim", me: true }, { name: "Sang Ho Yoon" }],
    links: [{ label: "DOI", href: "#" }, { label: "PDF", href: "#" }, { label: "Video", href: "#" }],
  },
  {
    venue: "MobileHCI 24",
    title: "Pocket Proprioception: Estimating Hand Pose from Wrist IMU Drift During Everyday Walking",
    authors: [{ name: "Rachel Kim", me: true }, { name: "Xun Qian" }, { name: "Sang Ho Yoon" }],
    links: [{ label: "DOI", href: "#" }, { label: "PDF", href: "#" }],
  },
];

/* ── render ──────────────────────────────────────────────────────── */

(function () {
  const esc = s => String(s).replace(/[&<>"]/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const list = document.getElementById("list");

  list.innerHTML = window.PUBLICATIONS.map(p => {
    const authors = p.authors
      .map(a => a.me ? `<span class="me">${esc(a.name)}</span>` : esc(a.name))
      .join(", ");

    const links = (p.links && p.links.length)
      ? `<div class="pub-links">${p.links.map(l => {
          const ext = /^https?:/i.test(l.href) ? ' target="_blank" rel="noopener"' : "";
          return `<a href="${esc(l.href)}"${ext}>${esc(l.label)}</a>`;
        }).join(" ")}</div>`
      : "";

    return `<li class="pub">
        <div class="pub-venue">[${esc(p.venue)}]</div>
        <h2 class="pub-title">${esc(p.title)}</h2>
        <div class="pub-authors">(${authors})</div>
        ${links}
      </li>`;
  }).join("");

  const years = window.PUBLICATIONS.map(p => p.venue.split(" ").pop());
  document.getElementById("meta").textContent =
    `${window.PUBLICATIONS.length} papers  ·  ${years[years.length - 1]}\u2013${years[0]}`;
})();
