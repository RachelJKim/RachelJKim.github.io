import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import '../styles/crumple-note.css'

/* CrumpleNote — takes an element that already exists on the page (`sourceRef`),
   rasterises it once, and lets that snapshot crumple into a ball, throw itself
   across the screen and land beside `restRef`. Click the ball to put it back.

   Unlike the ideas/paper-crumple prototype this does NOT wrap its children: the
   home scene positions .hs-notes itself (absolute + rotate, cqw children), and
   wrapping it would have disturbed that. Instead it only *reads* the element's
   box, and renders its own overlay (canvas / shadow / hit area) through a portal
   on document.body — .home-scene is `container-type: size` + `overflow: hidden`,
   which would otherwise turn our position:fixed canvas into a clipped absolute one.

   Seamless edges: the prototype filled the snapshot's transparent margin with
   white so the ragged paper edge didn't become holes in the ball — but that white
   rectangle was visible as a faint box around the note. Here the snapshot keeps
   its alpha, and the *shader* fades the transparent margin to the paper's own
   colour as the sheet folds (uSolid). Flat, the sheet is pixel-identical to the
   DOM note; balled up, it is solid. */

/* ---------------- tunables ---------------- */
const SEED = 20260725
const SEG_X = 108, SEG_Y = 84   // mesh resolution
const GRID = 8                  // GRID² near-rigid facet plates
const KN = 3                    // plates blended per vertex
const WPOW = 5                  // blend sharpness ⇒ crease narrowness
const BALL_R = 0.30             // ball radius; the flat sheet is 2 wide
const SP = 0.30                 // translation stagger (small: moves as one mass)
const SR = 0.75                 // rotation stagger (large: facets snap in turn)
const SPIN = 7.2

const CRUMPLE_MS = 900, FLY_MS = 1250, FLY_AT = 0.58
const BACK_MS = 1050, OPEN_MS = 900, OPEN_AT = 0.55

// How fast the transparent margin fills in with paper as the fold starts. Short,
// so the ball is solid well before any facet turns its back to us — but not
// instant, or the edge would visibly "pop" on the very first frame.
const SOLID_AT = 0.18

/* ---------------- deterministic noise ---------------- */
function mulberry32(seed) {
  let a = seed
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function makeNoise(seed) {
  const rnd = mulberry32(seed)
  const p = Array.from({ length: 256 }, (_, i) => i)
  for (let i = 255; i > 0; i--) { const j = Math.floor(rnd() * (i + 1));[p[i], p[j]] = [p[j], p[i]] }
  const perm = new Uint8Array(512)
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255]
  const fade = t => t * t * (3 - 2 * t)
  const mix = (t, a, b) => a + (b - a) * t
  const grad = (h, x, y) => (h & 1 ? -x : x) + (h & 2 ? -y : y)
  const noise = (x, y) => {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255
    x -= Math.floor(x); y -= Math.floor(y)
    const u = fade(x), v = fade(y)
    const a = perm[X] + Y, b = perm[X + 1] + Y
    return mix(v,
      mix(u, grad(perm[a], x, y), grad(perm[b], x - 1, y)),
      mix(u, grad(perm[a + 1], x, y - 1), grad(perm[b + 1], x - 1, y - 1)))
  }
  return (x, y, oct = 3) => {
    let s = 0, amp = 0.6, f = 1
    for (let o = 0; o < oct; o++) { s += amp * noise(x * f, y * f); amp *= 0.5; f *= 2.1 }
    return s
  }
}

const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeOut = t => 1 - Math.pow(1 - t, 3)
const easeOutQ = t => 1 - (1 - t) * (1 - t)
const easeInQ = t => t * t
const clamp01 = t => Math.min(1, Math.max(0, t))
const lerp = (a, b, t) => a + (b - a) * t
const smooth01 = t => { const x = clamp01(t); return x * x * (3 - 2 * x) }

/* ============================================================
   The engine. Framework-agnostic on purpose — React only supplies
   DOM nodes and calls crumple()/restore().
   ============================================================ */
