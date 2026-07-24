# Publications

A static page. Open `index.html`, or drop the folder onto any host.

```
index.html              markup only — five ids, no inline style or script
css/styles.css          type, rhythm, and all geometry
js/publications.js      the papers   ← edit this one
js/roll.js              the paper    (places, joins, turns)
assets/                 five derived images + the source photograph
tools/build_assets.py   regenerates assets/ from the photograph
fonts/                  drop TT Moons here
```

Chrome sometimes blocks web fonts over `file://`. If the type looks wrong,
serve the folder instead:

```bash
cd publications && python3 -m http.server 8000
```

## Adding a paper

Only `js/publications.js` changes. The perforations, the teaser frames and
the length of the paper all follow from the array.

```js
{
  venue: "UIST 26",                    // rendered as [UIST 26]
  title: "...",                        // wraps freely; the entry grows
  authors: [{ name: "Rachel Kim", me: true }, { name: "Xun Qian" }],
  links: [{ label: "PDF", href: "https://..." }],
  teaser: "assets/teasers/dobi.jpg",   // optional; fills that frame
}
```

`me: true` underlines that name, as in the artboard. Drop `links` and the row
is skipped. `http` links open in a new tab on their own.

## Layout

Geometry is in design units from the 1024.5 × 576 artboard. `--s` converts one
unit to pixels and is the only scaling knob:

    --s: min(calc((100vw - 72px) / 1024.5), 1.75px);

Entry spacing lives in the `:root` block — `--gap-title`, `--gap-authors`,
`--gap-links`, `--pad-rule`, `--gap-entry`. They are in design units, so
changing one shifts everything below it by that many units.

`js/roll.js` does not repeat any of these numbers. It reads them back out of
the computed style, so the stylesheet stays the single source of truth: move
`--lead` and the first entry, its perforation and its frame all move together.

| variable | what it does |
|---|---|
| `--lead` | where entry 01 sits. Must exceed `--roll-h` or the first teaser hides behind the roll |
| `--tuck` | how far the rail hides behind the cylinder |
| `--frame-*` | the teaser frame. It clears the paper by 6.4u a side; keep that if you change the width |
| `--perf-lift` | how far the perforation sits above its entry |
| `--tail-gap` | bare paper after the last entry, before the tear |

One knob lives in `js/roll.js` instead, because it is about motion rather than
position:

```js
const TEXTURE = 0.55;   // how strongly the turning surface reads. 0 = off
```

## Why the paper is built this way

The obvious approach — tile a photograph of tissue down the page — fails on a
list of unknown length, and the reasons are worth keeping written down.

**The seam you see is not a seam.** Row-mean brightness in the source photo
swings from 174 to 230. Tile that and the brightness curve restarts at every
repeat, so a light band and a dark band appear at a fixed pitch. The fix is not
a better crossfade: `tools/build_assets.py` strips the vertical shading out of
the texture entirely, and `css/styles.css` reapplies it once as a gradient in
px, anchored to the top of the rail. It never resets.

**Only the invisible repeats.** `grain.png` and `cloud.png` are synthesised by
randomising the phase of the photograph's own spectrum. An inverse FFT is
periodic by construction, so they tile with no seam at all — the pixel
difference across the wrap is smaller than the difference between two adjacent
rows inside the tile. Their rendered sizes are coprime, so the combined pattern
would only repeat after 37,280 px.

**There is only one piece of paper.** `roll.png` is cut at the cylinder's
silhouette and carries no photographed paper. The rail slides 10.5u up behind
the cylinder, which is wide enough there to cover it. The tail is not a
photograph either — it is the same background as the rail, shifted by the
rail's height so the grain's phase carries through, then cut to a torn
silhouette. Nothing is blended anywhere, because there is never a second
material to blend with.

**The cut interval means something.** A fixed pitch would drift against the
list. One perforation per publication instead, placed from each entry's
measured top, so repetition becomes structure.

## Fonts

TT Moons is a **trial** licence. Buy a licence before publishing, or swap the
`@font-face` blocks for the retail files. See `fonts/README.txt`.

## Rebuilding the assets

Only needed if you replace the photograph.

```bash
pip install pillow numpy scipy
python3 tools/build_assets.py
```

The region constants at the top of the script are measured off the current
925 × 1059 source; a different photograph needs them re-measured.
