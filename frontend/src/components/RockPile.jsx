import { useEffect, useRef } from 'react'
import ROCK_DATA from '../data/rockData.js'
import '../styles/rockpile.css'

/* Rock pile — interactive physics, ported from ideas/rock/app.js.
   123 photo cutouts placed from coordinate data. The cursor repels rocks near
   their centroid (bigger rocks are heavier and move less); clicking a rock pops
   it away. With `intro`, the pile "piles in": biggest rocks land first, each
   falling toward the camera (starts large, shrinks to rest) with a short squash.

   Physics lives in refs + one requestAnimationFrame loop — the 123 rocks are
   never driven through React state; each img.style.transform is mutated directly. */

// ---- Tunables (feel) ----
// R = reaction radius (size of the cleared bubble), REPEL = push strength,
// K = spring stiffness pulling rocks home (lower = they hold the gap open longer).
const R = 200, REPEL = 3.2, K = 0.028, DAMP = 0.74
const CLICK_IMPULSE = 26        // strength of the pop when a rock is clicked

// ---- Wells ----
// A "well" is a hidden image behind the pile with a soft, *persistent* repel around
// it, so rocks settle pulled slightly away and the image peeks through — as if
// something is buried under the stones. Much weaker than the cursor (WELL_REPEL <<
// REPEL), so hovering opens the gap wider and a cursor-shoved rock can still slide
// over the image: a soft clearing, never a hard no-rock hole.
const WELL_REPEL = 0.95

// ---- Intro pile-in ----
const INTRO_FALL = 620          // ms for a single rock's fall
const INTRO_STAGGER = 6         // ms between rocks (big ones land first)
const INTRO_JITTER = 110        // ms of randomness per rock
const INTRO_SCALE = 1.22        // starting scale — how "close to the lens" a rock begins
const INTRO_DRIFT = 8           // px of lateral drift while falling
const INTRO_SPIN = 7            // max degrees of spin, settling to level
const INTRO_FADE = 0.22         // fraction of the fall spent fading in

// Long, soft deceleration (~easeOutCubic) with a trace of overshoot.
const easeLand = (t) => 1 + 1.15 * Math.pow(t - 1, 3) + 0.15 * Math.pow(t - 1, 2)

/**
 * @param {boolean} intro   play the pile-in on mount (default true; skipped under reduced-motion)
 * @param {() => void} onIntroStart  called the moment the pile-in begins
 * @param {() => void} onIntroDone   called once the pile-in finishes
 * @param {Array<{id,src,xN,yN,rN,imgW,alt}>} wells  hidden peek-through images (see WELL_REPEL).
 *        xN/yN: viewport-normalized center (0..1). rN: repel radius as a fraction of
 *        min(vw,vh). imgW: CSS width for the image element.
 */
