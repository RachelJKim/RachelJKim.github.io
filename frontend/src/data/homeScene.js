// Editable layout for the Home scene. The top-level groups are positioned in cqw/cqh
// (% of the .home-scene "stage" — its width for cqw, its height for cqh). The stage is
// exactly the viewport on normal windows, but on extreme wide/short windows it fills the
// width and grows taller than the viewport so the bottom is cropped (like the
// publications page) — the whole desk scales with width as one unit instead of the title
// overrunning the character. The eyes live inside the character and the notes/cv/nav
// pieces inside the notes, each in cqw of their own parent.
//
// Tweak these live at /?edit (the SceneEditor overlay): drag elements, adjust with the
// number inputs, then either "Save" (persists to this browser via localStorage) or
// "Copy JSON" and paste the object below to make it the committed default.

export const DEFAULT_LAYOUT = {
  title:     { leftCqw: 8.4,  topCqh: 14.2, fontCqw: 7.5 },
  character: { leftCqw: 23.7, topCqh: 61,   widthCqw: 18.5 },
  eyeL:      { leftCqw: -1.8, topCqw: 18.3, sizeCqw: 51,   rot: 0 },
  eyeR:      { leftCqw: 53.9, topCqw: 8.6,  sizeCqw: 50.5, rot: 4 },
  caption:   { leftCqw: 24.3, topCqh: 90.2, fontCqw: 1.7 },
  notes:     { leftCqw: 70,   topCqh: 48.4, widthCqw: 46.5, rot: 1.5 },
  // The intro text overlaid on the notes paper. Positioned in cqw (% of the notes
  // group's width) so it drags/scales with the paper.
  notesText: { leftCqw: 11.7, topCqw: 20.3, widthCqw: 59, rot: 0 },
  // Contact line (LinkedIn/GitHub/Scholar/X links) below the intro, also on the paper.
  contactText: { leftCqw: 15.8, topCqw: 59.5, widthCqw: 62, rot: -0.5 },
  // Profile-picture CV link: the polaroid + its "curriculum vitae" text (grouped;
  // hover highlights the text, click opens the CV). Positioned in cqw *relative to
  // the notes group* (like notesText/contactText) so it moves and scales with the
  // paper on resize. Its own rot is on top of the notes' rotation. cvText in turn is
  // placed in cqw relative to the cv group.
  cv:        { leftCqw: 51.6, topCqw: 5, widthCqw: 37.8, rot: 1 },
  cvText:    { leftCqw: 45.3, topCqw: 92.2, fontCqw: 5, rot: 0 },
  trash:     { leftCqw: 93.1, topCqh: 87.9, widthCqw: 6.5, rot: 0 },
  // Nav objects — clickable buttons that fly out of the bin and land on the notes.
  // Positioned in cqw *relative to the notes group* (leftCqw/topCqw are the button's
  // CENTER), like the CV polaroid, so their resting spots scale and move with the
  // paper on resize. The fly-out still starts from the bin — Home.jsx computes each
  // button's offset back to the bin (--bin-dx/--bin-dy) at runtime. rot is on top of
  // the notes' rotation.
  objTissue: { leftCqw: 4.8,  topCqw: 74.2, widthCqw: 22.6, rot: -11.5 },
  objRock:   { leftCqw: 80.8, topCqw: 74.2, widthCqw: 16.1, rot: 6.5 },
  objPet:    { leftCqw: 10.2, topCqw: 11.3, widthCqw: 21.5, rot: -4.5 },
}

// Human labels + which numeric fields each element exposes in the editor.
export const FIELDS = {
  title:     ['leftCqw', 'topCqh', 'fontCqw'],
  character: ['leftCqw', 'topCqh', 'widthCqw'],
  eyeL:      ['leftCqw', 'topCqw', 'sizeCqw', 'rot'],
  eyeR:      ['leftCqw', 'topCqw', 'sizeCqw', 'rot'],
  caption:   ['leftCqw', 'topCqh', 'fontCqw'],
  notes:     ['leftCqw', 'topCqh', 'widthCqw', 'rot'],
  notesText: ['leftCqw', 'topCqw', 'widthCqw', 'rot'],
  contactText: ['leftCqw', 'topCqw', 'widthCqw', 'rot'],
  cv:        ['leftCqw', 'topCqw', 'widthCqw', 'rot'],
  cvText:    ['leftCqw', 'topCqw', 'fontCqw', 'rot'],
  trash:     ['leftCqw', 'topCqh', 'widthCqw', 'rot'],
  objTissue: ['leftCqw', 'topCqw', 'widthCqw', 'rot'],
  objRock:   ['leftCqw', 'topCqw', 'widthCqw', 'rot'],
  objPet:    ['leftCqw', 'topCqw', 'widthCqw', 'rot'],
}

const KEY = 'homeSceneLayout'

// The top-level groups used to be stored in vw/vh; the scene now places them in
// stage-relative cqw/cqh. Rename any legacy keys in a saved layout (same values) so
// older saves keep their tuned positions. Only the top-level groups ever had these
// keys, so a blanket rename is safe.
const LEGACY_KEYS = { leftVw: 'leftCqw', topVh: 'topCqh', fontVw: 'fontCqw', widthVw: 'widthCqw' }
function migrateLegacy(saved) {
  if (!saved || typeof saved !== 'object') return saved
  for (const el of Object.values(saved)) {
    if (!el || typeof el !== 'object') continue
    for (const [oldK, newK] of Object.entries(LEGACY_KEYS)) {
      if (oldK in el && !(newK in el)) {
        el[newK] = el[oldK]
        delete el[oldK]
      }
    }
  }
  return saved
}

function mergeLayout(base, over) {
  const out = {}
  for (const k of Object.keys(base)) out[k] = { ...base[k], ...(over?.[k] || {}) }
  return out
}

export function loadLayout() {
  try {
    const saved = migrateLegacy(JSON.parse(localStorage.getItem(KEY) || 'null'))
    if (saved) return mergeLayout(DEFAULT_LAYOUT, saved)
  } catch {
    /* ignore malformed storage */
  }
  return mergeLayout(DEFAULT_LAYOUT, null)
}

export function saveLayout(layout) {
  try {
    localStorage.setItem(KEY, JSON.stringify(layout))
    return true
  } catch {
    return false
  }
}

export function clearLayout() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
