import { useNavigate, useLocation } from 'react-router-dom'
import '../styles/publications.css'

/* The small text nav overlaid on the full-screen pages (Publications + the
   Coming-soon pages). "home" always shows first; the page you're on is omitted. */
const PAGES = [
  { to: '/publications', label: 'publications' },
  { to: '/projects', label: 'projects' },
  { to: '/misc', label: 'misc' },
]

export default function SiteNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav className="pub-nav" aria-label="Site">
      <button type="button" className="pub-nav-home" onClick={() => navigate('/')}>← home</button>
      {PAGES.filter((p) => p.to !== pathname).map((p) => (
        <button type="button" key={p.to} onClick={() => navigate(p.to)}>{p.label}</button>
      ))}
    </nav>
  )
}