export default function RockPile({ intro = true, onIntroStart, onIntroDone, wells = [] }) {
  const stageRef = useRef(null)
  const stagewrapRef = useRef(null)
  const wellsLayerRef = useRef(null)
  // Serialized so the effect re-runs only when the wells actually change, not on every
  // parent render that hands it a fresh array literal.
  const wellsKey = JSON.stringify(wells)
  const onIntroStartRef = useRef(onIntroStart)
  onIntroStartRef.current = onIntroStart
  const onIntroDoneRef = useRef(onIntroDone)
  onIntroDoneRef.current = onIntroDone

  useEffect(() => {
    const stage = stageRef.current
    const stagewrap = stagewrapRef.current
    if (!stage || !stagewrap) return

    let cancelled = false
    const DATA = ROCK_DATA
    const maxA = Math.max(...DATA.rocks.map((r) => r.area))
    let S = 1
    let localW = 0   // stage's own (pre-rotation) width in px; used to map the cursor

    const rocks = DATA.rocks.map((r) => {
      const img = new Image()
      img.src = '/images/rocks/cutouts/' + r.file
      img.draggable = false
      stage.appendChild(img)
      const mass = 0.35 + 0.65 * Math.sqrt(r.area / maxA)   // big rocks are heavier
      return {
        ...r, img, mass, ox: 0, oy: 0, vx: 0, vy: 0, rot: 0, vr: 0,
        sc: 1, delay: 0, dur: INTRO_FALL, dRot: 0, dx: 0, dy: 0,
        hx: 0, hy: 0, pcx: 0, pcy: 0,
      }
    })

    // Biggest rocks land first so the pile visibly builds from its base outward.
    const fallOrder = [...rocks].sort((a, b) => b.area - a.area)

    // Wells: parsed from the serialized prop. wcx/wcy (local px centre) and wr (px
    // radius) are filled in by layout(), which maps each viewport-normalised centre
    // into the stage's own rotated coordinate space.
    const wellState = JSON.parse(wellsKey).map((w) => ({ ...w, wcx: 0, wcy: 0, wr: 0 }))

    // The pile always COVERS the viewport (no letterboxing), and its orientation
    // matches the viewport so the portrait source needs the least upscaling (sharper):
    //   landscape viewport -> rotate the stage 270deg (portrait source reads landscape)
    //   portrait  viewport -> no rotation (portrait source stays portrait)
    let landscapeMode = true
    function layout() {
      const vw = window.innerWidth, vh = window.innerHeight
      landscapeMode = vw >= vh
      if (landscapeMode) {
        // Rotated, so the on-screen box is (canvas.h x canvas.w). Cover => the
        // rotated width AND height both reach past the viewport.
        S = Math.max(vw / DATA.canvas.h, vh / DATA.canvas.w)
      } else {
        // Upright: on-screen box is (canvas.w x canvas.h). Cover likewise.
        S = Math.max(vw / DATA.canvas.w, vh / DATA.canvas.h)
      }
      const pw = DATA.canvas.w * S, ph = DATA.canvas.h * S   // stage's own (unrotated) size
      localW = pw
      stage.style.width = pw + 'px'
      stage.style.height = ph + 'px'
      stage.style.transform = landscapeMode
        ? 'translate(-50%, -50%) rotate(270deg)'
        : 'translate(-50%, -50%)'
      // Wrapper matches the on-screen (post-rotation) footprint, centered in the page.
      stagewrap.style.width = (landscapeMode ? ph : pw) + 'px'
      stagewrap.style.height = (landscapeMode ? pw : ph) + 'px'
      for (const r of rocks) {
        r.img.style.width = (r.w * S) + 'px'
        r.img.style.height = (r.h * S) + 'px'
        r.hx = r.x * S;   r.hy = r.y * S      // home top-left (px)
        r.pcx = r.cx * S; r.pcy = r.cy * S    // centroid (px)
      }
      // Map each well's viewport-normalised centre into the stage's local space, the
      // same inversion pos() applies to the cursor. Rotation+translation preserves
      // distance, so the radius carries over from viewport px unchanged.
      if (wellState.length) {
        const rc = stagewrap.getBoundingClientRect()
        const minVp = Math.min(vw, vh)
        for (const w of wellState) {
          // Repel is centred on the focus point (fxN/fyN) when given — lets the clearing
          // sit on the face rather than the image's geometric centre — else the image centre.
          const cx = (w.fxN ?? w.xN) * vw, cy = (w.fyN ?? w.yN) * vh
          if (landscapeMode) {
            w.wcx = localW - (cy - rc.top)
            w.wcy = cx - rc.left
          } else {
            w.wcx = cx - rc.left
            w.wcy = cy - rc.top
          }
          w.wr = w.rN * minVp
        }
      }
    }
    layout()
    window.addEventListener('resize', layout)

    let mx = -1e5, my = -1e5
    function pos(e) {
      // Map the pointer into the stage's own (unrotated) coordinate space.
      const rc = stagewrap.getBoundingClientRect()
      if (landscapeMode) {
        // Invert the 270deg rotation.
        mx = localW - (e.clientY - rc.top)
        my = e.clientX - rc.left
      } else {
        // No rotation: the stage top-left coincides with the wrapper's.
        mx = e.clientX - rc.left
        my = e.clientY - rc.top
      }
    }
    function leave() { mx = -1e5; my = -1e5 }
    function down(e) {
      pos(e)
      const r = rocks.find((o) => o.img === e.target)
      if (!r) return
      const dx = r.pcx + r.ox - mx, dy = r.pcy + r.oy - my, d = Math.hypot(dx, dy) || 1
      const P = CLICK_IMPULSE / r.mass
      r.vx += dx / d * P; r.vy += dy / d * P; r.vr += (Math.random() - 0.5) * 10
      r.img.style.zIndex = 999
    }
    stage.addEventListener('pointermove', pos)
    stage.addEventListener('pointerleave', leave)
    stage.addEventListener('pointerdown', down)

    // ---- Intro pile-in ----
    let introStart = 0, introing = false
    function playIntro() {
      fallOrder.forEach((r, i) => {
        r.delay = i * INTRO_STAGGER + Math.random() * INTRO_JITTER
        r.dur = INTRO_FALL * (0.85 + Math.random() * 0.3)
        r.dRot = (Math.random() - 0.5) * 2 * INTRO_SPIN
        const a = Math.random() * 6.28, d = Math.random() * INTRO_DRIFT
        r.dx = Math.cos(a) * d; r.dy = Math.sin(a) * d
        r.ox = r.oy = r.vx = r.vy = r.rot = r.vr = 0
        r.sc = INTRO_SCALE
        r.img.style.opacity = '0'
        r.img.style.zIndex = ''
      })
      introStart = performance.now()
      introing = true
      onIntroStartRef.current?.()
    }

    function stepIntro(now) {
      let done = true
      for (const r of rocks) {
        const t = (now - introStart - r.delay) / r.dur
        if (t >= 1) { r.sc = 1; r.img.style.opacity = ''; continue }
        done = false
        if (t <= 0) { r.sc = INTRO_SCALE; continue }   // still waiting its turn
        const e = easeLand(t)
        r.sc = INTRO_SCALE + (1 - INTRO_SCALE) * e
        r.ox = r.dx * (1 - e); r.oy = r.dy * (1 - e)
        r.rot = r.dRot * (1 - e)
        // Reach full opacity early so 123 overlapping cutouts never stack into haze.
        r.img.style.opacity = t >= INTRO_FADE ? '1' : (t / INTRO_FADE).toFixed(2)
      }
      if (done) { introing = false; onIntroDoneRef.current?.() }
    }

    let raf
    function frame(now) {
      if (introing) {
        stepIntro(now)
        for (const r of rocks) {
          if (r.sc === INTRO_SCALE && r.img.style.opacity === '0') continue   // not yet dropped
          r.img.style.transform =
            'translate(' + (r.hx + r.ox).toFixed(1) + 'px,' + (r.hy + r.oy).toFixed(1) + 'px)' +
            ' rotate(' + r.rot.toFixed(2) + 'deg) scale(' + r.sc.toFixed(3) + ')'
        }
        raf = requestAnimationFrame(frame)
        return
      }
      for (const r of rocks) {
        // Repel from cursor
        const dx = (r.pcx + r.ox) - mx, dy = (r.pcy + r.oy) - my, d = Math.hypot(dx, dy) || 0.001
        if (d < R) {
          const f = (R - d) / R, push = f * f * REPEL * R / r.mass
          r.vx += dx / d * push * 0.12; r.vy += dy / d * push * 0.12
        }
        // Persistent, gentle repel out of each well — balanced against the home spring,
        // this settles rocks into a soft clearing that reveals the image behind them.
        for (const w of wellState) {
          const wdx = (r.pcx + r.ox) - w.wcx, wdy = (r.pcy + r.oy) - w.wcy
          const wd = Math.hypot(wdx, wdy) || 0.001
          if (wd < w.wr) {
            const wf = (w.wr - wd) / w.wr
            const wpush = wf * wf * (w.repel ?? WELL_REPEL) * w.wr / r.mass
            r.vx += wdx / wd * wpush * 0.12; r.vy += wdy / wd * wpush * 0.12
          }
        }
        // Spring back home + damping
        r.vx += (-r.ox) * K; r.vy += (-r.oy) * K
        r.vx *= DAMP; r.vy *= DAMP
        r.ox += r.vx; r.oy += r.vy
        // Gentle lean toward horizontal motion, settling back to level
        r.vr += (-r.rot) * 0.06 - r.vx * 0.18; r.vr *= 0.72; r.rot += r.vr * 0.1
        // Drop the raised z-index once a clicked rock has settled
        if (Math.abs(r.vx) < 0.02 && Math.abs(r.vy) < 0.02 &&
            Math.abs(r.ox) < 0.4 && Math.abs(r.oy) < 0.4 && r.img.style.zIndex === '999') {
          r.img.style.zIndex = ''
        }
        r.img.style.transform =
          'translate(' + (r.hx + r.ox).toFixed(1) + 'px,' + (r.hy + r.oy).toFixed(1) + 'px)' +
          ' rotate(' + r.rot.toFixed(2) + 'deg)'
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const introOn = intro && !reduce

    if (introOn) {
      // Hide the pile until the intro starts so nothing flashes into place first.
      for (const r of rocks) r.img.style.opacity = '0'
      // Wait for cutouts to load, else early rocks land as blank gaps. Gate on the
      // `load` event (img.decode() proved unreliable at 123 images — some promises
      // never settle), with a safety timeout so the intro always fires.
      const ready = (img) =>
        img.complete && img.naturalWidth > 0
          ? Promise.resolve()
          : new Promise((res) => {
              img.addEventListener('load', res, { once: true })
              img.addEventListener('error', res, { once: true })
            })
      Promise.race([
        Promise.all(rocks.map((r) => ready(r.img))),
        new Promise((res) => setTimeout(res, 900)),
      ]).then(() => {
        if (!cancelled) playIntro()
      })
    }

    // rAF is paused while the tab is hidden; rebase the intro clock on return so a
    // backgrounded intro doesn't snap straight to the finished pile.
    function onVisible() { if (!document.hidden && introing) introStart = performance.now() }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', layout)
      document.removeEventListener('visibilitychange', onVisible)
      stage.removeEventListener('pointermove', pos)
      stage.removeEventListener('pointerleave', leave)
      stage.removeEventListener('pointerdown', down)
      while (stage.firstChild) stage.removeChild(stage.firstChild)
    }
  }, [intro, wellsKey])

  return (
    <>
      {/* Hidden peek-through images — sit behind the pile; the physics loop clears a
          soft gap around each so they show through the stones. */}
      {wells.length > 0 && (
        <div
          className={`rock-wells${intro ? '' : ' rock-wells--settled'}`}
          ref={wellsLayerRef}
          aria-hidden="true"
        >
          {wells.map((w) => (
            <img
              key={w.id}
              className="rock-well-img"
              src={w.src}
              alt={w.alt || ''}
              draggable="false"
              style={{
                left: `${w.xN * 100}%`,
                top: `${w.yN * 100}%`,
                width: w.imgW,
                transform: `translate(-50%, -50%) rotate(${w.rot || 0}deg)`,
              }}
            />
          ))}
        </div>
      )}
      <div className="rock-stagewrap" ref={stagewrapRef}>
        <div className="rock-stage" ref={stageRef} />
      </div>
    </>
  )
}
