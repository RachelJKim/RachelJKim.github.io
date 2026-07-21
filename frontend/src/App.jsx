import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Publications from './pages/Publications'
import Projects from './pages/Projects'

export default function App() {
  const location = useLocation()
  // Home is full-bleed: no fixed navbar, so no top offset to compensate for.
  const isHome = location.pathname === '/'

  return (
    <>
      <Navbar />
      <main className={`main-content ${isHome ? 'main-content--flush' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/publications" element={<Publications />} />
          <Route path="/projects" element={<Projects />} />
        </Routes>
      </main>
    </>
  )
}
