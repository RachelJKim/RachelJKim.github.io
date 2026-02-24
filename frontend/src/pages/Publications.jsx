import React, { useEffect } from 'react'
import '../styles/publications.css'

export default function Publications() {
  useEffect(() => {
    document.body.classList.add('publications-page')
    return () => document.body.classList.remove('publications-page')
  }, [])

  return (
    <section id="publications">
      <div className="publication-container">
        <h3 className="publication-page-title">Publications</h3>
        <div className="publication-list">
          {/* [IMWUT'23] HapticPilot */}
          <div id="hapticpilot" className="publication-item">
            <div className="publication-media">
              <img
                className="publication-img"
                src="/images/publications/hapticpilot.png"
                alt="Teaser Image"
              />
            </div>
            <div className="publication-details">
              <p className="publication-info">[IMWUT'23]</p>
              <h3 className="publication-title">
                HapticPilot: Authoring In-situ Hand Posture-Adaptive Vibrotactile Feedback for Virtual Reality
              </h3>
              <p className="publication-authors">
                Youjin Sung, <strong>Rachel Kim</strong>, Kun Woo Song, Yitian Shao, Sang Ho Yoon
              </p>
              <div className="publication-links">
                <a
                  href="https://drive.google.com/file/d/1o_eSmWT46Qvo9EH3GD-jc355G4TtQZeS/view?usp=sharing"
                  target="_blank"
                  rel="noreferrer"
                  className="publication-link"
                >
                  PDF
                </a>
                <a
                  href="https://dl.acm.org/doi/abs/10.1145/3631453"
                  target="_blank"
                  rel="noreferrer"
                  className="publication-link"
                >
                  DOI
                </a>
                <a
                  href="https://youtu.be/PJk7SUa8ZpI?si=xpLjlQfuJPNW3a3E"
                  target="_blank"
                  rel="noreferrer"
                  className="publication-link"
                >
                  VIDEO
                </a>
              </div>
            </div>
          </div>

          {/* [VRST'22 Poster] */}
          <div id="vrst22-poster" className="publication-item">
            <div className="publication-media">
              <img
                className="publication-img"
                src="/images/publications/vrst22-poster.png"
                alt="Teaser Image"
              />
            </div>
            <div className="publication-details">
              <p className="publication-info">[VRST'22 Poster]</p>
              <h3 className="publication-title">
                Exploring Vibration Intensity Map Of Hand Postures For Haptic Rendering In XR
              </h3>
              <p className="publication-authors">
                Youjin Sung, Yitian Shao, <strong>Rachel Kim</strong>, Sang Ho Yoon
              </p>
              <div className="publication-links">
                <a
                  href="https://drive.google.com/file/d/1t8wBANStvBEIRH4kaNDKAUPuB1rKPL-F/view?usp=sharing"
                  target="_blank"
                  rel="noreferrer"
                  className="publication-link"
                >
                  PDF
                </a>
                <a
                  href="https://dl.acm.org/doi/abs/10.1145/3631453"
                  target="_blank"
                  rel="noreferrer"
                  className="publication-link"
                >
                  DOI
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
