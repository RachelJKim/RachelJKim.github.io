import { useEffect } from 'react'
import '../styles/publications.css'
import SiteNav from './SiteNav'

/* Blank white "coming soon" page (used by Projects + Misc), full-screen with the
   shared site nav — same clean treatment as the Publications page. */
export default function ComingSoon({ title, bodyClass }) {
  useEffect(() => {
    if (!bodyClass) return
    document.body.classList.add(bodyClass)
    return () => document.body.classList.remove(bodyClass)
  }, [bodyClass])

  return (
    <div className="coming-soon">
      <SiteNav />
      <div className="coming-soon-body">
        <h1 className="coming-soon-title">{title}</h1>
        <p className="coming-soon-sub">coming soon</p>
      </div>
    </div>
  )
}
