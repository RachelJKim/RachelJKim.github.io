/* ============================================================
   Publications data + scrollport behaviour.

   To add a paper, add an object to PUBLICATIONS. Mark yourself
   with me: true and your name gets underlined automatically.
   Drop the `links` array (or leave it empty) and that row is
   simply not rendered.

   `teaser` is optional: give it an image path and it fills that
   paper's hand-drawn frame. Leave it out and the frame stays
   empty (and is hidden entirely on phones).
   ============================================================ */

const PUBLICATIONS = [
  {
    venue: "UIST 25",
    // teaser: "assets/teasers/uist25.jpg",
    title: "VUDE: Dynamic Opportunistic Body Input via Spare Body Region Recruitment for Hands-Free XR",
    authors: [{ name: "Rachel Kim", me: true }, { name: "Xun Qian" }, { name: "Sang Ho Yoon" }],
    links: [{ label: "DOI", href: "#" }, { label: "PDF", href: "#" }, { label: "Video", href: "#" }]
  },
  {
    venue: "ToH 26",
    title: "VUDE: Dynamic Opportunistic Body Input via Spare Body Region Recruitment for Hands-Free XR",
    authors: [{ name: "Rachel Kim", me: true }, { name: "Xun Qian" }, { name: "Sang Ho Yoon" }],
    links: [{ label: "DOI", href: "#" }, { label: "PDF", href: "#" }, { label: "Video", href: "#" }]
  },
  {
    venue: "CHI 26",
    title: "VUDE: Dynamic Opportunistic Body Input via Spare Body Region Recruitment for Hands-Free XR",
    authors: [{ name: "Rachel Kim", me: true }, { name: "Xun Qian" }, { name: "Sang Ho Yoon" }],
    links: [{ label: "DOI", href: "#" }, { label: "PDF", href: "#" }, { label: "Video", href: "#" }]
  },
  {
    venue: "IMWUT 25",
    title: "VUDE: Dynamic Opportunistic Body Input via Spare Body Region Recruitment for Hands-Free XR",
    authors: [{ name: "Rachel Kim", me: true }, { name: "Xun Qian" }, { name: "Sang Ho Yoon" }],
    links: [{ label: "DOI", href: "#" }, { label: "PDF", href: "#" }, { label: "Video", href: "#" }]
  },
  {
    venue: "ISMAR 24",
    title: "VUDE: Dynamic Opportunistic Body Input via Spare Body Region Recruitment for Hands-Free XR",
    authors: [{ name: "Rachel Kim", me: true }, { name: "Xun Qian" }, { name: "Sang Ho Yoon" }],
    links: [{ label: "DOI", href: "#" }, { label: "PDF", href: "#" }]
  },
  {
    venue: "CHI 24",
    title: "VUDE: Dynamic Opportunistic Body Input via Spare Body Region Recruitment for Hands-Free XR",
    authors: [{ name: "Rachel Kim", me: true }, { name: "Sang Ho Yoon" }],
    links: [{ label: "DOI", href: "#" }]
  }
];

/* ── render ─────────────────────────────────────────────── */

const list = document.getElementById("list");
const port = document.getElementById("port");
const hint = document.getElementById("hint");

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

function authorLine(authors) {
  const p = el("p", "pub-authors");
  p.append("(");
  authors.forEach((a, i) => {
    if (i) p.append(", ");
    if (a.me) p.append(el("span", "me", a.name));
    else p.append(a.name);
  });
  p.append(")");
  return p;
}

function linkLine(links) {
  const p = el("p", "pub-links");
  links.forEach(l => {
    const a = el("a", null, l.label);
    a.href = l.href || "#";
    if (a.href && !a.href.startsWith("#")) { a.target = "_blank"; a.rel = "noopener"; }
    p.append(a);
  });
  return p;
}

function teaserBox(pub) {
  const box = el("div", "pub-teaser");
  if (pub.teaser) {
    const shot = el("img", "teaser-shot");
    shot.src = pub.teaser;
    shot.alt = "";
    box.append(shot);
  } else {
    box.classList.add("is-empty");
  }
  const frame = el("img", "teaser-frame");
  frame.src = "assets/frame.png";
  frame.alt = "";
  box.append(frame);
  return box;
}

PUBLICATIONS.forEach(pub => {
  const li = el("li", "pub");
  li.append(teaserBox(pub));

  const body = el("div", "pub-body");
  body.append(el("p", "pub-venue", "[" + pub.venue + "]"));
  body.append(el("h2", "pub-title", pub.title));
  body.append(authorLine(pub.authors));
  if (pub.links && pub.links.length) body.append(linkLine(pub.links));
  li.append(body);

  list.append(li);
});

/* ── which entry is in the tissue ───────────────────────── */
/* Anything inside the clear middle band of the port reads as
   current; entries drifting into the fades go quiet.          */

const entries = [...list.children];

if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    hits => hits.forEach(h => h.target.classList.toggle("is-active", h.isIntersecting)),
    { root: port, rootMargin: "-8% 0px -34% 0px", threshold: 0.01 }
  );
  entries.forEach(e => io.observe(e));
} else {
  entries.forEach(e => e.classList.add("is-active"));
}

/* ── scroll hint ────────────────────────────────────────── */

let hinted = false;
function dismissHint() {
  if (hinted) return;
  hinted = true;
  hint.classList.add("is-gone");
}
port.addEventListener("scroll", dismissHint, { passive: true, once: true });
setTimeout(dismissHint, 6000);

/* ── let the wheel drive the port from anywhere on the page ─ */

const desktop = window.matchMedia("(min-width: 761px) and (min-height: 421px)");

window.addEventListener("wheel", e => {
  if (!desktop.matches) return;
  if (port.contains(e.target)) return;   // already scrolling it
  port.scrollTop += e.deltaY;
  dismissHint();
}, { passive: true });

/* keyboard: the port is focusable, so arrows and page keys work */
port.addEventListener("keydown", e => {
  if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End"].includes(e.key)) dismissHint();
});
