# Rock pile — interactive

A single source photo, segmented into 123 individual rocks (instance segmentation),
rebuilt as an interactive page where each rock reacts to the cursor.

## Run it

Open `index.html` in a browser. No server or build step required.
(The coordinate data is injected as a global by `data.js`, and images load via relative
paths, so it works even from `file://`.)

## Controls

- Move the cursor near the rocks → they push away from it (bigger rocks are heavier and move less).
- Click a rock → it pops away from the cursor, then springs back.
- **Scatter all** / **Reset** buttons clear or restore the whole pile.

## Folder structure

```
rock-pile-interactive/
├── index.html            entry point (loads data.js + app.js)
├── style.css             styles
├── app.js                physics / interaction logic
├── data.js               window.ROCK_DATA = coordinate data (copy of positions.json)
├── README.md
└── assets/
    ├── original.jpg      original photo
    ├── positions.json    per-rock coordinate data (source)
    ├── rocks-mosaic.svg  vector mosaic, each rock filled with its mean color
    ├── rocks-outline.svg line-art version, outlines only
    └── cutouts/          rock-001.png ... rock-123.png (transparent, full resolution)
```

## Coordinate data (`positions.json` / `data.js`)

```jsonc
{
  "canvas": { "w": 1206, "h": 2103 },   // original photo size (px)
  "count": 123,
  "rocks": [
    {
      "id": 1,
      "file": "rock-001.png",   // file inside assets/cutouts/
      "x": 345, "y": 1382,      // top-left position to place the cutout
      "w": 708, "h": 428,       // cutout size
      "cx": 730.7, "cy": 1586.9,// centroid (used for distance / reaction)
      "area": 143434            // area (used as mass)
    }
    // ...
  ]
}
```

Placing each cutout at its `(x, y)` reassembles the original pile exactly.

## Tuning the reaction

Change the constants at the top of `app.js`.

| Constant | Meaning | Increase it →|
|----------|---------|--------------|
| `R` | reaction radius (px) | rocks react from farther away |
| `REPEL` | push strength | rocks scatter harder |
| `K` | spring stiffness | rocks return home faster |
| `DAMP` | damping (0–1) | **higher = bouncier**, lower = settles softly |
| `CLICK_IMPULSE` | click pop strength | — |

## Other assets

- `assets/rocks-mosaic.svg` / `rocks-outline.svg` — vector versions if you prefer scalable
  shapes over raster. Each rock is a `path` with `id="rock-N"`, so it can be styled or
  controlled individually via CSS/JS.

## Pipeline (for reference)

Original photo → MobileSAM automatic mask generation to separate rocks → crop each mask to a
transparent PNG along its outline → record bounding box, centroid, and area into
`positions.json` → place cutouts by coordinate on the front end and apply the physics reaction.
