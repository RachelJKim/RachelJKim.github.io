import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import GooglyEye from '../components/GooglyEye'
import SceneEditor from '../components/SceneEditor'
import TrashBin from '../components/TrashBin'
import { loadLayout, saveLayout, DEFAULT_LAYOUT } from '../data/homeScene'
import '../styles/home.css'

// Objects the trash bin spits out on click — each is a nav button (artwork +
// label → route).
const TRASH_OBJECTS = [
  { key: 'objTissue', src: '/images/trashbin/nav-tissue.png', label: 'Publications', to: '/publications' },
  { key: 'objPet', src: '/images/trashbin/nav-pet.png', label: 'Projects', to: '/projects' },
  { key: 'objRock', src: '/images/trashbin/nav-rock.png', label: 'Misc', to: '/misc' },
]

const CV_URL = 'https://docs.google.com/document/d/1gHNZp9hdkjh8tue9ZRP-6wNHoDDXblbBZcAo8HiCfN8/edit?usp=sharing'

/* Home — a single full-screen "desk" scene from Rachel's wireframe. Element
   positions/sizes come from data/homeScene.js so they can be tuned live at
   /?edit (drag + the SceneEditor panel). Positions are fed to CSS as custom
   properties (--x/--y/--w/--rot/--font) so the mobile media query can still
   override them; the eyes and caption sit inside the character and use cqw. */
