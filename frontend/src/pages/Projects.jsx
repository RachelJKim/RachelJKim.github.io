import React, { useEffect } from 'react'
import '../styles/projects.css'

export default function Projects() {
  useEffect(() => {
    document.body.classList.add('projects-page')
    return () => document.body.classList.remove('projects-page')
  }, [])

  return (
    <section id="projects">
      <h3 className="projects-page-title">Project Gallery</h3>
      <div className="project-gallery">
        {/* Project: HarmonyXR */}
        <div id="harmonyxr" className="project-wrapper">
          <div className="project-header">
            <h3 className="project-title">👂 HarmonyXR</h3>
            <div className="project-tags">
              <p className="project-category">Hackathon</p>
              <p className="project-type">XR</p>
              <p className="project-type">ACCESSIBILITY</p>
            </div>
          </div>
          <div className="project-item">
            <img src="/images/projects/HarmonyXR.gif" alt="Project Image: HarmonyXR" />
            <div className="project-overlay">
              <h3>Collaborative Music Composition Tool for Deaf and Hearing Producers</h3>
              <div className="project-links">
                <a href="https://github.com/RachelJKim/HarmonyXR" target="_blank" rel="noreferrer">GitHub</a>
                <a href="https://devpost.com/software/immersethebayfornow" target="_blank" rel="noreferrer">DevPost</a>
                <a href="https://youtu.be/yzgMXgW-zp0?si=cIG6qE9baoQ8Wtno" target="_blank" rel="noreferrer">Video</a>
              </div>
            </div>
          </div>
        </div>

        {/* Project: ALLeX */}
        <div id="allex" className="project-wrapper">
          <div className="project-header">
            <h3 className="project-title">🥼 ALLeX</h3>
            <div className="project-tags">
              <p className="project-category">🏅 Hackathon</p>
              <p className="project-type">WEB</p>
              <p className="project-type">AR</p>
            </div>
          </div>
          <div className="project-item">
            <img src="/images/projects/allex.GIF" alt="Project Image: ALLeX" />
            <div className="project-overlay">
              <h3>Web-based interactive XR platform for managing immersive chemistry lab classes</h3>
              <div className="project-links">
                <a href="https://github.com/RachelJKim/ALLeX" target="_blank" rel="noreferrer">GitHub</a>
              </div>
            </div>
          </div>
        </div>

        {/* Project: TaCo */}
        <div id="taco" className="project-wrapper">
          <div className="project-header">
            <h3 className="project-title">🖼️ TaCo</h3>
            <div className="project-tags">
              <p className="project-category">Just For Fun</p>
              <p className="project-type">ML</p>
              <p className="project-type">ACCESSIBILITY</p>
            </div>
          </div>
          <div className="project-item">
            <img src="/images/projects/taco.png" alt="Project Image: TaCo" />
            <div className="project-overlay">
              <h3>Conveying colors through Tactile Graphics, using Image Segmentation</h3>
              <div className="project-links">
                <a href="https://github.com/RachelJKim/TaCo" target="_blank" rel="noreferrer">GitHub</a>
              </div>
            </div>
          </div>
        </div>

        {/* Project: HapticPilot */}
        <div id="hapticpilot" className="project-wrapper">
          <div className="project-header">
            <h3 className="project-title">🤙🏻 HapticPilot</h3>
            <div className="project-tags">
              <p className="project-category">Research</p>
              <p className="project-type">VR</p>
              <p className="project-type">HARDWARE</p>
            </div>
          </div>
          <div className="project-item">
            <img src="/images/projects/hapticpilot.GIF" alt="Project Image: HapticPilot" />
            <div className="project-overlay">
              <h3>Authoring In-situ Hand Posture-Adaptive Vibrotactile Feedback for Virtual Reality</h3>
              <div className="project-links">
                <a href="https://dl.acm.org/doi/abs/10.1145/3631453" target="_blank" rel="noreferrer">Publication</a>
                <a href="https://www.youtube.com/watch?v=PJk7SUa8ZpI" target="_blank" rel="noreferrer">Video</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
