/* ═══════════════════════════════════════════════════════════════════
   PUBLICATIONS — the ONE file to edit.

   The whole /publications page is generated from the array below: the
   perforations, the gray teaser frames, and the length of the paper all
   follow from it. To add / edit / reorder / remove a paper you only touch
   THIS file — never roll.js, styles.css, or the HTML. Each paper is one
   self-contained object; all of its info lives together in that object.

   ── shape of one entry ─────────────────────────────────────────────
     {
       venue:   "UIST 26",             // "UIST 26" -> [UIST'26]; a trailing
                                       //   qualifier is kept: "UIST 26 Demo"
       title:   "Full paper title …",  // wraps freely; the frame follows it
       authors: [
         { name: "Rachel Kim", me: true },   // me:true underlines the name
         { name: "Co Author" },
       ],
       links:   LINKS(),               // the shared DOI/PDF/Video placeholder,
                                       //   OR give this paper its own list:
                                       //     [{ label: "PDF", href: "https://…" }]
                                       //   omit the field entirely -> no links row
       teaser:  "/images/publications/name.gif",  // OPTIONAL — fills the gray box.
                                       //   Drop the file in
                                       //   frontend/public/images/publications/ and
                                       //   match its aspect ratio to the frame.
                                       //   Leave the field out -> box stays blank.
     },
   ────────────────────────────────────────────────────────────────────
   Entries are listed newest first (time order).
   ═══════════════════════════════════════════════════════════════════ */

// Default placeholder links, shared by any paper that just writes `links: LINKS()`.
// To give a paper real, independent links, replace its `links:` with an inline array
// (see the template above). Editing this list changes the placeholder for all papers
// still using it.
const LINKS = () => [
  { label: "DOI",   href: "#" },
  { label: "PDF",   href: "#" },
  { label: "Video", href: "#" },
];

// ── Co-author homepages — the one place to edit author links ─────────
// List a co-author here and every occurrence of that name, across ALL papers,
// becomes a link to their page. Matching is case-insensitive, so a stray casing
// (e.g. "DongKyu" vs "Dongkyu") still links. Remove a line to unlink someone;
// anyone not listed (and you) renders as plain text. A per-author `href:` in the
// PUBLICATIONS array still wins over this map if you ever need a one-off.
const AUTHOR_LINKS = {
  "Kyungjin Seo":     "https://www.linkedin.com/in/kyungjin-seo-209b98143/",
  "Dongkyu Kwak":     "https://kwak-dongkyu.github.io/Kwak-DongKyu/",
  "Youjin Sung":      "https://youjinsung.com/",
  "Sang Ho Yoon":     "https://sanghoy.com/",
  "Xun Qian":         "https://www.xun-qian.com/",
  "Hojeong Lee":      "https://leeeho.github.io/leeho.io/index.html",
  "Kyoungwhan Mheen": "https://kwmheen.github.io/",
  "Eunho Kim":        "https://www.linkedin.com/in/eunho-kim-54059126a",
  "Donghee Hyun":     "https://www.linkedin.com/in/donghee-hyun-4715b0265/",
  "Kun Woo Song":     "https://www.linkedin.com/in/kun-woo-song-1557b2112/",
};

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
    teaser: "/images/publications/VibGrasp.gif",
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
    teaser: "/images/publications/moving-press.gif",
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
    teaser: "/images/publications/hapticpilot.gif",
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

  // case-insensitive name -> homepage lookup, built once from AUTHOR_LINKS
  const authorHref = (() => {
    const m = {};
    for (const k in AUTHOR_LINKS) m[k.toLowerCase()] = AUTHOR_LINKS[k];
    return name => m[String(name).toLowerCase()] || "";
  })();

  list.innerHTML = window.PUBLICATIONS.map(p => {
    const authors = p.authors
      .map(a => {
        const label = a.me ? `<span class="me">${esc(a.name)}</span>` : esc(a.name);
        const href = a.href || authorHref(a.name);         // explicit href wins, else the map
        return href
          ? `<a href="${esc(href)}" target="_blank" rel="noopener">${label}</a>`
          : label;
      })
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
