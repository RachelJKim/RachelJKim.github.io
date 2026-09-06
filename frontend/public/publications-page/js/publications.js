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
       type:    "journal",             // REQUIRED — "journal" (Journal/Conference)
                                       //   or "demo" (Demo/Poster). Drives the
                                       //   filter tabs under the page title.
       id:      "dobi",                // OPTIONAL — url slug for the detail view
                                       //   (/publications#dobi). Left out -> one
                                       //   is derived from the title.
       title:   "Full paper title …",  // wraps freely; the frame follows it
       authors: [
         { name: "Rachel Kim", me: true },   // me:true underlines the name
         { name: "Co Author" },
       ],
       links: [                        // the gray bar under the authors; see the
         { label: "DOI", href: "…" },  //   link conventions note below. Omit the
       ],                              //   field entirely -> no links row at all
       teaser:  "/images/publications/name.mp4", // OPTIONAL — fills the gray box.
                                       //   Drop the file in
                                       //   frontend/public/images/publications/ and
                                       //   match its aspect ratio to the frame.
                                       //   Leave the field out -> the box shows a
                                       //   handwritten "Coming Soon" instead.
                                       //   See the teaser-format note below: an
                                       //   .mp4 becomes a silent looping <video>,
                                       //   anything else a lazy-loaded <img>.
       abstract: "One paragraph …",    // OPTIONAL — shown only on the torn-off
                                       //   detail sheet, never in the list.
     },
   ────────────────────────────────────────────────────────────────────
   Entries are listed newest first (time order).
   ═══════════════════════════════════════════════════════════════════ */

// ── link conventions ─────────────────────────────────────────────────
// Every paper writes its own `links:` array; there is no shared placeholder.
// Order them DOI → PDF → Video → Website so the bars read the same down the page.
//
//   DOI      https://doi.org/…            the publisher's landing page
//   PDF      /files/papers/<id>.pdf       self-hosted, see below
//   Video    https://youtu.be/…           the paper video
//   Website  https://<name>.hcitech.org/  the project website
//
// PDFs are served from this repo (frontend/public/files/papers/) rather than
// Google Drive: a Drive /file/d/…/view link forces the Drive viewer UI, while a
// same-origin .pdf is handed straight to the browser's built-in PDF viewer and
// opens in a new tab. To add one, drop the file in that folder and link it as
// "/files/papers/<name>.pdf" — public/ is copied to the site root verbatim.
//
// A paper with nothing published yet simply omits `links:` — the bar disappears
// instead of showing dead "#" links.