function createEngine({ THREE, canvas, noteEl, getRestEl, shadowEl, hitEl, tipEl, aspect }) {
  const fbm = makeNoise(SEED)
  const rnd = mulberry32(SEED ^ 0x9e3779b9)

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  // r152 renamed this; support both so the component works on any three version
  if ('outputColorSpace' in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace
  else renderer.outputEncoding = THREE.sRGBEncoding

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 30)
  camera.position.z = 4

  /* The three intensities are tuned to sum to exactly 1.0 on the flat, camera-facing
     sheet, so a flat note renders its texture at true colour and the swap from the
     real DOM note to the 3D one is invisible. Post-r155 three dropped "legacy lights"
     (irradiance is no longer scaled by π), so the prototype's values are scaled by π
     here — 0.42/0.20/0.59 × π. */
  const PI = Math.PI
  const key = new THREE.DirectionalLight(0xffffff, 0.42 * PI)
  key.position.set(-1.4, 2.2, 2.8); scene.add(key)
  const fill = new THREE.DirectionalLight(0xdfe8f2, 0.20 * PI)
  fill.position.set(1.8, -1.0, 1.4); scene.add(fill)
  scene.add(new THREE.AmbientLight(0xffffff, 0.59 * PI))

  const H = 2 / aspect, halfH = H / 2
  const geo = new THREE.PlaneGeometry(2, H, SEG_X, SEG_Y)
  const posAttr = geo.attributes.position, uvAttr = geo.attributes.uv
  const count = posAttr.count
  const flat = new Float32Array(posAttr.array)

  /* --- facet plates: flat pose, ball pose, fold axis, stagger --- */
  const NCELL = GRID * GRID
  const cFlat = new Float32Array(NCELL * 3), cBall = new Float32Array(NCELL * 3)
  const cAxis = new Float32Array(NCELL * 3), cAng = new Float32Array(NCELL)
  const cTp = new Float32Array(NCELL), cTr = new Float32Array(NCELL)
  const BALL_CY = -0.05
  {
    const z = new THREE.Vector3(0, 0, 1), dir = new THREE.Vector3()
    const qA = new THREE.Quaternion(), qS = new THREE.Quaternion(), qF = new THREE.Quaternion()
    let c = 0
    for (let gy = 0; gy < GRID; gy++) for (let gx = 0; gx < GRID; gx++, c++) {
      const u = (gx + 0.5 + (rnd() - 0.5) * 0.6) / GRID
      const v = (gy + 0.5 + (rnd() - 0.5) * 0.6) / GRID
      cFlat[c * 3] = -1 + 2 * u
      cFlat[c * 3 + 1] = -halfH + H * v
      // continuous wrap keeps neighbouring plates adjacent on the ball
      const th = u * Math.PI * 2 * 1.25 + 0.5 * fbm(u * 2 + 9, v * 2 + 9)
      const ph = (0.12 + v * 0.76) * Math.PI
      const r = BALL_R * (1 + 0.20 * fbm(u * 2.2, v * 2.2) + (rnd() - 0.5) * 0.16)
      const bx = r * Math.sin(ph) * Math.cos(th)
      const by = r * Math.cos(ph) + BALL_CY
      const bz = r * Math.sin(ph) * Math.sin(th)
      cBall[c * 3] = bx; cBall[c * 3 + 1] = by; cBall[c * 3 + 2] = bz
      dir.set(bx, by - BALL_CY, bz).normalize()
      qA.setFromUnitVectors(z, dir)
      qS.setFromAxisAngle(dir, (rnd() - 0.5) * 2.6)
      qF.multiplyQuaternions(qS, qA)
      const w = Math.min(1, Math.abs(qF.w))
      const s = Math.sqrt(Math.max(1e-12, 1 - w * w))
      cAxis[c * 3] = qF.x / s; cAxis[c * 3 + 1] = qF.y / s; cAxis[c * 3 + 2] = qF.z / s
      cAng[c] = (qF.w < 0 ? -1 : 1) * 2 * Math.acos(w)
      const edge = Math.max(Math.abs(cFlat[c * 3]), Math.abs(cFlat[c * 3 + 1]) / halfH)
      cTp[c] = 0.6 * rnd() + 0.4 * (1 - edge)
      cTr[c] = rnd()
    }
  }

  /* --- each vertex follows its 3 nearest plates --- */
  const vIdx = new Uint8Array(count * KN), vW = new Float32Array(count * KN)
  const vRel = new Float32Array(count * KN * 3), crink = new Float32Array(count)
  {
    const d2 = new Float32Array(NCELL)
    for (let i = 0; i < count; i++) {
      const x = flat[i * 3], y = flat[i * 3 + 1]
      for (let c = 0; c < NCELL; c++) {
        const dx = x - cFlat[c * 3], dy = y - cFlat[c * 3 + 1]
        d2[c] = dx * dx + dy * dy
      }
      let a = 0, b = 1, cc = 2
      if (d2[b] < d2[a]) { const t = a; a = b; b = t }
      if (d2[cc] < d2[a]) { const t = a; a = cc; cc = t }
      if (d2[cc] < d2[b]) { const t = b; b = cc; cc = t }
      for (let c = 3; c < NCELL; c++) {
        if (d2[c] < d2[a]) { cc = b; b = a; a = c }
        else if (d2[c] < d2[b]) { cc = b; b = c }
        else if (d2[c] < d2[cc]) { cc = c }
      }
      const picks = [a, b, cc]
      let sum = 0
      for (let k = 0; k < KN; k++) {
        const c = picks[k]
        const w = 1 / Math.pow(Math.sqrt(d2[c]) + 0.02, WPOW)
        vIdx[i * KN + k] = c; vW[i * KN + k] = w; sum += w
        vRel[(i * KN + k) * 3] = x - cFlat[c * 3]
        vRel[(i * KN + k) * 3 + 1] = y - cFlat[c * 3 + 1]
      }
      for (let k = 0; k < KN; k++) vW[i * KN + k] /= sum
      crink[i] = fbm(uvAttr.getX(i) * 6.5 + 77, uvAttr.getY(i) * 6.5 + 77)
    }
  }

  /* The snapshot keeps its alpha, so the note's ragged edge is genuinely
     transparent while flat — no white box around it. `uSolid` (driven by the
     crumple progress) composites the paper colour behind it as it folds, so the
     finished ball has no holes. */
  const uSolid = { value: 0 }
  const uPaper = { value: new THREE.Color(0xf3efe6) }

  const mat = new THREE.MeshStandardMaterial({
    roughness: 0.95, metalness: 0, side: THREE.DoubleSide, transparent: true,
  })
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uSolid = uSolid
    shader.uniforms.uPaper = uPaper
    // r152+ calls the map varying vMapUv; older three calls it vUv. (Read the chunk
    // itself — at this point shader.fragmentShader still has the #include, unexpanded.)
    const uv = (THREE.ShaderChunk?.map_fragment || '').includes('vMapUv') ? 'vMapUv' : 'vUv'
    shader.fragmentShader = shader.fragmentShader
      .replace('void main() {', 'uniform float uSolid;\nuniform vec3 uPaper;\nvoid main() {')
      .replace('#include <map_fragment>', `
        #ifdef USE_MAP
          vec4 cnTexel = texture2D( map, ${uv} );
          // rgb: straight (un-premultiplied) colour, so fully transparent pixels
          // read as black — composite them over the paper colour instead.
          vec3 cnOver = mix( uPaper, cnTexel.rgb, cnTexel.a );
          diffuseColor *= vec4( mix( cnTexel.rgb, cnOver, uSolid ),
                                mix( cnTexel.a, 1.0, uSolid ) );
        #endif
      `)
  }
  const sheet = new THREE.Mesh(geo, mat)
  scene.add(sheet)

  const cM = new Float32Array(NCELL * 9), cP = new Float32Array(NCELL * 3)
  const cS = new Float32Array(NCELL), cE = new Float32Array(NCELL)
  let baseRotZ = 0, baseRotX = 0, crumpleT = 0

  function setCrumple(T) {
    uSolid.value = smooth01(T / SOLID_AT)
    const Trot = clamp01(T / 0.85)
    for (let c = 0; c < NCELL; c++) {
      const ep = easeInOut(clamp01(T * (1 + SP) - cTp[c] * SP))
      const er = easeInOut(clamp01(Trot * (1 + SR) - cTr[c] * SR))
      cE[c] = er; cS[c] = 1 - 0.14 * ep
      // aim at an inflated ball that tightens on arrival, so the wad stays
      // voluminous instead of pancaking flat and then re-inflating
      const puff = 1 + 0.5 * (1 - ep)
      for (let d = 0; d < 3; d++) {
        const mid = d === 1 ? BALL_CY : 0
        const target = mid + (cBall[c * 3 + d] - mid) * puff
        cP[c * 3 + d] = cFlat[c * 3 + d] + (target - cFlat[c * 3 + d]) * ep
      }
      const ang = cAng[c] * er, s = Math.sin(ang / 2), w = Math.cos(ang / 2)
      const qx = cAxis[c * 3] * s, qy = cAxis[c * 3 + 1] * s, qz = cAxis[c * 3 + 2] * s
      const o = c * 9
      const xx = qx * qx, yy = qy * qy, zz = qz * qz
      const xy = qx * qy, xz = qx * qz, yz = qy * qz
      const wx = w * qx, wy = w * qy, wz = w * qz
      cM[o] = 1 - 2 * (yy + zz); cM[o + 1] = 2 * (xy - wz); cM[o + 2] = 2 * (xz + wy)
      cM[o + 3] = 2 * (xy + wz); cM[o + 4] = 1 - 2 * (xx + zz); cM[o + 5] = 2 * (yz - wx)
      cM[o + 6] = 2 * (xz - wy); cM[o + 7] = 2 * (yz + wx); cM[o + 8] = 1 - 2 * (xx + yy)
    }
    const arr = posAttr.array
    for (let i = 0; i < count; i++) {
      let px = 0, py = 0, pz = 0, nx = 0, ny = 0, nz = 0, eb = 0
      for (let k = 0; k < KN; k++) {
        const c = vIdx[i * KN + k], w = vW[i * KN + k], o = c * 9, s = cS[c]
        const rx = vRel[(i * KN + k) * 3] * s, ry = vRel[(i * KN + k) * 3 + 1] * s
        px += w * (cP[c * 3] + cM[o] * rx + cM[o + 1] * ry)
        py += w * (cP[c * 3 + 1] + cM[o + 3] * rx + cM[o + 4] * ry)
        pz += w * (cP[c * 3 + 2] + cM[o + 6] * rx + cM[o + 7] * ry)
        nx += w * cM[o + 2]; ny += w * cM[o + 5]; nz += w * cM[o + 8]
        eb += w * cE[c]
      }
      const a = Math.sin(Math.PI * eb) * 0.055 * crink[i]
      arr[i * 3] = px + nx * a; arr[i * 3 + 1] = py + ny * a; arr[i * 3 + 2] = pz + nz * a
    }
    posAttr.needsUpdate = true
    geo.computeVertexNormals()
    crumpleT = T
    const Eg = easeInOut(T)
    baseRotZ = -0.14 * Eg; baseRotX = 0.09 * Eg
  }

  /* --- layout: the 3D sheet is pinned to the DOM, not to constants --- */
  let worldW = 1, worldH = 1, pxToWorld = 1, baseScale = 1
  let A = { x: 0, y: 0 }, B = { x: 0, y: 0 }, keys = null
  let flightT = 0, hover = 0

  // Centre in world units + the element's own (unrotated) size. offsetWidth rather
  // than the bounding rect, because the notes group is rotated a degree or two and
  // its rect is correspondingly inflated.
  const centre = el => {
    const r = el.getBoundingClientRect()
    return {
      x: ((r.left + r.width / 2) / window.innerWidth * 2 - 1) * worldW / 2,
      y: (1 - (r.top + r.height / 2) / window.innerHeight * 2) * worldH / 2,
      w: el.offsetWidth || r.width,
      h: el.offsetHeight || r.height,
    }
  }
  const toPx = (x, y) => ({
    x: (x / (worldW / 2) * 0.5 + 0.5) * window.innerWidth,
    y: (0.5 - y / (worldH / 2) * 0.5) * window.innerHeight,
  })

  function buildKeys() {
    const up = 0.30 * worldH
    const k = (t, fx, y, e) => ({ t, x: lerp(A.x, B.x, fx), y, e })
    keys = [
      k(0.00, 0.00, A.y, null),
      k(0.19, 0.13, A.y + up, easeOut),           // tossed up
      k(0.45, 0.46, B.y, easeInQ),                // first fall
      k(0.60, 0.64, B.y + up * 0.34, easeOutQ),
      k(0.73, 0.79, B.y, easeInQ),
      k(0.83, 0.90, B.y + up * 0.11, easeOutQ),
      k(0.91, 0.96, B.y, easeInQ),
      k(0.96, 0.99, B.y + up * 0.03, easeOutQ),
      k(1.00, 1.00, B.y, easeInQ),                // rest
    ]
  }

  function place(x, y, spin) {
    const s = baseScale * (1 + hover * 0.07)
    sheet.scale.setScalar(s)
    sheet.position.set(x, y, 0)
    sheet.rotation.z = baseRotZ - spin
    sheet.rotation.x = baseRotX + spin * 0.3

    const ballPx = BALL_R * 2.5 * s / pxToWorld
    const notePx = 2 * s / pxToWorld
    const wide = lerp(notePx * 0.88, ballPx * 0.92, crumpleT)
    const p = toPx(x, y)
    const gy = lerp(A.y, B.y, flightT < 0.5
      ? 2 * flightT * flightT : 1 - Math.pow(-2 * flightT + 2, 2) / 2)
    const ground = toPx(x, gy)
    const near = clamp01(1 - Math.abs(ground.y - p.y) / (0.20 * window.innerHeight))

    if (shadowEl) {
      const st = shadowEl.style
      st.left = `${p.x}px`
      st.top = `${ground.y + wide * 0.42}px`
      st.width = `${wide * (0.72 + 0.28 * near)}px`
      st.height = `${wide * lerp(0.13, 0.26, crumpleT)}px`
      st.filter = `blur(${lerp(20, 7, crumpleT) + 14 * (1 - near)}px)`
      // Only shade once it is actually balled up — a soft blob under the flat
      // sheet would read as a drop shadow the DOM note never had.
      st.opacity = `${(0.10 + 0.20 * near) * clamp01(crumpleT * 2)}`
    }
    if (hitEl) {
      const st = hitEl.style
      st.left = `${p.x}px`; st.top = `${p.y}px`
      st.width = `${ballPx * 1.05}px`; st.height = `${ballPx * 1.05}px`
    }
    if (tipEl) {
      tipEl.style.left = `${p.x}px`
      tipEl.style.top = `${p.y + ballPx * 0.7}px`
    }
  }

  function applyFlight(t) {
    flightT = t
    if (!keys) buildKeys()
    let a = keys[0], b = keys[keys.length - 1]
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i].t) { a = keys[i - 1]; b = keys[i]; break }
      a = keys[i]
    }
    const u = b.e ? b.e(clamp01((t - a.t) / ((b.t - a.t) || 1))) : 0
    place(a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u, SPIN * easeOut(t))
  }

  /* Returning does NOT replay the bounces backwards — a ball un-bouncing
     reads as antigravity. It gets one smooth arc home instead. */
  function applyReturn(k) {
    const e = easeInOut(k)
    flightT = 1 - e
    place(lerp(B.x, A.x, e),
      lerp(B.y, A.y, e) + Math.sin(Math.PI * k) * 0.16 * worldH,
      SPIN * (1 - e))
  }

  function layout() {
    const w = window.innerWidth, h = window.innerHeight
    renderer.setSize(w, h)
    camera.aspect = w / h; camera.updateProjectionMatrix()
    worldH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    worldW = worldH * camera.aspect
    pxToWorld = worldH / h

    const note = centre(noteEl)
    A = { x: note.x, y: note.y }
    baseScale = note.w * pxToWorld / 2

    // A crumpled sheet is ~⅓ its flat width, so it will not fit inside a small
    // bin. Park it beside the target, on the same base line — a near miss.
    const ballR = BALL_R * baseScale
    const restEl = getRestEl?.()
    if (restEl) {
      const rest = centre(restEl)
      B = {
        x: rest.x - rest.w * 0.5 * pxToWorld - ballR - 0.02,
        y: rest.y - rest.h * 0.5 * pxToWorld + ballR,
      }
    } else {
      B = { x: worldW / 2 - ballR - 0.06, y: -worldH / 2 + ballR + 0.06 }
    }
    buildKeys()
    applyFlight(flightT)
    render()
  }

  const render = () => renderer.render(scene, camera)

  function setTexture(canvasEl) {
    const tex = new THREE.CanvasTexture(canvasEl)
    if ('colorSpace' in tex) tex.colorSpace = THREE.SRGBColorSpace
    else tex.encoding = THREE.sRGBEncoding
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy()
    tex.needsUpdate = true
    if (mat.map) mat.map.dispose()
    mat.map = tex
    mat.needsUpdate = true
  }

  // The colour the transparent margin fills in with once crumpled: the note's own
  // average paper tone, so the wad never shows a foreign white.
  function setPaperColor(r, g, b) {
    if ('setRGB' in uPaper.value && THREE.SRGBColorSpace) {
      uPaper.value.setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace)
    } else {
      uPaper.value.setRGB(r / 255, g / 255, b / 255)
    }
  }

  function setHover(v) { hover = v; applyFlight(flightT); render() }

  function dispose() {
    geo.dispose(); mat.dispose()
    if (mat.map) mat.map.dispose()
    renderer.dispose()
  }

  return {
    setCrumple, applyFlight, applyReturn, layout, render,
    setTexture, setPaperColor, setHover, dispose,
  }
}

