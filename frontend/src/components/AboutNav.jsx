import { Link } from 'react-router-dom'
import '../styles/about-nav.css'

/* Nav made of leaf-shaped buttons overlaid on the About pile. These are page-space
   overlays (not part of the rotated physics stage), so they're always upright and
   horizontal, never repel, and sit wherever we place them. Each is a wide leaf cutout
   with a bold label and a crisp outline that reads as "pressable". A small per-item
   tilt keeps the four leaves from looking stamped from one mould. */

const ITEMS = [
  { label: 'Home', to: '/', tilt: -6 },
  { label: 'Research', to: '/publications', tilt: 3 },
  { label: 'Projects', to: '/projects', tilt: -2 },
  { label: 'misc', href: '#etc', tilt: 7 },   // placeholder anchor, mirrors the Home nav
]

function LeafButton({ label }) {
  return (
    <>
      <img
        className="leaf-btn__leaf"
        src="/images/leaf/leaf.png"
        alt=""
        aria-hidden="true"
        draggable="false"
      />
      <span className="leaf-btn__label">{label}</span>
    </>
  )
}

export default function AboutNav({ show = true }) {
  return (
    <nav className={`leaf-nav ${show ? 'leaf-nav--show' : ''}`} aria-label="Sections">
      {ITEMS.map((it) => {
        const style = { '--tilt': `${it.tilt}deg` }
        return it.to ? (
          <Link key={it.label} to={it.to} className="leaf-btn" style={style} aria-label={it.label}>
            <LeafButton {...it} />
          </Link>
        ) : (
          <a key={it.label} href={it.href} className="leaf-btn" style={style} aria-label={it.label}>
            <LeafButton {...it} />
          </a>
        )
      })}
    </nav>
  )
}
