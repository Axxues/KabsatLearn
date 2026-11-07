import { useEffect, useRef, useState } from 'react'

/**
 * Technique 03 from react-animations.mp4: "Roll, don't jump"
 * Smoothly interpolates numeric values using cubic ease-out so eyes track the change.
 */
export default function RollingNumber({ value, duration = 450, className = '' }) {
  const [current, setCurrent] = useState(value ?? 0)
  const prevRef = useRef(value ?? 0)

  useEffect(() => {
    if (value === null || value === undefined) return
    const startVal = prevRef.current
    const endVal = Number(value)
    if (startVal === endVal) return

    let startTimestamp = null
    let frameId

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp
      const elapsed = timestamp - startTimestamp
      const progress = Math.min(elapsed / duration, 1)

      // Ease out cubic: fast at first, then settles
      const ease = 1 - Math.pow(1 - progress, 3)
      const nextVal = Math.round(startVal + (endVal - startVal) * ease)

      setCurrent(nextVal)

      if (progress < 1) {
        frameId = requestAnimationFrame(step)
      } else {
        prevRef.current = endVal
        setCurrent(endVal)
      }
    }

    frameId = requestAnimationFrame(step)
    return () => {
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [value, duration])

  if (value === null || value === undefined) {
    return <span className={className}>—</span>
  }

  return (
    <span className={`tabular-nums transition-transform ${className}`}>
      {current.toLocaleString()}
    </span>
  )
}
