import '../styles/trashbin.css'

/* TrashBin — a clickable trash-can button.

   The artwork is split into two PNGs on the *same* 514×698 canvas so they stack
   pixel-perfectly: `trashbin-body.png` (the striped can) defines the box, and
   `trashbin-lid.png` (the handled lid) is overlaid and is the only thing that
   moves. All motion is CSS (see styles/trashbin.css) — no GIF — so it stays crisp
   at any size, reacts to hover/focus/press, and honors prefers-reduced-motion:
     • idle  → a gentle periodic bob that reads as "I'm clickable"
     • hover / keyboard focus → a livelier, continuous bob
     • active (press) → the lid flips open, as if to receive trash

   Only the lid's transform animates, so the whole thing is cheap to run. */

/**
 * @param {number|string} size   width (px number or any CSS length, e.g. "12vw"). Default 180.
 * @param {() => void} onClick    click handler
 * @param {string} label          accessible label for the button (default "Trash")
 * @param {string} className      extra classes
 */
export default function TrashBin({ size = 180, onClick, label = 'Trash', className = '', ...rest }) {
  return (
    <button
      type="button"
      className={`trashbin ${className}`}
      style={{ width: typeof size === 'number' ? `${size}px` : size }}
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
