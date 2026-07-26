import { useState, useRef } from 'react'
import { FIELDS } from '../data/homeScene'
import './scene-editor.css'

/* Dev-only layout editor for the Home scene. Rendered by Home when the URL has
   ?edit. Drag elements in the scene to move them; use the inputs here for fine
   control; Save persists to this browser, Copy JSON gives you the object to paste
   into data/homeScene.js as the committed default. The panel itself is draggable
   (by its header) so it doesn't block the elements behind it. */
export default function SceneEditor({ layout, selected, onSelect, onChange, onSave, onCopy, onRevert, onDefaults }) {
  const [status, setStatus] = useState('')
  const [pos, setPos] = useState(null) // {left, top} once dragged; null = default (top-right)
  const [collapsed, setCollapsed] = useState(false)
  const dragRef = useRef(null)
  const flash = (msg) => {
    setStatus(msg)
    setTimeout(() => setStatus(''), 1600)
  }

  const startPanelDrag = (e) => {
    if (e.target.closest('.se-collapse')) return // let the collapse button click through
    e.preventDefault()
    const panel = e.currentTarget.closest('.scene-editor').getBoundingClientRect()
    dragRef.current = { dx: e.clientX - panel.left, dy: e.clientY - panel.top }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const onPanelDrag = (e) => {
    const d = dragRef.current
    if (!d) return
    const left = Math.max(4, Math.min(window.innerWidth - 60, e.clientX - d.dx))
    const top = Math.max(4, Math.min(window.innerHeight - 40, e.clientY - d.dy))
    setPos({ left, top })
  }
  const endPanelDrag = (e) => { dragRef.current = null; e.currentTarget.releasePointerCapture?.(e.pointerId) }

  const keys = Object.keys(layout)
  const fields = FIELDS[selected] || []

  return (
    <div
      className={`scene-editor${collapsed ? ' is-collapsed' : ''}`}
      style={pos ? { left: `${pos.left}px`, top: `${pos.top}px`, right: 'auto' } : undefined}
    >
      <div
        className="se-header"
        onPointerDown={startPanelDrag}
        onPointerMove={onPanelDrag}
        onPointerUp={endPanelDrag}
      >
        <span className="se-grip" aria-hidden="true">⠿</span>
        <span className="se-title">Layout editor</span>
        <button
          className="se-collapse"
          title={collapsed ? 'Expand' : 'Collapse'}
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? '▢' : '—'}
        </button>
      </div>
      <div className="se-body">
      <p className="se-hint">Drag the header to move me. Drag anything in the scene, or nudge below.</p>

      <div className="se-tabs">
        {keys.map((k) => (
          <button
            key={k}
            className={`se-tab ${k === selected ? 'is-active' : ''}`}
            onClick={() => onSelect(k)}
          >
            {k}
          </button>
        ))}
      </div>

      <div className="se-fields">
        {fields.map((f) => (
          <label key={f} className="se-field">
            <span>{f}</span>
            <input
              type="number"
              step="0.5"
              value={layout[selected][f]}
              onChange={(e) => onChange(selected, { [f]: Number(e.target.value) })}
            />
          </label>
        ))}
      </div>

      <div className="se-actions">
        <button onClick={() => { onSave(); flash('Saved to this browser') }}>Save</button>
        <button onClick={() => { onCopy(); flash('Copied JSON') }}>Copy JSON</button>
        <button
          className="se-reset"
          onClick={() => { onRevert(); flash('Reverted to last saved') }}
        >
          Revert
        </button>
      </div>

      <div className="se-status">{status}</div>
      <p className="se-note">
        <b>Save</b> stores your layout in this browser. <b>Revert</b> drops unsaved changes
        back to the last saved layout. Copy JSON and paste into <code>data/homeScene.js</code>
        to make it the site default.
        <button className="se-link" onClick={() => { onDefaults(); flash('Loaded file defaults') }}>
          load file defaults
        </button>
      </p>
      </div>
    </div>
  )
}