/* Average colour of the snapshot's opaque pixels — the paper's own tone (paper +
   ink + polaroid), biased towards the light paper because that is most of it. */
function averageOpaqueColor(canvasEl) {
  try {
    const ctx = canvasEl.getContext('2d', { willReadFrequently: true })
    const { width: w, height: h } = canvasEl
    const step = Math.max(1, Math.floor(Math.min(w, h) / 160))
    const d = ctx.getImageData(0, 0, w, h).data
    let r = 0, g = 0, b = 0, n = 0
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const i = (y * w + x) * 4
        if (d[i + 3] < 250) continue
        r += d[i]; g += d[i + 1]; b += d[i + 2]; n++
      }
    }
    if (!n) return null
    return [r / n, g / n, b / n]
  } catch {
    return null // tainted canvas — fall back to the default paper tone
  }
}

// Snapshots bake in whatever is on screen, so wait for the artwork and webfonts.
function waitForAssets(el) {
  const imgs = [...el.querySelectorAll('img')].filter(i => !i.complete)
  return Promise.all([
    document.fonts?.ready,
    ...imgs.map(i => new Promise(res => {
      i.addEventListener('load', res, { once: true })
      i.addEventListener('error', res, { once: true })
    })),
  ]).catch(() => {})
}

/* ============================================================
   React wrapper
   ============================================================ */
