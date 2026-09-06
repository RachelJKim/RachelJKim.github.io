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
  // teaser: "/images/publications/your-clip.mp4",  // optional — fills the gray frame
}
```

Notes:
- Order the links `DOI → PDF → Video → Website` so the bars read the same down the page.
  Every link opens in a new tab — required, since this page runs inside an iframe.
- Teasers live in `frontend/public/images/publications/` and are **MP4, not GIF** — the
  same clips were 9-49 MB as GIF and 0.2-1.4 MB as H.264, with less dither banding. An
  `.mp4` teaser renders as a silent autoplaying loop; drop a same-named `.jpg` of the
  first frame beside it, which is used as the poster so the box is never blank.
  Any other extension still renders as a plain lazy `<img>`. The exact ffmpeg lines are
  in the header of `js/publications.js`.
- A paper with nothing published yet just omits `links` entirely; the bar disappears
  rather than showing dead `#` links.
- PDFs are self-hosted in `frontend/public/files/papers/` and linked as
  `/files/papers/<name>.pdf`, so they open straight in the browser's PDF viewer.
  Don't link Google Drive — a Drive `/file/d/…/view` URL forces the Drive UI.

## Files

- `index.html` — page shell (title + scroll port + roll).
- `js/publications.js` — **the list you edit.**
- `js/roll.js` — the roll geometry, the scroll-driven spin, and the capped top bounce.
- `css/styles.css` — layout + type. Geometry lives in `:root` custom properties.
- `fonts/`, `assets/` — TT Moons weights and the roll/paper textures (self-contained).

The original prototype this was copied from lives in
`ideas/toiletpaper/toilet-paper-scroll/` — kept for reference; deleting `ideas/`
does **not** affect this deployed copy.
