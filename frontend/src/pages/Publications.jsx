import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import '../styles/publications.css'
import SiteNav from '../components/SiteNav'

/* Publications — the "toilet-paper scroll" page. It's a self-contained static page
   (its own html/body CSS + canvas scroll animation) copied verbatim to
   public/publications-page/, and embedded full-screen in an iframe here so its
   global styles and scripts stay isolated from the React app. Edit the paper list
   in public/publications-page/js/publications.js.

   The iframe's tear-off detail view is mirrored into the URL hash
   (/publications#dobi) over postMessage, so a torn-off sheet is linkable and
   the browser's Back button closes it. The iframe never touches its own
   location — all history lives out here. */
export default function Publications() {
  const frameRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    document.body.classList.add('publications-page')
    return () => document.body.classList.remove('publications-page')
  }, [])

  /* iframe -> URL: a sheet opened or closed inside the page */
  useEffect(() => {
    const onMessage = (e) => {
      if (e.origin !== window.location.origin) return
      const d = e.data
      if (!d || d.source !== 'tp-pubs' || d.type !== 'detail') return
      if (d.id) {
        /* dedupe: the iframe echoes host-initiated opens back at us */
        if (window.location.hash.slice(1) !== d.id) navigate(`/publications#${d.id}`)
      } else if (window.location.hash) {
        /* replace, not navigate(-1): walking back through history is fragile
           when reloads and reopens have stacked entries in between */
        navigate('/publications', { replace: true })
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [navigate])

  /* URL -> iframe: deep links and the Back/Forward buttons */
  const tellFrame = () => {
    const win = frameRef.current && frameRef.current.contentWindow
    if (!win) return
    const id = window.location.hash.slice(1) || null
    win.postMessage({ source: 'tp-pubs-host', type: 'detail', id }, window.location.origin)
  }
  useEffect(() => { tellFrame() }, [location])

  return (
    <div className="pub-frame-wrap">
      <iframe
        ref={frameRef}
        className="pub-frame"
        src="/publications-page/index.html"
        title="Publications — Rachel Kim"
        onLoad={tellFrame}
      />
      <SiteNav />
    </div>
  )
}