export default function Home() {
  const { search } = useLocation()
  const navigate = useNavigate()
  const editMode = new URLSearchParams(search).has('edit')

  const [layout, setLayout] = useState(loadLayout)
  const [selected, setSelected] = useState('character')
  const characterRef = useRef(null)
  const notesRef = useRef(null)
  const cvRef = useRef(null)
  const dragRef = useRef(null)

  // Elements positioned in cqw *inside* another element drag relative to that
  // parent's width (rather than in vw/vh against the viewport).
  const REL_PARENT = { eyeL: characterRef, eyeR: characterRef, notesText: notesRef, cvText: cvRef }

  useEffect(() => {
    document.body.classList.add('home-scene-body')
    return () => document.body.classList.remove('home-scene-body')
  }, [])

  const round = (n) => Math.round(n * 10) / 10
  const update = (key, patch) => setLayout((L) => ({ ...L, [key]: { ...L[key], ...patch } }))

  // Drag-to-move in edit mode. Top-level groups move in vw/vh against the viewport;
  // elements inside another (eyes, notes text) move in cqw against their parent's
  // width. Pointer capture keeps the drag alive off-element.
  const dragProps = (key) => {
    if (!editMode) return {}
    return {
      'data-edit': key,
      onPointerDown: (e) => {
        e.preventDefault()
        e.stopPropagation()
        e.currentTarget.setPointerCapture?.(e.pointerId)
        const el = layout[key]
        const parentRef = REL_PARENT[key]
        dragRef.current = {
          key,
          rel: !!parentRef,
          startX: e.clientX,
          startY: e.clientY,
          sx: parentRef ? el.leftCqw : el.leftVw,
          sy: parentRef ? el.topCqw : el.topVh,
          parentW: parentRef?.current?.getBoundingClientRect().width || 1,
        }
        setSelected(key)
      },
      onPointerMove: (e) => {
        const d = dragRef.current
        if (!d || d.key !== key) return
        if (d.rel) {
          const dx = ((e.clientX - d.startX) / d.parentW) * 100
          const dy = ((e.clientY - d.startY) / d.parentW) * 100
          update(key, { leftCqw: round(d.sx + dx), topCqw: round(d.sy + dy) })
        } else {
          const dx = ((e.clientX - d.startX) / window.innerWidth) * 100
          const dy = ((e.clientY - d.startY) / window.innerHeight) * 100
          update(key, { leftVw: round(d.sx + dx), topVh: round(d.sy + dy) })
        }
      },
      onPointerUp: (e) => {
        dragRef.current = null
        e.currentTarget.releasePointerCapture?.(e.pointerId)
      },
    }
  }

  const sel = (key) => (editMode && selected === key ? ' is-selected' : '')

  const t = layout.title
  const c = layout.character
  const eL = layout.eyeL
  const eR = layout.eyeR
  const cap = layout.caption
  const n = layout.notes
  const nt = layout.notesText
  const cvg = layout.cv
  const cvt = layout.cvText
  const tr = layout.trash

  return (
    <div className={`home-scene${editMode ? ' editing' : ''}`}>
      {/* Title */}
      <h1
        className={`hs-title${sel('title')}`}
        style={{ '--x': `${t.leftVw}vw`, '--y': `${t.topVh}vh`, '--font': `${t.fontVw}vw` }}
        {...dragProps('title')}
      >
        Rachel J. Kim
      </h1>

      {/* Character: sketched monitor + googly eyes + caption */}
      <div
        ref={characterRef}
        className={`hs-character${sel('character')}`}
        style={{ '--x': `${c.leftVw}vw`, '--y': `${c.topVh}vh`, '--w': `${c.widthVw}vw` }}
        {...dragProps('character')}
      >
        <img className="hs-frame" src="/images/home/character-frame.png" alt="" draggable="false" />

        <GooglyEye
          className={`hs-eye${sel('eyeL')}`}
          size={`${eL.sizeCqw}cqw`}
          style={{ left: `${eL.leftCqw}cqw`, top: `${eL.topCqw}cqw`, transform: `rotate(${eL.rot || 0}deg)` }}
          {...dragProps('eyeL')}
        />
        <GooglyEye
          className={`hs-eye${sel('eyeR')}`}
          size={`${eR.sizeCqw}cqw`}
          style={{ left: `${eR.leftCqw}cqw`, top: `${eR.topCqw}cqw`, transform: `rotate(${eR.rot || 0}deg)` }}
          {...dragProps('eyeR')}
        />

        {/* Hover affordance — not clickable yet */}
        <span className="hs-coming-soon" aria-hidden="true">coming soon</span>
      </div>

      {/* Caption — its own element so the gap to the character is adjustable */}
      <p
        className={`hs-caption${sel('caption')}`}
        style={{ '--x': `${cap.leftVw}vw`, '--y': `${cap.topVh}vh`, '--font': `${cap.fontVw}vw` }}
        {...dragProps('caption')}
      >
        ask me about rachel !
      </p>

      {/* Notes: crumpled-paper background with the intro text overlaid on top — a
          separately-placeable transparent SVG whose "HCITechLab" is a hover link. */}
      <div
        ref={notesRef}
        className={`hs-notes${sel('notes')}`}
        style={{ '--x': `${n.leftVw}vw`, '--y': `${n.topVh}vh`, '--w': `${n.widthVw}vw`, '--rot': `${n.rot || 0}deg` }}
        {...dragProps('notes')}
      >
        <img className="hs-notes-bg" src="/images/home/notes-paper.png" alt="" draggable="false" />
        <div
          className={`hs-notes-text${sel('notesText')}`}
          style={{ left: `${nt.leftCqw}cqw`, top: `${nt.topCqw}cqw`, width: `${nt.widthCqw}cqw`, transform: `rotate(${nt.rot || 0}deg)` }}
          {...dragProps('notesText')}
        >
          <img
            className="hs-notes-textimg"
            src="/images/home/notes-text.svg"
            alt="I am a master's student in HCITechLab, KAIST. I research and prototype new interactive systems :) I like to think about how future interfaces can reshape the way we perceive and interact with the world."
            draggable="false"
          />
          {/* transparent hotspot over the "HCITechLab" handwriting */}
          <a
            className="hcitechlab-link"
            href="https://hcitech.org/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="HCITech Lab"
            title="HCITech Lab"
          />
        </div>
      </div>

      {/* CV: the profile polaroid + "curriculum vitae" text, together a link to the
          CV. Hover highlights the text; click opens it. (Nav suppressed while editing.) */}
      <a
        ref={cvRef}
        className={`hs-cv${sel('cv')}`}
        style={{ '--x': `${cvg.leftVw}vw`, '--y': `${cvg.topVh}vh`, '--w': `${cvg.widthVw}vw`, '--rot': `${cvg.rot || 0}deg` }}
        href={CV_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Rachel's CV (opens in a new tab)"
        onClick={(e) => { if (editMode) e.preventDefault() }}
        {...dragProps('cv')}
      >
        <img className="hs-cv-img" src="/images/home/profile-polaroid.png" alt="Rachel at her graduation" draggable="false" />
        <span
          className={`hs-cv-text${sel('cvText')}`}
          style={{ left: `${cvt.leftCqw}cqw`, top: `${cvt.topCqw}cqw`, fontSize: `${cvt.fontCqw}cqw`, '--rot': `${cvt.rot || 0}deg` }}
          {...dragProps('cvText')}
        >
          curriculum vitae (Jul. 2026)
        </span>
      </a>

      {/* Trashbin — decorative; the nav objects sit around it. Lid opens on hover. */}
      <TrashBin
        className={`hs-trash${sel('trash')}`}
        style={{ '--x': `${tr.leftVw}vw`, '--y': `${tr.topVh}vh`, '--w': `${tr.widthVw}vw`, '--rot': `${tr.rot || 0}deg` }}
        label="Trash"
        {...dragProps('trash')}
      />

      {/* Nav objects — always visible, clickable buttons (draggable in edit mode). */}
      {TRASH_OBJECTS.map((o) => {
        const obj = layout[o.key]
        return (
          <button
            key={o.key}
            type="button"
            className={`hs-tobj${sel(o.key)}`}
            aria-label={o.label}
            onClick={editMode ? undefined : () => navigate(o.to)}
            style={{
              '--x': `${obj.leftVw}vw`,
              '--y': `${obj.topVh}vh`,
              '--w': `${obj.widthVw}vw`,
              '--rot': `${obj.rot || 0}deg`,
            }}
            {...dragProps(o.key)}
          >
            <img className="hs-tobj-img" src={o.src} alt="" draggable="false" />
            <span className="hs-tobj-label">{o.label}</span>
          </button>
        )
      })}

      {editMode && (
        <SceneEditor
          layout={layout}
          selected={selected}
          onSelect={setSelected}
          onChange={update}
          onSave={() => saveLayout(layout)}
          onCopy={() => navigator.clipboard?.writeText(JSON.stringify(layout, null, 2))}
          onRevert={() => setLayout(loadLayout())}
          onDefaults={() => setLayout(structuredClone(DEFAULT_LAYOUT))}
        />
      )}
    </div>
  )
}