// ── teaser format — MP4, not GIF ─────────────────────────────────────
// Teasers are short silent loops, and a GIF pays ~30x for that: the same clips
// ran 9-49 MB each as GIF and 0.2-1.4 MB as H.264, with *less* dither banding.
// So: export the loop as .mp4 (yuv420p + faststart so it streams, no audio
// track) and drop a matching .jpg of the first frame beside it as the poster.
//
//   ffmpeg -i clip.gif -c:v libx264 -preset slow -crf 26 \
//          -pix_fmt yuv420p -movflags +faststart -an clip.mp4
//   ffmpeg -i clip.gif -frames:v 1 -q:v 6 clip.jpg
//
// A ".mp4" teaser renders as a muted autoplaying loop with its .jpg as the
// poster; any other extension still renders as a plain lazy <img>, so a
// one-off PNG or GIF keeps working.

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
    type: "journal",
    id: "dobi",
    title: "DOBI: Dynamic Opportunistic Body Input via Spare Joint Recruitment for Hands-Free XR",
    authors: [{ name: "Rachel Kim", me: true }, { name: "Xun Qian" }, { name: "Sang Ho Yoon" }],
    // not out yet — add links once UIST'26 publishes
    teaser: "/images/publications/dobi.mp4",
  },
  {
    venue: "UIST 26 Demo",
    type: "demo",
    id: "dobi-demo",
    title: "Demonstrating DOBI: Dynamic Opportunistic Body Input via Spare Joint Recruitment for Hands-Free XR",
    authors: [{ name: "Rachel Kim", me: true }, { name: "Xun Qian" }, { name: "Sang Ho Yoon" }],
    // UIST'26 adjunct proceedings aren't in the ACM DL yet — add the DOI when they are
  },
  {
    venue: "UIST 26 SIC",
    type: "demo",
    id: "snap-yo-mind",
    title: "Snap-Yo-Mind: Arousal-Triggered Capture of Emotionally Salient Moments",
    authors: [{ name: "Rachel Kim", me: true }, { name: "Donghee Hyun" }, { name: "Kyoungwhan Mheen" }],
    // UIST'26 adjunct proceedings aren't in the ACM DL yet — add the DOI when they are
  },
  {
    venue: "ToH 26",
    type: "journal",
    id: "vibgrasp",
    title: "VibGrasp: Spatiotemporal Vibration Based Multimodal Haptic Rendering with a Lightweight Exo-Glove for 3D Shape Perception",
    authors: [{ name: "Hojeong Lee" }, { name: "Eunho Kim" }, { name: "Rachel Kim", me: true }, { name: "Sang Ho Yoon" }],
    links: [
      { label: "DOI",     href: "https://doi.org/10.1109/TOH.2026.3685691" },
      { label: "PDF",     href: "/files/papers/vibgrasp.pdf" },
      { label: "Website", href: "https://vibgrasp.hcitech.org/" },
    ],
    teaser: "/images/publications/VibGrasp.mp4",
  },
  {
    venue: "IMWUT 25",
    type: "journal",
    id: "moving-press",
    title: "Moving-Press: Pressure-based Moving Phantom Sensation for Immersive VR Hand Interaction",
    authors: [{ name: "Dongkyu Kwak" }, { name: "Kyungjin Seo" }, { name: "Rachel Kim", me: true }, { name: "Sang Ho Yoon" }],
    links: [
      { label: "DOI",     href: "https://doi.org/10.1145/3770682" },
      { label: "PDF",     href: "/files/papers/moving-press.pdf" },
      { label: "Video",   href: "https://youtu.be/_APRIPN81SE" },
      { label: "Website", href: "https://moving-press.hcitech.org/" },
    ],
    teaser: "/images/publications/moving-press.mp4",
  },
  {
    venue: "UIST 25 Demo",
    type: "demo",
    id: "rack-pinion-demo",
    title: "Pressure Movement Sensation with Rack and Pinion Based Wearable Interface",
    authors: [{ name: "DongKyu Kwak" }, { name: "Kyungjin Seo" }, { name: "Rachel Kim", me: true }, { name: "Sang Ho Yoon" }],
    links: [
      { label: "DOI", href: "https://doi.org/10.1145/3746058.3760439" },
    ],
  },
  {
    venue: "UIST 25 SIC",
    type: "demo",
    id: "tacttail",
    title: "TactTail: Expanding Multimodal, Nonverbal Communication Between Human and Dog",
    authors: [{ name: "Rachel Kim", me: true }, { name: "Eunho Kim" }],
    links: [
      { label: "DOI", href: "https://doi.org/10.1145/3746058.3758976" },
    ],
  },
  {
    venue: "IMWUT 23",
    type: "journal",
    id: "hapticpilot",
    title: "HapticPilot: Authoring In-situ Hand Posture-Adaptive Vibrotactile Feedback for Virtual Reality",
    authors: [{ name: "Youjin Sung" }, { name: "Rachel Kim", me: true }, { name: "Kun Woo Song" }, { name: "Yitian Shao" }, { name: "Sang Ho Yoon" }],
    links: [
      { label: "DOI",     href: "https://doi.org/10.1145/3631453" },
      { label: "PDF",     href: "/files/papers/hapticpilot.pdf" },
      { label: "Video",   href: "https://youtu.be/PJk7SUa8ZpI" },
      { label: "Website", href: "https://hapticpilot.hcitech.org/" },
    ],
    teaser: "/images/publications/hapticpilot.mp4",
  },
  {
    venue: "VRST 22 Poster",
    type: "demo",
    id: "vibration-intensity-map",
    title: "Exploring Vibration Intensity Map Of Hand Postures For Haptic Rendering In XR",
    authors: [{ name: "Youjin Sung" }, { name: "Yitian Shao" }, { name: "Rachel Kim", me: true }, { name: "Sang Ho Yoon" }],
    links: [
      { label: "DOI", href: "https://doi.org/10.1145/3562939.3565672" },
      { label: "PDF", href: "/files/papers/vibration-intensity-map.pdf" },
    ],
  },
];

