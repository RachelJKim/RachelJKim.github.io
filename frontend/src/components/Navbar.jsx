import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import '../styles/navbar.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  const navWrapperClass = [
    'navbar-wrapper',
    location.pathname === '/' ? 'home-page' : '',
    location.pathname === '/about' ? 'about-page' : '',
    location.pathname === '/publications' ? 'publications-page' : '',
    location.pathname === '/projects' ? 'projects-page' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={navWrapperClass}>
      {/* Desktop Navbar */}
      <nav id="desktop-nav">
        <div className="logo">
          <img
            src="/images/rachel/rachel-logo-transparent.png"
            alt="Website Logo"
            className="logo-img"
          />
          achelJK
        </div>
        <div>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/publications">Publications</Link></li>
            <li><Link to="/projects">Projects</Link></li>
            <li><a href="#etc">ETC</a></li>
          </ul>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav id="hamburger-nav">
        <div className="logo">
          <img
            src="/images/rachel/rachel-logo-transparent.png"
            alt="Website Logo"
            className="logo-img"
          />
          achelJK
        </div>
        <div className="hamburger-menu">
          <div className="hamburger-icon" onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className={`menu-links ${menuOpen ? 'open' : ''}`}>
            <div className="close-button" onClick={toggleMenu}>X</div>
            <li><Link to="/" onClick={toggleMenu}>Home</Link></li>
            <li><Link to="/publications" onClick={toggleMenu}>Publications</Link></li>
            <li><Link to="/projects" onClick={toggleMenu}>Projects</Link></li>
            <li><a href="#etc" onClick={toggleMenu}>ETC</a></li>
          </div>
        </div>
      </nav>
    </div>
  )
}