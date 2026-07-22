import { Link } from 'react-router-dom'
import '../styles/about-nav.css'

/* Nav made of rock-shaped buttons overlaid on the About pile. These are page-space
   overlays (not part of the rotated physics stage), so they're always upright and
   horizontal, never repel, and sit wherever we place them. Each is a wide cutout
   with a bold label and a crisp outline that reads as "pressable". */

const ITEMS = [
  { label: 'Home', to: '/', rock: 'rock-001.png' },
  { label: 'Research', to: '/publications', rock: 'rock-006.png' },
  { label: 'Projects', to: '/projects', rock: 'rock-010.png' },
  { label: 'misc', href: '#etc', rock: 'rock-014.png' },   // placeholder anchor, mirrors the Home nav
]

function RockButton({ label, rock }) {
  return (
    <>
      <img
        className="rock-btn__rock"
        src={'/images/rocks/cutouts/' + rock}
        alt=""
        aria-hidden="true"
        draggable="false"
      />
      <span className="rock-btn__label">{label}</span>
    </>
  )
}

export default function AboutNav({ show = true }) {
  return (
    <nav className={`rock-nav ${show ? 'rock-nav--show' : ''}`} aria-label="Sections">
      {ITEMS.map((it) =>
        it.to ? (
          <Link key={it.label} to={it.to} className="rock-btn" aria-label={it.label}>
            <RockButton {...it} />
          </Link>
        ) : (
          <a key={it.label} href={it.href} className="rock-btn" aria-label={it.label}>
            <RockButton {...it} />
          </a>
        )
      )}
    </nav>
  )
}