/* ── render ──────────────────────────────────────────────────────── */

(function () {
  const esc = s => String(s).replace(/[&<>"]/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* "UIST 26" -> "UIST'26", "UIST 26 Demo" -> "UIST'26 Demo":
     the space before the 2-digit year becomes an apostrophe. */
  const venueLabel = v => esc(v).replace(/\s+(\d{2})/, "&rsquo;$1");

  /* url slug for the detail view: an explicit id wins, else the first few
     title words. Kept stable so /publications#slug links keep working. */
  const slug = p => p.id || String(p.title).toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "").trim().split(/\s+/).slice(0, 5).join("-");

  const list = document.getElementById("list");

  // case-insensitive name -> homepage lookup, built once from AUTHOR_LINKS
  const authorHref = (() => {
    const m = {};
    for (const k in AUTHOR_LINKS) m[k.toLowerCase()] = AUTHOR_LINKS[k];
    return name => m[String(name).toLowerCase()] || "";
  })();

  const authorsHTML = p => p.authors
    .map(a => {
      const label = a.me ? `<span class="me">${esc(a.name)}</span>` : esc(a.name);
      const href = a.href || authorHref(a.name);           // explicit href wins, else the map
      return href
        ? `<a href="${esc(href)}" target="_blank" rel="noopener">${label}</a>`
        : label;
    })
    .join(", ");

  /* The inside of the gray box, shared by the list frame and the detail sheet.
     An .mp4 teaser becomes a silent looping video: preload="none" + autoplay
     lets the browser fetch it only once the box scrolls into view, so opening
     the page costs the poster frames and nothing else. Everything else stays
     an <img>, and a paper with no teaser yet gets the handwritten placeholder
     so the box never reads as a rendering failure. */
  const teaserHTML = t => {
    if (!t) return `<span class="soon">Coming Soon</span>`;
    if (/\.mp4$/i.test(t)) {
      /* muted + playsinline is what makes autoplay allowed at all; the poster
         is the clip's own first frame, so the box is never blank while the
         video arrives. preload="metadata" keeps the initial cost to a header —
         browsers hold off on the rest, and pause the loop, while the frame is
         scrolled out of view. */
      const poster = t.replace(/\.mp4$/i, ".jpg");
      return `<video class="shot" src="${esc(t)}" poster="${esc(poster)}"`
           + ` autoplay loop muted playsinline preload="metadata"></video>`;
    }
    return `<img class="shot" src="${esc(t)}" alt="" loading="lazy" decoding="async">`;
  };

  /* Everything but a bare in-page anchor opens in a new tab. The self-hosted
     PDFs are same-origin, and this page runs inside an iframe — without the
     target they would replace the scroll with the browser's PDF viewer. */
  const linksHTML = p => (p.links && p.links.length)
    ? `<p class="pub-links">${p.links.map(l => {
        const ext = /^#/.test(l.href) ? "" : ' target="_blank" rel="noopener"';
        return `<a href="${esc(l.href)}"${ext}>${esc(l.label)}</a>`;
      }).join(" ")}</p>`
    : "";

  list.innerHTML = window.PUBLICATIONS.map((p, i) => {
    const authors = authorsHTML(p);
    const links = linksHTML(p);

    /* data-index ties this row back to PUBLICATIONS[i] even when the filter
       hides rows, so DOM position and array index may disagree safely.
       The title stays a <span> (a real <button> is an atomic box, which would
       push the authors off its last wrapped line) but acts as one — click and
       Enter/Space are wired in js/detail.js. */
    return `<li class="pub" data-index="${i}" data-type="${esc(p.type || "journal")}" data-id="${esc(slug(p))}"${p.teaser ? ` data-teaser="${esc(p.teaser)}"` : ""}>
        <p class="pub-venue">[${venueLabel(p.venue)}]</p>
        <p class="pub-body"><span class="pub-title pub-open" role="button" tabindex="0" aria-haspopup="dialog">${esc(p.title)}</span> <span class="pub-authors">(${authors})</span></p>
        ${links}
      </li>`;
  }).join("");

  /* shared by js/detail.js, which rebuilds one entry at sheet size —
     same markup builders, so list and detail can never drift apart */
  window.PUB_HTML = { esc, venueLabel, slug, authorsHTML, linksHTML, teaserHTML };
})();
