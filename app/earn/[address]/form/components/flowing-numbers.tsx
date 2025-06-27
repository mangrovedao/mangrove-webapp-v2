import React from "react"

type FlowingNumberProps = {
  bias: number
  multipliers: {
    start: number
    multiplier: number
  }[]
}

export function FlowingNumber({ bias, multipliers }: FlowingNumberProps) {
  const ref = React.useRef<HTMLPreElement>(null)
  const animationFrameRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    if (multipliers.every((m) => m.multiplier === 0)) {
      ref.current!.textContent = bias.toFixed(5)
      return
    }
    const update = () => {
      if (!ref.current) return
      const now = Date.now() / 1000
      const value =
        bias +
        multipliers.reduce((acc, m) => acc + m.multiplier * (now - m.start), 0)
      ref.current.textContent = value.toFixed(5)
      animationFrameRef.current = requestAnimationFrame(update)
    }
    update()
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [bias, multipliers])

  return <pre ref={ref}></pre>
}
