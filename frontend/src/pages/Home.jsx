import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import GooglyEye from '../components/GooglyEye'
import RockPile from '../components/RockPile'
import '../styles/home.css'

export default function Home() {
  const navigate = useNavigate()
  const scrollRef = useRef(null)
  const detailsRef = useRef(null)
  const [scrolled, setScrolled] = useState(false)
  const [aboutHover, setAboutHover] = useState(false)  // hover preview: white veil
  const [transitioning, setTransitioning] = useState(false)  // click: full fade + pile-in

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const onScroll = () => {
      setScrolled(container.scrollTop > 50)
    }
    container.addEventListener('scroll', onScroll, { passive: true })
    return () => container.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToDetails = () => {
    detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Hand off to /about exactly once, whichever trigger fires first.
  const handedOffRef = useRef(false)
  const goToAbout = () => {
    if (handedOffRef.current) return
    handedOffRef.current = true
    navigate('/about', { state: { fromTransition: true } })
  }

  // Clicking "About": play the white fade + rock pile-in over the hero, then hand
  // off to the /about route (which renders the same settled pile — seamless).
  const startAboutTransition = () => {
    if (transitioning) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      navigate('/about')   // no animation under reduced-motion
      return
    }
    setTransitioning(true)
    // Fallback: if animationend is delayed/throttled (e.g. a backgrounded tab), still
    // hand off shortly after the ~1.8s fade so the user is never stranded on the hero.
    setTimeout(goToAbout, 2100)
  }

  // Fired when the white sheet finishes fading in (~1.8s, a touch after the pile).
  const onPortalFaded = (e) => {
    if (e.target.classList.contains('about-portal__white')) goToAbout()
  }

  return (
    <div className="home-scroll-container" ref={scrollRef}>
      {/* Hero — full-bleed Porto sunset */}
      <div className={`home-hero ${aboutHover ? 'home-hero--about-hover' : ''}`}>
        {/* Two copies of the same photo, as in the Canva source: an enlarged
            faded one behind, and a crisp one offset over the right. The seam
            down the left is simply the crisp copy's edge. */}
        <img className="hero-photo hero-photo--back" src="/images/backgrounds/background-porto.jpg" alt="" aria-hidden="true" />
        <img className="hero-photo hero-photo--front" src="/images/backgrounds/background-porto.jpg" alt="Sunset over Porto" />

        {/* Hover preview: a faint white veil bleeds in while "About" is hovered. */}
        <div className="hero-about-veil" aria-hidden="true" />

        {/* The eyes straddle the seam */}
        <div className="hero-eyes">
          <GooglyEye size="10.024vw" className="eye-left" />
          <GooglyEye size="10.024vw" className="eye-right" />
        </div>

        <h1 className="hero-title">
          <span className="hero-title__intro">This is</span>
          <span className="hero-title__name">
            Hello,&nbsp; Rachel<span className="hero-title__last">Kim</span>
          </span>
        </h1>

        <nav className="hero-nav" aria-label="Main">
          <span className="hero-nav__rule" aria-hidden="true" />
          <ul>
            <li>
              <button
                type="button"
                onMouseEnter={() => setAboutHover(true)}
                onMouseLeave={() => setAboutHover(false)}
                onClick={startAboutTransition}
              >
                About
              </button>
            </li>
            <li><Link to="/publications">Research</Link></li>
            <li><Link to="/projects">Projects</Link></li>
            <li className="hero-nav__misc"><a href="#etc">misc</a></li>
          </ul>
        </nav>

        {/* Scroll-down affordance */}
        <button
          className={`scroll-indicator ${scrolled ? 'hidden' : ''}`}
          onClick={scrollToDetails}
          aria-label="Scroll down"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {/* About transition portal: a white sheet fades in (~1.8s) while the rock
          pile piles in on top (~1.5s); on fade-end we navigate to /about. */}
      {transitioning && (
        <div className="about-portal" onAnimationEnd={onPortalFaded}>
          <div className="about-portal__white" />
          <RockPile intro />
        </div>
      )}

      {/* Details — snaps into view */}
      <div className="home-details" ref={detailsRef}>
        {/* About */}
        <section className="subsection">
          <h2>About</h2>
          <hr className="divider" />
          <p className="section__text__p2">
            I am a master's student in School of Computing at KAIST, at the <a href="https://hcitech.org/">HCITech Lab (advisor: Sang-Ho Yoon)</a>.
            My research interests are in designing and developing the future interactive systems.
            Currently, I focus on XR interfaces and interaction design, working toward making XR a pervasive part of our everyday lives.
            <br /><br />
            Beyond research, I enjoy bringing our imaginative concepts into tangible experiences.
            I envision a world where we can reshape how we perceive and share our experiences.
            I believe this can happen through versatile interfaces and intuitive interactions, bridging the digital and physical dimensions.
          </p>
          <p className="section__text__p3">
            Research Interests: HCI, XR&nbsp;&nbsp;|&nbsp;&nbsp;Context-Aware Systems, Gestural Interactions, Prototyping Tools, Haptics
          </p>
          <div className="btn-container">
            <button className="btn btn-color-2" onClick={() => window.open('/files/cv-rachel-kim.pdf', '_blank')}>Download CV</button>
            <img className="icon contact-icon" src="/images/logo/google-scholar.png" alt="Scholar" onClick={() => window.location.href = "https://scholar.google.com/citations?user=MHj2MAoAAAAJ"} />
            <img className="icon contact-icon" src="/images/logo/linkedin.png" alt="LinkedIn" onClick={() => window.location.href = "https://www.linkedin.com/in/rachel-kim-925366323/"} />
            <img className="icon contact-icon" src="/images/logo/github.png" alt="GitHub" onClick={() => window.location.href = "https://github.com/RachelJKim"} />
            <img className="icon contact-icon" src="/images/logo/twitter.png" alt="Twitter" onClick={() => window.location.href = "https://x.com/Rachel_JKim"} />
          </div>
          <hr className="divider" />
        </section>

        {/* News */}
        <section className="subsection">
          <h2>News</h2>
          <hr className="divider" />
          <ul className="news-list">
            <li><span className="news-date">Oct 2024</span> &emsp; 🏆 1st place in hackathon, and showcased ALLeX at Daejeon Science Festival</li>
            <li><span className="news-date">May 2024</span> &emsp; Student Volunteer at ACM CHI 2024 @Honolulu</li>
            <li><span className="news-date">Nov 2023</span> &emsp; Paper (HapticPilot) accepted at 🥳 ACM IMWUT 2023 </li>
            <li><span className="news-date">Aug 2023</span> &emsp; Returned from my 6-month exchange student at Politecnico di Milano</li>
            <li><span className="news-date">Dec 2022</span> &emsp; Our poster recieved the 🏆 "Best In-Person Poster/Demo Award" at ACM VRST 2022 </li>
            <li><span className="news-date">Sep 2022</span> &emsp; Poster accepted at 🥳 ACM VRST 2022 </li>
          </ul>
          <hr className="divider" />
        </section>

        {/* Education */}
        <section className="subsection">
          <h2>Education</h2>
          <hr className="divider" />
          <div className="education-entry">
            <div className="education-details">
              <strong>KAIST (Korea Advanced Institute of Science and Technology)</strong>
              <ul><li>M.S. student in School of Computing</li></ul>
            </div>
            <div className="education-dates"><h4>Mar 2025 - </h4></div>
          </div>
          <div className="education-entry">
            <div className="education-details">
              <strong>KAIST (Korea Advanced Institute of Science and Technology)</strong>
              <ul><li>B.S. in School of Computing (Minor: Culture Technology)</li></ul>
            </div>
            <div className="education-dates"><h4>Mar 2020 - Feb 2025</h4></div>
          </div>
          <hr className="divider" />
        </section>

        {/* Honors & Awards */}
        <section className="subsection">
          <h2>Honors & Awards</h2>
          <hr className="divider" />
          <div className="education-entry">
            <div className="education-details">
              <strong>2nd Place (Challenge Award + 500K KRW) at KAIST CT Startup Challenge</strong>
              <ul><li>HarmonyXR: Collaborative Music Creation Tool for Deaf and Hearing Producers</li></ul>
            </div>
            <div className="education-dates"><h4>Dec 2024</h4></div>
          </div>
          <div className="education-entry">
            <div className="education-details">
              <strong>1st Place (Mayor's Award + 2M KRW) at Sparcs Science Hackathon 2024</strong>
              <ul><li>ALLeX: Web-based interactive XR platform for managing immersive chemistry lab classes for teachers and students</li></ul>
            </div>
            <div className="education-dates"><h4>Oct 2024</h4></div>
          </div>
          <div className="education-entry">
            <div className="education-details">
              <strong>National Excellence Scholarship, Korea Student Aid Foundation</strong>
              <ul><li>National scholarship to students who showed academic excellence</li></ul>
            </div>
            <div className="education-dates"><h4>Fall 2022</h4></div>
          </div>
          <div className="education-entry">
            <div className="education-details">
              <strong>Dean's List, KAIST</strong>
              <ul><li>Awarded to top 3% among 2,900+ students in College of Engineering, KAIST</li></ul>
            </div>
            <div className="education-dates"><h4>Spring 2022</h4></div>
          </div>
          <hr className="divider" />
        </section>
      </div>
    </div>
  )
}
