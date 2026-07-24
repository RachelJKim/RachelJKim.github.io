# Publications page

Static page — open `index.html`, or drop the whole folder onto any host.

## Adding a paper

Edit the `PUBLICATIONS` array at the top of `js/publications.js`:

```js
{
  venue: "UIST 25",                     // rendered as [UIST 25]
  title: "...",
  authors: [{ name: "Rachel Kim", me: true }, { name: "Xun Qian" }],
  links: [{ label: "PDF", href: "https://..." }]
}
```

`me: true` underlines that name, as in the artboard. Omit `links` and the row
is skipped. External links open in a new tab automatically.

## Teasers

Every paper gets its own hand-drawn frame on the tissue (x 66.4 -> 213.0,
91.2 tall — the same four boxes the artboard has). It scrolls with its entry.

Add a `teaser` path to fill it:

```js
{ venue: "UIST 25", teaser: "assets/teasers/uist25.jpg", title: "..." }
```

The image is inset 6 units and uses `object-fit: cover`, so any aspect ratio
crops cleanly inside the frame. Frames left empty stay empty on desktop and
are hidden on phones (`.pub-teaser.is-empty`).

## Layout

Geometry is transcribed from the source SVG artboard (1024.5 x 576 design
units). `--s` in `css/styles.css` converts one design unit to pixels and is
the only scaling knob:

    --s: min(calc(100vw / 1024.5), calc(100vh / 576), 1.8px);

Raise the `1.8px` cap if you want the page to grow further on large displays.

Entry spacing lives in the `:root` block — `--gap-title`, `--gap-authors`,
`--gap-links`, `--pad-rule`, `--gap-entry`. They are in design units, so
changing one shifts everything below it by that many units.

## The scrollport

`.port` is the window the publications travel through. `--fade-in` and
`--fade-out` set how far entries dissolve at the top and bottom edges;
`--fade-in` is deliberately the same as the list's top padding, so the first
entry is crisp on load but outgoing entries soften before they clip.

## Fonts

TT Moons is a **trial** licence. Buy a licence before publishing, or swap the
`@font-face` blocks for the retail files.
