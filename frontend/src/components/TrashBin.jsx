import '../styles/trashbin.css'

/* TrashBin — a clickable trash-can button (a nav button on the home scene).

   The artwork is split into two PNGs on the *same* 514×698 canvas so they stack
   pixel-perfectly: `trashbin-body.png` (the striped can) defines the box and
   `trashbin-lid.png` (the handled lid) is overlaid on top. All motion is CSS (see
   styles/trashbin.css) — no GIF — so it stays crisp at any size and honors
   prefers-reduced-motion:
     • idle  → a gentle periodic bob that reads as "I'm clickable"
     • hover / keyboard focus → the lid swings open, a few bits pop out of the bin
       and drop back, then the lid shuts — looping while hovered
     • active (press) → the lid flips fully open

   The popped ITEMS are placeholders (Rachel's real ones aren't in yet): swap the
   emoji, or give an item a `src` and render an <img>. `--dx` = sideways drift,
   `--r` = spin. */

const ITEMS = [
  { char: '📄', dx: '-150%', r: '-45deg', delay: '0s' },
  { char: '💡', dx: '15%', r: '30deg', delay: '0.16s' },
  { char: '⭐', dx: '150%', r: '55deg', delay: '0.30s' },
]

/**
 * @param {number|string} [size]  width (px number or any CSS length). Omit to size via CSS/class.
 * @param {() => void} [onClick]   click handler
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
      {/* bits that pop out on hover (in front of the lid) */}
      <span className="tb-items" aria-hidden="true">
        {ITEMS.map((it, i) => (
          <span
            key={i}
            className="tb-item"
            style={{ '--dx': it.dx, '--r': it.r, animationDelay: it.delay }}
          >
            {it.char}
          </span>
        ))}
      </span>
    </button>
  )
}
