// Hidden images buried under the rock pile on the About page (and pre-laid during the
// Home→About transition, so rocks pile *on top* of them). Positions/sizes lifted from
// the Canva SVG mock (design canvas 1024.5 x 576): Rachel peeking out on the left, the
// crumpled notes paper tilted on the right. xN/yN are viewport-normalised centres; rN
// is the soft-repel radius as a fraction of min(vw,vh); rot tilts the image (deg).
// fxN/fyN optionally move the repel centre off the image centre; repel overrides the
// default well strength.
export const WELLS = [
  {
    id: 'rachel',
    src: '/images/rachel/rachel-faded.png',   // bottom feathered so the gown dissolves into white
    xN: 0.211, yN: 0.500, rN: 0.25, rot: 0,
    // Focus the clearing on the upper face/forehead and push hard there, so the cap,
    // forehead and chin rocks all clear — not just the middle. A wider, stronger well
    // keeps the forehead free (a rock kept landing right on it).
    fxN: 0.205, fyN: 0.44, repel: 2.0,
    imgW: 'clamp(240px, 34vw, 460px)',
    alt: 'Rachel Kim',
  },
  {
    id: 'notes',
    src: '/images/notes/notes.png',
    xN: 0.652, yN: 0.576, rN: 0.30, rot: -6,
    imgW: 'clamp(340px, 49vw, 720px)',
    alt: '',
  },
]
