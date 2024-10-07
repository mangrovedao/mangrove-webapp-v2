import React, { useRef, useState } from "react"

type WithMouseHoverEffectProps = {}

function withMouseHoverEffect<T extends WithMouseHoverEffectProps>(
  WrappedComponent: React.ComponentType<T>,
) {
  return (props: T) => {
    const [bgPosition, setBgPosition] = useState({ x: 0, y: 0 })
    const [isHovered, setIsHovered] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        setBgPosition({ x, y })
      }
    }

    const handleMouseEnter = () => {
      setIsHovered(true)
    }

    const handleMouseLeave = () => {
      setIsHovered(false)
    }

    const style = {
      position: "relative" as "relative",
    }

    const radialStyle = {
      content: '""',
      position: "absolute" as "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: `radial-gradient(circle at ${bgPosition.x}px ${bgPosition.y}px, #1C3A40 0%, #12272B 72.5%)`,
      opacity: isHovered ? 1 : 0,
      transition: "opacity 0.3s ease",
      pointerEvents: "none" as "none",
    }

    return (
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={style}
        className="rounded-xl overflow-hidden"
      >
        <div style={radialStyle}></div>
        <WrappedComponent {...props} />
      </div>
    )
  }
}

export default withMouseHoverEffect
