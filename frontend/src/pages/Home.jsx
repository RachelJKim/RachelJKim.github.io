import React, { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    // Equivalent to script.js logic

    const profilePic = document.querySelector('.profile-pic')
    const body = document.body
    const hoverImg = new Image()
    hoverImg.src = '/images/rachel/profile-pic-green-cropped.png'
    const originalSrc = profilePic?.src

    function handleMouseEnter() {
      body.classList.add('hover-mode')
      profilePic.src = hoverImg.src
    }

    function handleMouseLeave() {
      body.classList.remove('hover-mode')
      profilePic.src = originalSrc
    }

    function handleProfileClick() {
      if (body.classList.contains('hover-mode')) {
        body.classList.remove('hover-mode')
        profilePic.src = originalSrc
      } else {
        body.classList.add('hover-mode')
        profilePic.src = hoverImg.src
      }
    }

    function setupProfilePicEvents() {
      if (!profilePic) return

      profilePic.removeEventListener('mouseenter', handleMouseEnter)
      profilePic.removeEventListener('mouseleave', handleMouseLeave)
      profilePic.removeEventListener('click', handleProfileClick)

      const currentMode = window.innerWidth > 768 ? 'desktop' : 'mobile'

      body.classList.remove('hover-mode')
      profilePic.src = originalSrc

      if (currentMode === 'desktop') {
        profilePic.addEventListener('mouseenter', handleMouseEnter)
        profilePic.addEventListener('mouseleave', handleMouseLeave)
      } else {
        profilePic.addEventListener('click', handleProfileClick)
      }
    }

    setupProfilePicEvents()
    window.addEventListener('resize', setupProfilePicEvents)

    return () => {
      window.removeEventListener('resize', setupProfilePicEvents)
    }
  }, [])

  return (
    <>
    {/* Profile Section */}
    <section id="profile">
        <div className="section__pic-container">
        <img
            src="/images/rachel/profile-pic-cropped-grad.png"
            alt="Rachel Kim profile picture"
            className="profile-pic"
        />
        </div>
        <div className="section__text">
        <h1 className="title">Rachel Kim | 김정민</h1>
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
            Research Interests: HCI, XR | Context-Aware Systems, Gestural Interactions, Prototyping Tools, Haptics
        </p>
        <div className="btn-container">
            <button className="btn btn-color-2" onClick={() => window.open('/files/cv-rachel-kim.pdf', '_blank')}>Download CV</button>
            <img className="icon contact-icon" src="/images/logo/google-scholar.png" alt="Scholar" onClick={() => window.location.href = "https://scholar.google.com/citations?user=MHj2MAoAAAAJ"} />
            <img className="icon contact-icon" src="/images/logo/linkedin.png" alt="LinkedIn" onClick={() => window.location.href = "https://www.linkedin.com/in/rachel-kim-925366323/"} />
            <img className="icon contact-icon" src="/images/logo/github.png" alt="GitHub" onClick={() => window.location.href = "https://github.com/RachelJKim"} />
            <img className="icon contact-icon" src="/images/logo/twitter.png" alt="Twitter" onClick={() => window.location.href = "https://x.com/Rachel_JKim"} />
        </div>
        </div>
    </section>

    {/* [SUBSECTION #1] News */}
    <section className="subsection" id="subsection">
        <h2>News</h2>
        <hr className="divider" />
        <div id="news-content"></div>
        <hr className="divider" />
    </section>

    {/* [SUBSECTION #2] Education */}
    <section className="subsection" id="subsection">
        <h2>Education</h2>
        <hr className="divider" />
        <div className="education-entry">
        <div className="education-details">
            <strong>KAIST (Korea Advanced Institute of Science and Technology)</strong>
            <ul>
            <li>M.S. student in School of Computing</li>
            </ul>
        </div>
        <div className="education-dates">
            <h4>Mar 2025 - </h4>
        </div>
        </div>
        <div className="education-entry">
        <div className="education-details">
            <strong>KAIST (Korea Advanced Institute of Science and Technology)</strong>
            <ul>
            <li>B.S. in School of Computing (Minor: Culture Technology)</li>
            </ul>
        </div>
        <div className="education-dates">
            <h4>Mar 2020 - Feb 2025</h4>
        </div>
        </div>
        <hr className="divider" />
    </section>

    {/* [SUBSECTION #3] Honors & Awards */}
    <section className="subsection" id="subsection">
        <h2>Honors & Awards</h2>
        <hr className="divider" />
        <div className="education-entry">
        <div className="education-details">
            <strong>2nd Place (Challenge Award + 500K KRW) at KAIST CT Startup Challenge</strong>
            <ul>
            <li>HarmonyXR: Collaborative Music Creation Tool for Deaf and Hearing Producers</li>
            </ul>
        </div>
        <div className="education-dates">
            <h4>Dec 2024</h4>
        </div>
        </div>
        <div className="education-entry">
        <div className="education-details">
            <strong>1st Place (Mayor’s Award + 2M KRW) at Sparcs Science Hackathon 2024</strong>
            <ul>
            <li>ALLeX: Web-based interactive XR platform for managing immersive chemistry lab classes for teachers and students</li>
            </ul>
        </div>
        <div className="education-dates">
            <h4>Oct 2024</h4>
        </div>
        </div>
        <div className="education-entry">
        <div className="education-details">
            <strong>National Excellence Scholarship, Korea Student Aid Foundation</strong>
            <ul>
            <li>National scholarship to students who showed academic excellence</li>
            </ul>
        </div>
        <div className="education-dates">
            <h4>Fall 2022</h4>
        </div>
        </div>
        <div className="education-entry">
        <div className="education-details">
            <strong>Dean’s List, KAIST</strong>
            <ul>
            <li>Awarded to top 3% among 2,900+ students in College of Engineering, KAIST</li>
            </ul>
        </div>
        <div className="education-dates">
            <h4>Spring 2022</h4>
        </div>
        </div>
        <hr className="divider" />
    </section>
    
    </>

  )
}