const CrumpleNote = forwardRef(function CrumpleNote({
  sourceRef,          // the element to rasterise + anchor to (already on the page)
  restRef,            // where the ball comes to rest (the trash bin)
  snapshotKey = '',   // change this whenever the note's content changes
  enabled = true,     // false disables the whole thing (e.g. the /?edit tool)
  restHint = 'put it back?',
  onPhaseChange,
}, ref) {
  const canvasRef = useRef(null)
  const shadowRef = useRef(null)
  const hitRef = useRef(null)
  const tipRef = useRef(null)
  const engineRef = useRef(null)
  const pendingRef = useRef(null)
  const busyRef = useRef(false)
  const keyRef = useRef(snapshotKey)

  const [phase, setPhase] = useState('flat')  // flat | crumpled | rested
  const [tipOn, setTipOn] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => { onPhaseChange?.(phase) }, [onPhaseChange, phase])

  /* Keep the 3D sheet glued to wherever CSS puts the note. `capture` so it also
     catches the phone layout, where .home-scene (not the window) is the scroller. */
  useEffect(() => {
    if (!ready) return
    const relayout = () => engineRef.current?.layout()
    window.addEventListener('resize', relayout)
    window.addEventListener('scroll', relayout, { passive: true, capture: true })
    const ro = sourceRef?.current ? new ResizeObserver(relayout) : null
    ro?.observe(sourceRef.current)
    return () => {
      window.removeEventListener('resize', relayout)
      window.removeEventListener('scroll', relayout, { capture: true })
      ro?.disconnect()
    }
  }, [ready, sourceRef])

  useEffect(() => () => engineRef.current?.dispose(), [])

  const ensureEngine = useCallback(() => {
    const stale = keyRef.current !== snapshotKey
    if (engineRef.current && !stale) return Promise.resolve(engineRef.current)
    if (pendingRef.current && !stale) return pendingRef.current
    keyRef.current = snapshotKey

    pendingRef.current = (async () => {
      const node = sourceRef.current
      if (!node) return null
      // Loaded on demand: three is ~600 kB and nobody needs it to read the page.
      const [THREE, { toCanvas }] = await Promise.all([
        import('three'),
        import('html-to-image'),
      ])
      await waitForAssets(node)

      // No backgroundColor: the snapshot keeps the paper's ragged transparent
      // edge, so the flat sheet has no white box around it. The shader fills the
      // margin in with `paper` as it folds instead.
      const snap = await toCanvas(node, {
        pixelRatio: Math.min(window.devicePixelRatio, 2) * 1.25,
      })

      let engine = engineRef.current
      if (!engine) {
        engine = createEngine({
          THREE,
          canvas: canvasRef.current,
          noteEl: node,
          getRestEl: () => restRef?.current ?? null,
          shadowEl: shadowRef.current,
          hitEl: hitRef.current,
          tipEl: tipRef.current,
          aspect: (node.offsetWidth || 1) / (node.offsetHeight || 1),
        })
        engineRef.current = engine
      }
      const paper = averageOpaqueColor(snap)
      if (paper) engine.setPaperColor(...paper)
      engine.setTexture(snap)
      engine.layout()
      engine.setCrumple(0)
      engine.applyFlight(0)
      engine.render()
      setReady(true)
      return engine
    })()
    return pendingRef.current
  }, [restRef, snapshotKey, sourceRef])

  /* Pre-warm while the page is idle, so the very first click is instant. */
  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    const warm = () => { if (!cancelled) ensureEngine().catch(() => {}) }
    const id = 'requestIdleCallback' in window
      ? requestIdleCallback(warm, { timeout: 2500 })
      : setTimeout(warm, 800)
    return () => {
      cancelled = true
      if ('cancelIdleCallback' in window) cancelIdleCallback(id); else clearTimeout(id)
    }
  }, [enabled, ensureEngine])

  const crumple = useCallback(async () => {
    if (!enabled || busyRef.current || phase !== 'flat') return
    busyRef.current = true
    const engine = await ensureEngine()
    if (!engine) { busyRef.current = false; return }
    engine.layout()   // the note may have moved since the pre-warm
    setPhase('crumpled')

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      engine.setCrumple(1); engine.applyFlight(1); engine.render()
      setPhase('rested'); busyRef.current = false; return
    }

    // The wad reaches its final shape around 70% of the fold, so waiting for
    // the fold to finish before throwing left a dead beat. They overlap.
    const flyAt = CRUMPLE_MS * FLY_AT, total = flyAt + FLY_MS
    const t0 = performance.now()
    const frame = now => {
      const e = now - t0
      engine.setCrumple(clamp01(e / CRUMPLE_MS))       // first: sets base rotation
      engine.applyFlight(clamp01((e - flyAt) / FLY_MS))
      engine.render()
      if (e < total) requestAnimationFrame(frame)
      else { setPhase('rested'); busyRef.current = false }
    }
    requestAnimationFrame(frame)
  }, [enabled, ensureEngine, phase])

  const restore = useCallback(() => {
    const engine = engineRef.current
    if (busyRef.current || phase !== 'rested' || !engine) return
    busyRef.current = true
    setPhase('crumpled')
    setTipOn(false)
    engine.setHover(0)

    const finish = () => {
      engine.setCrumple(0); engine.applyFlight(0); engine.render()
      setPhase('flat'); busyRef.current = false
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return finish()

    // Unfolding starts before it lands, so the sheet springs open on arrival.
    const openAt = BACK_MS * OPEN_AT, total = openAt + OPEN_MS
    const t0 = performance.now()
    const frame = now => {
      const e = now - t0
      engine.setCrumple(1 - clamp01((e - openAt) / OPEN_MS))
      engine.applyReturn(clamp01(e / BACK_MS))
      engine.render()
      if (e < total) requestAnimationFrame(frame)
      else finish()
    }
    requestAnimationFrame(frame)
  }, [phase])

  useImperativeHandle(ref, () => ({ crumple, restore, phase }), [crumple, restore, phase])

  const hoverBall = useCallback((on) => {
    const engine = engineRef.current
    if (!engine || phase !== 'rested') return
    setTipOn(on)
    const t0 = performance.now()
    const frame = now => {
      const k = clamp01((now - t0) / 220)
      engine.setHover(on ? k : 1 - k)
      if (k < 1) requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  }, [phase])

  /* Portaled to <body>: .home-scene is `container-type: size` + `overflow: hidden`,
     which would make our position:fixed layers behave like clipped absolute ones. */
  return createPortal(
    <div className="cn" data-phase={phase}>
      <canvas className="cn__gl" ref={canvasRef} aria-hidden="true" />
      <div className="cn__shadow" ref={shadowRef} aria-hidden="true" />
      <button
        type="button"
        className="cn__ball-hit"
        ref={hitRef}
        onClick={restore}
        onPointerEnter={() => hoverBall(true)}
        onPointerLeave={() => hoverBall(false)}
        aria-label={restHint}
      />
      <span className={`cn__tip${tipOn ? ' is-on' : ''}`} ref={tipRef} aria-hidden="true">
        {restHint}
      </span>
    </div>,
    document.body,
  )
})

export default CrumpleNote
