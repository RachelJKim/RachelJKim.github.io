import React, { useEffect } from 'react'

export default function Projects() {
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
            I am a master's student in School of Computing at KAIST, at the <a href="https://hcitech.org/">HCITech Lab</a> (advisor: Sang-Ho Yoon).<br />
            I focus on XR interfaces and interaction design...
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

      {/* Add News, Education, Honors sections next... */}
    </>
  )
}
