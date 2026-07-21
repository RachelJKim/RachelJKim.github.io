import { useEffect, useRef } from 'react'

// Physics constants lifted from ideas/googly-eyes/googly-eye.html
const TRAVEL = 0.183   // how far the pupil rolls, as a fraction of eye width
const ASPECT = 448 / 426

/**
 * A single googly eye whose pupil rolls toward the pointer.
 * `size` is the eye diameter as a CSS length (e.g. "9vw").
 */
export default function GooglyEye({ size, style, className = '' }) {
  const eyeRef = useRef(null)
  const pupilRef = useRef(null)

  useEffect(() => {
    const eye = eyeRef.current
    const pupil = pupilRef.current
    if (!eye || !pupil) return

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

    // Start looking straight ahead until the pointer shows up.
    const target = { x: innerWidth / 2, y: innerHeight / 2 }
    let hasPointer = false
    const cur = { x: 0, y: 0 }
    let raf

    const setTarget = (e) => {
      target.x = e.clientX
      target.y = e.clientY
      hasPointer = true
    }
    addEventListener('pointermove', setTarget, { passive: true })
    addEventListener('pointerdown', setTarget, { passive: true })

    const frame = (t) => {
      const r = eye.getBoundingClientRect()
      if (r.width > 0) {
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2
        const maxT = r.width * TRAVEL

        let tx, ty
        if (!hasPointer) {
          // gentle idle wander so it feels alive
          const wob = reduce ? 0 : 1
          const idleT = t / 1000
          tx = Math.cos(idleT * 0.8) * maxT * 0.5 * wob
          ty = Math.sin(idleT * 1.1) * maxT * 0.5 * wob
        } else {
          const dx = target.x - cx
          const dy = target.y - cy
          const dist = Math.hypot(dx, dy) || 1
          // roll fully to the rim; ease back to center only when the cursor is on the eye
          const mag = Math.min(maxT, dist * (maxT / (r.width * 0.9)))
          tx = (dx / dist) * mag
          ty = (dy / dist) * mag
        }

        // spring/lag so the pupil reads as a rolling weight
        const k = reduce ? 1 : 0.18
        cur.x += (tx - cur.x) * k
        cur.y += (ty - cur.y) * k
        pupil.style.transform =
          `translate(-50%,-50%) translate(${cur.x.toFixed(2)}px,${cur.y.toFixed(2)}px)`
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('pointermove', setTarget)
      removeEventListener('pointerdown', setTarget)
    }
  }, [])

  return (
    <div
      ref={eyeRef}
      className={`googly-eye ${className}`}
      style={{ width: size, aspectRatio: ASPECT, ...style }}
      aria-hidden="true"
    >
      <img className="googly-socket" src="/images/googly/socket.png" alt="" draggable="false" />
      <img ref={pupilRef} className="googly-pupil" src="/images/googly/pupil.png" alt="" draggable="false" />
    </div>
  )
}
