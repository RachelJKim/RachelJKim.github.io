import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import GooglyEye from '../components/GooglyEye'
import SceneEditor from '../tools/SceneEditor'
import TrashBin from '../components/TrashBin'
import CrumpleNote from '../components/CrumpleNote'
import { loadLayout, saveLayout, DEFAULT_LAYOUT } from '../data/homeScene'
import '../styles/home.css'

// Objects the trash bin spits out on click — each is a nav button (artwork +
// label → route).
const TRASH_OBJECTS = [
  { key: 'objTissue', src: '/images/trashbin/nav-tissue.png', label: 'Publications', to: '/publications' },
  { key: 'objPet', src: '/images/trashbin/nav-pet.png', label: 'Projects', to: '/projects' },
  { key: 'objRock', src: '/images/trashbin/nav-rock.png', label: 'Misc', to: '/misc' },
]

const CV_URL = 'https://drive.google.com/file/d/1Jgra7dpJOcXx_XTupPSd6WcpMObqTLVS/view?usp=drive_link'

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
  const [spat, setSpat] = useState(false) // have the nav objects been spat out of the bin?
  const [pastHero, setPastHero] = useState(false) // phone: scrolled off the hero screen (fades the scroll cue)
  const [notePhase, setNotePhase] = useState('flat') // flat | crumpled | rested (the notes paper)
  const sceneRef = useRef(null)
  const characterRef = useRef(null)
  const notesRef = useRef(null)
  const notesInnerRef = useRef(null)
  const cvRef = useRef(null)
  const binRef = useRef(null)
  const dragRef = useRef(null)
  const crumpleRef = useRef(null)

  // The bin's centre expressed in the notes' own cqw frame (% of notes width).
  // The nav objects live inside the notes now, so this is where they fly *from* when
  // spat out of the bin. Recomputed on resize so the origin tracks the real bin.
  const [binCqw, setBinCqw] = useState({ x: 100, y: 85 })

  // Elements positioned in cqw *inside* another element drag relative to that
  // parent's width (rather than in vw/vh against the viewport).
  const REL_PARENT = {
    eyeL: characterRef, eyeR: characterRef,
    notesText: notesRef, contactText: notesRef, cv: notesRef, cvText: cvRef,
    objTissue: notesRef, objPet: notesRef, objRock: notesRef,
  }

  useEffect(() => {
    document.body.classList.add('home-scene-body')
    return () => document.body.classList.remove('home-scene-body')
  }, [])

  // Measure where the bin sits in the notes' cqw frame, so each nav object knows its
  // offset back into the bin (its hidden state). Re-runs whenever the notes resize
  // (window resize, late image load) — the fly-out origin stays on the real bin.
  useEffect(() => {
    const measure = () => {
      const notes = notesRef.current
      const bin = binRef.current
      if (!notes || !bin) return
      const nr = notes.getBoundingClientRect()
      const nw = notes.offsetWidth
      const nh = notes.offsetHeight
      if (!nw) return
      const tlX = nr.left + nr.width / 2 - nw / 2 // notes' (unrotated) top-left
      const tlY = nr.top + nr.height / 2 - nh / 2
      const br = bin.getBoundingClientRect()
      const x = Math.round(((br.left + br.width / 2 - tlX) / nw) * 1000) / 10
      const y = Math.round(((br.top + br.height / 2 - tlY) / nw) * 1000) / 10
      // Bail out when nothing meaningful changed — returning the SAME object skips the
      // re-render, so the ResizeObserver can't feed back into itself. Without this the
      // stacked (in-flow) layout loops and freezes: re-render → reflow → observer → …
      setBinCqw((prev) => (Math.abs(prev.x - x) < 0.5 && Math.abs(prev.y - y) < 0.5 ? prev : { x, y }))
    }
    measure()
    // NB: a ResizeObserver here fed back into itself and froze the in-flow stacked
    // (mobile) layout — re-render → reflow → observe → … So instead just re-measure
    // once after layout settles (paper image / font swap) and on window resize. That's
    // enough: binCqw only seeds the fly-out origin; the resting spots are pure cqw.
    const settle = setTimeout(measure, 300)
    window.addEventListener('resize', measure)
    return () => {
      clearTimeout(settle)
      window.removeEventListener('resize', measure)
    }
  }, [])

  const round = (n) => Math.round(n * 10) / 10
  const update = (key, patch) => setLayout((L) => ({ ...L, [key]: { ...L[key], ...patch } }))

  // Drag-to-move in edit mode. Top-level groups move in the stage's cqw (x) / cqh (y);
  // elements inside another (eyes, notes text, …) move in cqw against their parent's
  // width for both axes. Pointer capture keeps the drag alive off-element.
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
        const stage = sceneRef.current?.getBoundingClientRect()
        const parentW = parentRef?.current?.getBoundingClientRect().width || 1
        dragRef.current = {
          key,
          rel: !!parentRef,
          startX: e.clientX,
          startY: e.clientY,
          sx: el.leftCqw,
          sy: parentRef ? el.topCqw : el.topCqh,
          divX: parentRef ? parentW : stage?.width || 1,
          divY: parentRef ? parentW : stage?.height || 1,
        }
        setSelected(key)
      },
      onPointerMove: (e) => {
        const d = dragRef.current
        if (!d || d.key !== key) return
        const dx = ((e.clientX - d.startX) / d.divX) * 100
        const dy = ((e.clientY - d.startY) / d.divY) * 100
        update(key, d.rel
          ? { leftCqw: round(d.sx + dx), topCqw: round(d.sy + dy) }
          : { leftCqw: round(d.sx + dx), topCqh: round(d.sy + dy) })
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
  const ct = layout.contactText
  const cvg = layout.cv
  const cvt = layout.cvText
  const tr = layout.trash

  return (
    <div
      ref={sceneRef}
      className={`home-scene${editMode ? ' editing' : ''}${spat ? ' spat' : ''}${pastHero ? ' past-hero' : ''}`}
      onScroll={(e) => {
        // Phone: .home-scene is the snap scroller. Fade the scroll cue once we leave
        // the hero (nothing more below on the last screen). No-op on desktop (it doesn't
        // scroll internally there).
        const el = e.currentTarget
        const past = el.scrollTop > el.clientHeight * 0.5
        setPastHero((p) => (p === past ? p : past))
      }}
      onContextMenu={(e) => {
        // Block the right-click "Save image…" menu on the artwork + title so the
        // individual pieces can't be lifted (long-press callout is disabled in CSS).
        // Links keep their menu. Skip in the editor so dragging is unaffected.
        if (!editMode && e.target.closest('img, .hs-title')) e.preventDefault()
      }}
    >
      {/* Screen 1 (hero) — a full-screen scroll-snap section in phone mode. Transparent
          (display:contents) on desktop, so the groups still sit on the stage. */}
      <div className="hs-section hs-section--hero">
      {/* Title */}
      <h1
        className={`hs-title${sel('title')}`}
        style={{ '--x': `${t.leftCqw}cqw`, '--y': `${t.topCqh}cqh`, '--font': `${t.fontCqw}cqw` }}
        {...dragProps('title')}
      >
        Rachel J. Kim
      </h1>

      {/* Character: sketched monitor + googly eyes + caption */}
      <div
        ref={characterRef}
        className={`hs-character${sel('character')}`}
        style={{ '--x': `${c.leftCqw}cqw`, '--y': `${c.topCqh}cqh`, '--w': `${c.widthCqw}cqw` }}
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
        style={{ '--x': `${cap.leftCqw}cqw`, '--y': `${cap.topCqh}cqh`, '--font': `${cap.fontCqw}cqw` }}
        {...dragProps('caption')}
      >
        {/* CSS swaps these: "ask me…" on desktop, "coming soon" in the phone layout. */}
        <span className="hs-caption-ask">ask me about rachel !</span>
        <span className="hs-caption-soon">coming soon</span>
      </p>

      {/* Subtle "scroll for more" cue — a faint track with a segment that drifts down.
          Phone layout only; see home.css. */}
      <span className="hs-scroll-cue" aria-hidden="true" />
      </div>

      {/* Screen 2 (about) — the notes paper (with the polaroid + nav objects) and the
          trash bin. Another full-screen scroll-snap section in phone mode. */}
      <div className="hs-section hs-section--about">
      {/* Notes: crumpled-paper background with the intro text overlaid on top — a
          separately-placeable transparent SVG whose "HCITechLab" is a hover link. */}
      <div
        ref={notesRef}
        className={`hs-notes${sel('notes')}${notePhase === 'flat' ? '' : ' is-crumpled'}`}
        style={{ '--x': `${n.leftCqw}cqw`, '--y': `${n.topCqh}cqh`, '--w': `${n.widthCqw}cqw`, '--rot': `${n.rot || 0}deg` }}
        {...dragProps('notes')}
      >
        {/* Everything on the paper lives in this inner box. It has the same geometry as
            .hs-notes (so the cqw-placed children are unaffected) but carries none of the
            group's transform — which is what CrumpleNote rasterises, un-rotated. */}
        <div
          ref={notesInnerRef}
          className="hs-notes-inner"
          onClick={(e) => {
            // Click the paper itself to crumple it. Links and the nav buttons on the
            // note keep their own click; the editor is left alone entirely.
            if (editMode || e.target.closest('a, button')) return
            crumpleRef.current?.crumple()
          }}
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

        {/* Contact line below the intro — LinkedIn/GitHub/Scholar/X hover links */}
        <div
          className={`hs-contact${sel('contactText')}`}
          style={{ left: `${ct.leftCqw}cqw`, top: `${ct.topCqw}cqw`, width: `${ct.widthCqw}cqw`, transform: `rotate(${ct.rot || 0}deg)` }}
          {...dragProps('contactText')}
        >
          <img
            className="hs-contact-img"
            src="/images/home/text-contact.png"
            alt="You can email luxo@racheljk.me, or come check out my LinkedIn, GitHub, Google Scholar, or X."
            draggable="false"
          />
          <a className="contact-link link-linkedin" href="https://www.linkedin.com/in/rachel-kim-925366323/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn" />
          <a className="contact-link link-github" href="https://github.com/RachelJKim" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub" />
          <a className="contact-link link-scholar" href="https://scholar.google.com/citations?user=MHj2MAoAAAAJ" target="_blank" rel="noopener noreferrer" aria-label="Google Scholar" title="Google Scholar" />
          <a className="contact-link link-x" href="https://x.com/Rachel_JKim" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" title="X" />
        </div>

        {/* CV: profile polaroid + "curriculum vitae" text (together a link to the CV).
            Lives inside the notes group, placed in cqw relative to the paper, so it
            moves and scales with the notes on resize. Hover highlights the text; click
            opens it. (Nav suppressed while editing.) */}
        <a
          ref={cvRef}
          className={`hs-cv${sel('cv')}`}
          style={{ left: `${cvg.leftCqw}cqw`, top: `${cvg.topCqw}cqw`, width: `${cvg.widthCqw}cqw`, transform: `rotate(${cvg.rot || 0}deg)` }}
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

        {/* Nav objects — they live on the notes (cqw, so their resting spots ride the
            paper on resize), but their entrance flies them out of the bin. The slot
            holds the cqw position (snaps on resize); the inner button does the fly. */}
        {TRASH_OBJECTS.map((o, i) => {
          const obj = layout[o.key]
          return (
            <div
              key={o.key}
              className="hs-tobj-slot"
              style={{ left: `${obj.leftCqw}cqw`, top: `${obj.topCqw}cqw`, width: `${obj.widthCqw}cqw` }}
            >
              <button
                type="button"
                className={`hs-tobj${sel(o.key)}`}
                aria-label={o.label}
                onClick={editMode ? undefined : () => navigate(o.to)}
                style={{
                  '--rot': `${obj.rot || 0}deg`,
                  '--bin-dx': `${(binCqw.x - obj.leftCqw).toFixed(1)}cqw`,
                  '--bin-dy': `${(binCqw.y - obj.topCqw).toFixed(1)}cqw`,
                  transitionDelay: `${(i * 0.08).toFixed(2)}s`,
                }}
                {...dragProps(o.key)}
              >
                <img className="hs-tobj-img" src={o.src} alt="" draggable="false" />
                <span className="hs-tobj-label">{o.label}</span>
              </button>
            </div>
          )
        })}
        </div>

        {/* Hover affordance for the crumple. Outside .hs-notes-inner so it never
            gets baked into the snapshot. */}
        {!editMode && <span className="hs-notes-hint" aria-hidden="true">crumple me</span>}
      </div>

      {/* Trashbin — click to spit the nav objects out (and click again to pull them
          back in). Lid opens on hover. */}
      <TrashBin
        ref={binRef}
        className={`hs-trash${sel('trash')}`}
        style={{ '--x': `${tr.leftCqw}cqw`, '--y': `${tr.topCqh}cqh`, '--w': `${tr.widthCqw}cqw`, '--rot': `${tr.rot || 0}deg` }}
        label="Trash"
        onClick={editMode ? undefined : () => setSpat((s) => !s)}
        {...dragProps('trash')}
      />
      </div>

      {/* Click the paper → it folds into a ball, is thrown across the desk and lands
          beside the bin. Click the ball to smooth it back out. The snapshot is cached,
          so it's re-taken whenever the note's content changes (the nav objects being
          spat out of the bin is the only thing that does). */}
      {!editMode && (
        <CrumpleNote
          ref={crumpleRef}
          sourceRef={notesInnerRef}
          restRef={binRef}
          snapshotKey={spat ? 'spat' : 'tidy'}
          onPhaseChange={setNotePhase}
          restHint="put it back?"
        />
      )}

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
