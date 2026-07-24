import { useEffect } from 'react'
import '../styles/publications.css'
import SiteNav from '../components/SiteNav'

/* Publications — the "toilet-paper scroll" page. It's a self-contained static page
   (its own html/body CSS + canvas scroll animation) copied verbatim to
   public/publications-page/, and embedded full-screen in an iframe here so its
   global styles and scripts stay isolated from the React app. Edit the paper list
   in public/publications-page/js/publications.js. */
export default function Publications() {
  useEffect(() => {
    document.body.classList.add('publications-page')
    return () => document.body.classList.remove('publications-page')
  }, [])

  return (
    <div className="pub-frame-wrap">
      <iframe className="pub-frame" src="/publications-page/index.html" title="Publications — Rachel Kim" />
      <SiteNav />
    </div>
  )
}
