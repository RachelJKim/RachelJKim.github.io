import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import GooglyEye from '../components/GooglyEye'
import SceneEditor from '../components/SceneEditor'
import { loadLayout, saveLayout, DEFAULT_LAYOUT } from '../data/homeScene'
import '../styles/home.css'

/* Home — a single full-screen "desk" scene from Rachel's wireframe. Element
   positions/sizes come from data/homeScene.js so they can be tuned live at
   /?edit (drag + the SceneEditor panel). Positions are fed to CSS as custom
   properties (--x/--y/--w/--rot/--font) so the mobile media query can still
   override them; the eyes and caption sit inside the character and use cqw. */
export default function Home() {
  const { search } = useLocation()
  const editMode = new URLSearchParams(search).has('edit')

  const [layout, setLayout] = useState(loadLayout)
  const [selected, setSelected] = useState('character')
  const characterRef = useRef(null)
  const dragRef = useRef(null)

  useEffect(() => {
    document.body.classList.add('home-scene-body')
    return () => document.body.classList.remove('home-scene-body')
  }, [])

  const round = (n) => Math.round(n * 10) / 10
  const update = (key, patch) => setLayout((L) => ({ ...L, [key]: { ...L[key], ...patch } }))

  // Drag-to-move in edit mode. Groups move in vw/vh; eyes move in cqw (relative to
  // the character's width). Pointer capture keeps the drag alive off-element.
  const dragProps = (key) => {
    if (!editMode) return {}
    return {
      'data-edit': key,
      onPointerDown: (e) => {
        e.preventDefault()
        e.stopPropagation()
        e.currentTarget.setPointerCapture?.(e.pointerId)
        const el = layout[key]
        const isEye = key === 'eyeL' || key === 'eyeR'
        dragRef.current = {
          key,
          isEye,
          startX: e.clientX,
          startY: e.clientY,
          sx: isEye ? el.leftCqw : el.leftVw,
          sy: isEye ? el.topCqw : el.topVh,
          charW: characterRef.current?.getBoundingClientRect().width || 1,
        }
        setSelected(key)
      },
      onPointerMove: (e) => {
        const d = dragRef.current
        if (!d || d.key !== key) return
        if (d.isEye) {
          const dx = ((e.clientX - d.startX) / d.charW) * 100
          const dy = ((e.clientY - d.startY) / d.charW) * 100
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
      </div>

      {/* Caption — its own element so the gap to the character is adjustable */}
      <p
        className={`hs-caption${sel('caption')}`}
        style={{ '--x': `${cap.leftVw}vw`, '--y': `${cap.topVh}vh`, '--font': `${cap.fontVw}vw` }}
        {...dragProps('caption')}
      >
        ask me about rachel !
      </p>

      {/* Notes + grad polaroid — Rachel's original artwork, one piece */}
      <div
        className={`hs-notes${sel('notes')}`}
        style={{ '--x': `${n.leftVw}vw`, '--y': `${n.topVh}vh`, '--w': `${n.widthVw}vw`, '--rot': `${n.rot || 0}deg` }}
        {...dragProps('notes')}
      >
        <img src="/images/home/notes-about.png" alt="I am a master's student in HCITechLab, KAIST. I research and prototype new interactive systems :) I like to think about how future interfaces can reshape the way we perceive and interact with the world. email: luxo@racheljk.me" draggable="false" />
      </div>

      {/* Trashbin doodle */}
      <img
        className={`hs-trash${sel('trash')}`}
        style={{ '--x': `${tr.leftVw}vw`, '--y': `${tr.topVh}vh`, '--w': `${tr.widthVw}vw`, '--rot': `${tr.rot || 0}deg` }}
        src="/images/trashbin/trashbin.png"
        alt=""
        draggable="false"
        {...dragProps('trash')}
      />

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
