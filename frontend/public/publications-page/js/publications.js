/* ═══════════════════════════════════════════════════════════════════
   The list. This is the file to edit.

   Add a paper by adding an object to PUBLICATIONS. Everything else —
   the perforations, the teaser frames, the length of the paper — follows
   from this array, so you never have to touch the layout.

     venue    stored as "UIST 26" -> [UIST'26]; a trailing qualifier is
              kept, e.g. "UIST 26 Demo" -> [UIST'26 Demo]
     title    wraps freely; the entry grows and the frame moves with it
     authors  me:true underlines that name
     links    optional; omit the array and the row is skipped
     teaser   optional image path; fills that paper's gray frame

   Entries are listed newest first (time order).
   ═══════════════════════════════════════════════════════════════════ */

const LINKS = () => [
  { label: "DOI",   href: "#" },
  { label: "PDF",   href: "#" },
  { label: "Video", href: "#" },
];

window.PUBLICATIONS = [
  {
    venue: "UIST 26",
    title: "DOBI: Dynamic Opportunistic Body Input via Spare Joint Recruitment for Hands-Free XR",
    authors: [{ name: "Rachel Kim", me: true }, { name: "Xun Qian" }, { name: "Sang Ho Yoon" }],
    links: LINKS(),
  },
  {
    venue: "ToH 26",
    title: "VibGrasp: Spatiotemporal Vibration Based Multimodal Haptic Rendering with a Lightweight Exo-Glove for 3D Shape Perception",
    authors: [{ name: "Hojeong Lee" }, { name: "Eunho Kim" }, { name: "Rachel Kim", me: true }, { name: "Sang Ho Yoon" }],
    links: LINKS(),
  },
  {
    venue: "UIST 26 SIC",
    title: "Snap-Yo-Mind: Arousal-Triggered Capture of Emotionally Salient Moments",
    authors: [{ name: "Rachel Kim", me: true }, { name: "Donghee Hyun" }, { name: "Kyoungwhan Mheen" }],
    links: LINKS(),
  },
  {
    venue: "UIST 26 Demo",
    title: "Demonstrating DOBI: Dynamic Opportunistic Body Input via Spare Joint Recruitment for Hands-Free XR",
    authors: [{ name: "Rachel Kim", me: true }, { name: "Xun Qian" }, { name: "Sang Ho Yoon" }],
    links: LINKS(),
  },
  {
    venue: "IMWUT 25",
    title: "Moving-Press: Pressure-based Moving Phantom Sensation for Immersive VR Hand Interaction",
    authors: [{ name: "Dongkyu Kwak" }, { name: "Kyungjin Seo" }, { name: "Rachel Kim", me: true }, { name: "Sang Ho Yoon" }],
    links: LINKS(),
  },
  {
    venue: "UIST 25 Demo",
    title: "Pressure Movement Sensation with Rack and Pinion Based Wearable Interface",
    authors: [{ name: "DongKyu Kwak" }, { name: "Kyungjin Seo" }, { name: "Rachel Kim", me: true }, { name: "Sang Ho Yoon" }],
    links: LINKS(),
  },
  {
    venue: "UIST 25 SIC",
    title: "TactTail: Expanding Multimodal, Nonverbal Communication Between Human and Dog",
    authors: [{ name: "Rachel Kim", me: true }, { name: "Eunho Kim" }],
    links: LINKS(),
  },
  {
    venue: "IMWUT 23",
    title: "HapticPilot: Authoring In-situ Hand Posture-Adaptive Vibrotactile Feedback for Virtual Reality",
    authors: [{ name: "Youjin Sung" }, { name: "Rachel Kim", me: true }, { name: "Kun Woo Song" }, { name: "Yitian Shao" }, { name: "Sang Ho Yoon" }],
    links: LINKS(),
  },
  {
    venue: "VRST 22 Poster",
    title: "Exploring Vibration Intensity Map Of Hand Postures For Haptic Rendering In XR",
    authors: [{ name: "Youjin Sung" }, { name: "Yitian Shao" }, { name: "Rachel Kim", me: true }, { name: "Sang Ho Yoon" }],
    links: LINKS(),
  },
];

/* ── render ──────────────────────────────────────────────────────── */

(function () {
  const esc = s => String(s).replace(/[&<>"]/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* "UIST 26" -> "UIST'26", "UIST 26 Demo" -> "UIST'26 Demo":
     the space before the 2-digit year becomes an apostrophe. */
  const venueLabel = v => esc(v).replace(/\s+(\d{2})/, "&rsquo;$1");

  const list = document.getElementById("list");

  list.innerHTML = window.PUBLICATIONS.map(p => {
    const authors = p.authors
      .map(a => a.me ? `<span class="me">${esc(a.name)}</span>` : esc(a.name))
      .join(", ");

    const links = (p.links && p.links.length)
      ? `<p class="pub-links">${p.links.map(l => {
          const ext = /^https?:/i.test(l.href) ? ' target="_blank" rel="noopener"' : "";
          return `<a href="${esc(l.href)}"${ext}>${esc(l.label)}</a>`;
        }).join(" ")}</p>`
      : "";

    return `<li class="pub"${p.teaser ? ` data-teaser="${esc(p.teaser)}"` : ""}>
        <p class="pub-venue">[${venueLabel(p.venue)}]</p>
        <p class="pub-body"><span class="pub-title">${esc(p.title)}</span> <span class="pub-authors">(${authors})</span></p>
        ${links}
      </li>`;
  }).join("");
})();
