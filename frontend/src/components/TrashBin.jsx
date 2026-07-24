import '../styles/trashbin.css'

/* TrashBin — a clickable trash-can button on the home scene.

   The artwork is split into two PNGs on the *same* 514×698 canvas so they stack
   pixel-perfectly: `trashbin-body.png` (the striped can) defines the box and
   `trashbin-lid.png` (the handled lid) is overlaid on top. Motion is CSS (see
   styles/trashbin.css) — no GIF — and honors prefers-reduced-motion:
     • idle  → a gentle periodic lid bob that reads as "I'm clickable"
     • hover / keyboard focus → the lid swings open and shut, looping (opening
       animation only — no objects)
     • active (press) → the lid flips fully open

   Clicking spits objects out of the bin; those objects are separate scene
   elements owned by Home (so their landing spots are editable), not part of this
   component. */

/**
 * @param {number|string} [size]  width (px number or any CSS length). Omit to size via CSS/class.
 * @param {() => void} [onClick]   click handler (spits the objects)
 * @param {string} [label]         accessible label for the button (default "Trash")
 * @param {string} [className]     extra classes
 * @param {object} [style]         extra inline styles (merged after width)
 */
export default function TrashBin({ size, onClick, label = 'Trash', className = '', style, ...rest }) {
  const mergedStyle = {
    ...(size != null ? { width: typeof size === 'number' ? `${size}px` : size } : null),
    ...style,
  }
  return (
    <button
      type="button"
      className={`trashbin ${className}`}
      style={mergedStyle}
      onClick={onClick}
      aria-label={label}
      {...rest}
    >
      {/* body sizes the box; lid overlays it and does the moving */}
      <img className="trashbin-body" src="/images/trashbin/trashbin-body.png" alt="" draggable="false" />
      <img className="trashbin-lid" src="/images/trashbin/trashbin-lid.png" alt="" draggable="false" />
    </button>
  )
}
