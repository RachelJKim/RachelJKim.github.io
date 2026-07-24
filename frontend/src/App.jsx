import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Publications from './pages/Publications'
import Projects from './pages/Projects'
import About from './pages/About'
import Misc from './pages/Misc'

export default function App() {
  const location = useLocation()
  // All routes are full-bleed pages with their own nav: no fixed navbar, no top offset.
  const isFlush =
    location.pathname === '/' ||
    location.pathname === '/about' ||
    location.pathname === '/publications' ||
    location.pathname === '/projects' ||
    location.pathname === '/misc'

  return (
    <>
      <Navbar />
      <main className={`main-content ${isFlush ? 'main-content--flush' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/publications" element={<Publications />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/about" element={<About />} />
          <Route path="/misc" element={<Misc />} />
        </Routes>
      </main>
    </>
  )
}
