import { useEffect, useRef } from "react"

/**
 * Props for the FlowingNumbers component
 */
type FlowingNumbersProps = {
  /** Initial value to start from */
  initialValue: number
  /** Rate of increase per second */
  ratePerSecond: number
  /** Number of decimal places to show */
  decimals?: number
  /** Optional className for styling */
  className?: string
  /** Optional timestamp to start counting from (in seconds) */
  startTimestamp?: number
}

/**
 * Component that displays a number that continuously updates based on a rate of change per second
 *
 * @param initialValue - Starting value to display
 * @param ratePerSecond - Rate at which the number should increase per second
 * @param decimals - Number of decimal places to display (default: 6)
 * @param className - Optional CSS class name
 * @param startTimestamp - Optional timestamp to start counting from (default: current time)
 * @returns A div element displaying the continuously updating number
 */
export const FlowingNumbers = ({
  initialValue,
  ratePerSecond,
  decimals = 6,
  className = "",
  startTimestamp = Date.now() / 1000,
}: FlowingNumbersProps) => {
  const animationFrameRef = useRef<number>()
  const displayRef = useRef<HTMLDivElement>(null)
  const currentValueRef = useRef<number>(initialValue)

  useEffect(() => {
    const updateNumber = () => {
      const currentTime = Date.now() / 1000
      const timeElapsed = currentTime - startTimestamp
      const newValue = initialValue + ratePerSecond * timeElapsed

      currentValueRef.current = newValue

      if (displayRef.current) {
        displayRef.current.textContent = newValue.toFixed(decimals)
      }

      animationFrameRef.current = requestAnimationFrame(updateNumber)
    }

    animationFrameRef.current = requestAnimationFrame(updateNumber)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [initialValue, ratePerSecond, decimals, startTimestamp])

  return (
    <div ref={displayRef} className={className}>
      {currentValueRef.current.toFixed(
        currentValueRef.current > 0 ? decimals : 2,
      )}{" "}
    </div>
  )
}
