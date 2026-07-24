import { useEffect } from 'react'

/* Misc — placeholder page (rock → misc nav target). Flesh out later. */
export default function Misc() {
  useEffect(() => {
    document.body.classList.add('misc-page')
    return () => document.body.classList.remove('misc-page')
  }, [])

  return (
    <section id="misc" style={{ minHeight: '80vh', padding: '16vh 8vw' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 64px)', margin: 0 }}>
        misc
      </h1>
      <p style={{ fontFamily: 'var(--font-nav)', fontSize: '1.2rem', opacity: 0.7 }}>Coming soon.</p>
    </section>
  )
}
