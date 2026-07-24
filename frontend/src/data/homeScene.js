// Editable layout for the Home scene. Positions/sizes are viewport-relative (vw/vh)
// so the scene stays responsive; the eyes and caption live inside the character and
// use cqw (1cqw = 1% of the character's width).
//
// Tweak these live at /?edit (the SceneEditor overlay): drag elements, adjust with the
// number inputs, then either "Save" (persists to this browser via localStorage) or
// "Copy JSON" and paste the object below to make it the committed default.

export const DEFAULT_LAYOUT = {
  title:     { leftVw: 7,   topVh: 8,   fontVw: 8.5 },
  character: { leftVw: 18,  topVh: 57,  widthVw: 20 },
  eyeL:      { leftCqw: 2,  topCqw: 16, sizeCqw: 49, rot: 0 },
  eyeR:      { leftCqw: 51, topCqw: 14, sizeCqw: 47, rot: 4 },
  caption:   { leftVw: 18,  topVh: 84,  fontVw: 1.7 },
  notes:     { leftVw: 70,  topVh: 50,  widthVw: 50, rot: 0 },
  trash:     { leftVw: 93,  topVh: 87,  widthVw: 5.5, rot: -3 },
}

// Human labels + which numeric fields each element exposes in the editor.
export const FIELDS = {
  title:     ['leftVw', 'topVh', 'fontVw'],
  character: ['leftVw', 'topVh', 'widthVw'],
  eyeL:      ['leftCqw', 'topCqw', 'sizeCqw', 'rot'],
  eyeR:      ['leftCqw', 'topCqw', 'sizeCqw', 'rot'],
  caption:   ['leftVw', 'topVh', 'fontVw'],
  notes:     ['leftVw', 'topVh', 'widthVw', 'rot'],
  trash:     ['leftVw', 'topVh', 'widthVw', 'rot'],
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
