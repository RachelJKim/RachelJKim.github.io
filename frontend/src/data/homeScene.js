// Editable layout for the Home scene. Positions/sizes are viewport-relative (vw/vh)
// so the scene stays responsive; the eyes and caption live inside the character and
// use cqw (1cqw = 1% of the character's width).
//
// Tweak these live at /?edit (the SceneEditor overlay): drag elements, adjust with the
// number inputs, then either "Save" (persists to this browser via localStorage) or
// "Copy JSON" and paste the object below to make it the committed default.

export const DEFAULT_LAYOUT = {
  title:     { leftVw: 8.4,  topVh: 14.2, fontVw: 7.5 },
  character: { leftVw: 23.7, topVh: 61,   widthVw: 18.5 },
  eyeL:      { leftCqw: -1.8, topCqw: 18.3, sizeCqw: 51,   rot: 0 },
  eyeR:      { leftCqw: 53.9, topCqw: 8.6,  sizeCqw: 50.5, rot: 4 },
  caption:   { leftVw: 24.3, topVh: 90.2, fontVw: 1.7 },
  notes:     { leftVw: 70,   topVh: 48.4, widthVw: 46.5, rot: 1.5 },
  // The intro text overlaid on the notes paper. Positioned in cqw (% of the notes
  // group's width) so it drags/scales with the paper.
  notesText: { leftCqw: 11.7, topCqw: 20.3, widthCqw: 59, rot: 0 },
  // Contact line (LinkedIn/GitHub/Scholar/X links) below the intro, also on the paper.
  contactText: { leftCqw: 15.8, topCqw: 59.5, widthCqw: 62, rot: -0.5 },
  // Profile-picture CV link: the polaroid + its "curriculum vitae" text (grouped;
  // hover highlights the text, click opens the CV). cvText is placed in cqw relative
  // to the cv group, like notesText is to notes.
  cv:        { leftVw: 79.5, topVh: 41.5, widthVw: 17.5, rot: 2.5 },
  cvText:    { leftCqw: 45.3, topCqw: 92.2, fontCqw: 5, rot: 0 },
  trash:     { leftVw: 93.1, topVh: 87.9, widthVw: 6.5, rot: 0 },
  // Nav objects — always-visible clickable buttons placed around the bin.
  objTissue: { leftVw: 49,   topVh: 78.5, widthVw: 10.5, rot: -10 },
  objRock:   { leftVw: 84.3, topVh: 78.5, widthVw: 7.5, rot: 8 },
  objPet:    { leftVw: 51.5, topVh: 24.8, widthVw: 10,  rot: -3 },
}

// Human labels + which numeric fields each element exposes in the editor.
export const FIELDS = {
  title:     ['leftVw', 'topVh', 'fontVw'],
  character: ['leftVw', 'topVh', 'widthVw'],
  eyeL:      ['leftCqw', 'topCqw', 'sizeCqw', 'rot'],
  eyeR:      ['leftCqw', 'topCqw', 'sizeCqw', 'rot'],
  caption:   ['leftVw', 'topVh', 'fontVw'],
  notes:     ['leftVw', 'topVh', 'widthVw', 'rot'],
  notesText: ['leftCqw', 'topCqw', 'widthCqw', 'rot'],
  contactText: ['leftCqw', 'topCqw', 'widthCqw', 'rot'],
  cv:        ['leftVw', 'topVh', 'widthVw', 'rot'],
  cvText:    ['leftCqw', 'topCqw', 'fontCqw', 'rot'],
  trash:     ['leftVw', 'topVh', 'widthVw', 'rot'],
  objTissue: ['leftVw', 'topVh', 'widthVw', 'rot'],
  objRock:   ['leftVw', 'topVh', 'widthVw', 'rot'],
  objPet:    ['leftVw', 'topVh', 'widthVw', 'rot'],
}

const KEY = 'homeSceneLayout'

function mergeLayout(base, over) {
  const out = {}
  for (const k of Object.keys(base)) out[k] = { ...base[k], ...(over?.[k] || {}) }
  return out
}

export function loadLayout() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null')
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
