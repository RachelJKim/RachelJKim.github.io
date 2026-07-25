# Publications page

A self-contained static page (its own HTML/CSS/JS + fonts + canvas roll animation).
The React app embeds it full-screen in an iframe at the `/publications` route
(`src/pages/Publications.jsx`), so its global styles and scripts stay isolated from
the rest of the site.

## To update the publication list

Edit **`js/publications.js`** — the `PUBLICATIONS` array is the only thing you touch.
Everything else (perforations, gray frames, paper length) is derived from it.

Add a paper as an object, newest first:

```js
{
  venue: "UIST 26",              // "UIST 26" -> [UIST'26]; a trailing word is kept: "UIST 26 Demo" -> [UIST'26 Demo]
  title: "Full paper title",     // wraps freely; the entry + frame grow with it
  authors: [                     // me:true underlines that name
    { name: "Rachel Kim", me: true },
    { name: "Co Author" },
  ],
  links: [                       // optional — omit the array to show no links row
    { label: "DOI",   href: "https://doi.org/..." },
    { label: "PDF",   href: "https://..." },
    { label: "Video", href: "https://..." },
  ],
  // teaser: "assets/teasers/your-image.png",  // optional image for the gray frame
}
```

Notes:
- `href: "#"` renders a link that goes nowhere — replace with the real URL (external
  URLs open in a new tab automatically).
- The file has a `LINKS()` helper used as a placeholder; give each paper its own
  `links` array with real hrefs when you have them.

## Files

- `index.html` — page shell (title + scroll port + roll).
- `js/publications.js` — **the list you edit.**
- `js/roll.js` — the roll geometry, the scroll-driven spin, and the capped top bounce.
- `css/styles.css` — layout + type. Geometry lives in `:root` custom properties.
- `fonts/`, `assets/` — TT Moons weights and the roll/paper textures (self-contained).

The original prototype this was copied from lives in
`ideas/toiletpaper/toilet-paper-scroll/` — kept for reference; deleting `ideas/`
does **not** affect this deployed copy.
