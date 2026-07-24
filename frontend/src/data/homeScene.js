// Editable layout for the Home scene. Positions/sizes are viewport-relative (vw/vh)
// so the scene stays responsive; the eyes and caption live inside the character and
// use cqw (1cqw = 1% of the character's width).
//
// Tweak these live at /?edit (the SceneEditor overlay): drag elements, adjust with the
// number inputs, then either "Save" (persists to this browser via localStorage) or
// "Copy JSON" and paste the object below to make it the committed default.

export const DEFAULT_LAYOUT = {
  title:     { leftVw: 6.9,  topVh: 10.8, fontVw: 8.5 },
  character: { leftVw: 23.7, topVh: 61,   widthVw: 18.5 },
  eyeL:      { leftCqw: -1.8, topCqw: 18.3, sizeCqw: 51,   rot: 0 },
  eyeR:      { leftCqw: 53.9, topCqw: 8.6,  sizeCqw: 50.5, rot: 4 },
  caption:   { leftVw: 23.8, topVh: 92.5, fontVw: 1.7 },
  notes:     { leftVw: 73.5, topVh: 45.3, widthVw: 50, rot: 1 },
  // The intro text overlaid on the notes paper. Positioned in cqw (% of the notes
  // group's width) so it drags/scales with the paper.
  notesText: { leftCqw: 8.5, topCqw: 22.9, widthCqw: 59, rot: -1.5 },
  trash:     { leftVw: 91.9, topVh: 86.8, widthVw: 6.5, rot: -3 },
  // Objects the bin spits out when clicked. Their placements are where they land.
  objTissue: { leftVw: 51.5, topVh: 77.1, widthVw: 10,  rot: -10 },
  objRock:   { leftVw: 83.4, topVh: 73.6, widthVw: 7.5, rot: 8 },
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
