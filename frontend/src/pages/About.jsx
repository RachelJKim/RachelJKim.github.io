import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import RockPile from '../components/RockPile'
import AboutNav from '../components/AboutNav'
import '../styles/about.css'

export default function About() {
  const location = useLocation()
  // Arriving via the Home transition, the portal already piled the rocks in, so we
  // render them settled for a seamless handoff. A direct visit / refresh has no
  // portal, so it plays the pile-in itself.
  const settled = location.state?.fromTransition === true
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

  // Fade the nav in *with* the pile: when a pile-in plays, reveal on its start; when
  // there's no pile-in (transition handoff, or reduced motion), reveal immediately.
  const [showNav, setShowNav] = useState(settled || reduce)

  useEffect(() => {
    document.body.classList.add('about-page')
    return () => document.body.classList.remove('about-page')
  }, [])

  return (
    <div className="about-stage-page">
      <RockPile intro={!settled} onIntroStart={() => setShowNav(true)} />
      <AboutNav show={showNav} />
    </div>
  )
}
