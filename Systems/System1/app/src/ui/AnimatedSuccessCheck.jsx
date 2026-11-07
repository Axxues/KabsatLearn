/**
 * Technique 06 from react-animations.mp4: "Draw the win"
 * First the circle draws around, then the checkmark tick draws inward.
 */
export default function AnimatedSuccessCheck({
  className = 'size-6',
  circleColor = 'var(--color-good)',
  tickColor = '#ffffff',
}) {
  return (
    <svg
      className={`${className} overflow-visible`}
      viewBox="0 0 24 24"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Outer circle that draws first */}
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={circleColor}
        strokeWidth="2.5"
        className="animate-draw-circle"
      />
      {/* Checkmark tick that draws after circle */}
      <path
        d="m8.5 12 2.5 2.5 4.5-5"
        stroke={tickColor}
        strokeWidth="2.5"
        className="animate-draw-tick"
      />
    </svg>
  )
}
