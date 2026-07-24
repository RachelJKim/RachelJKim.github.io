import { useState } from 'react'
import { FIELDS } from '../data/homeScene'
import '../styles/scene-editor.css'

/* Dev-only layout editor for the Home scene. Rendered by Home when the URL has
   ?edit. Drag elements in the scene to move them; use the inputs here for fine
   control; Save persists to this browser, Copy JSON gives you the object to paste
   into data/homeScene.js as the committed default. */
export default function SceneEditor({ layout, selected, onSelect, onChange, onSave, onCopy, onRevert, onDefaults }) {
  const [status, setStatus] = useState('')
  const flash = (msg) => {
    setStatus(msg)
    setTimeout(() => setStatus(''), 1600)
  }

  const keys = Object.keys(layout)
  const fields = FIELDS[selected] || []

  return (
    <div className="scene-editor">
      <div className="se-title">Layout editor</div>
      <p className="se-hint">Drag anything in the scene, or nudge values below.</p>

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
  )
}
