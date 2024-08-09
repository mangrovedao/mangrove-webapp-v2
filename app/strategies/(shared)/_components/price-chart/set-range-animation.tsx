/* eslint-disable @typescript-eslint/no-explicit-any */
import { useGSAP } from "@gsap/react"
import { gsap } from "gsap"
import { MousePointer, MousePointerClick } from "lucide-react"
import React from "react"

export function SetRangeAnimation() {
  const pointerRef = React.useRef(null)
  const clickRef = React.useRef(null)
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  useGSAP(
    () => {
      if (!containerRef.current) return
      gsap
        .timeline({
          repeat: -1,
        })
        .from(clickRef.current, {
          display: "none",
        })
        .from(
          pointerRef.current,
          {
            opacity: 0,
          },
          "<",
        )
        .to(
          pointerRef.current,
          {
            opacity: 1,
          },
          "<",
        )
        .to(
          pointerRef.current,
          {
            display: "none",
          },
          "<",
        )
        .to(clickRef.current, {
          display: "block",
          opacity: 1,
        })
        .to(
          clickRef.current,
          {
            x: containerRef.current?.offsetWidth / 2,
            duration: 2.5,
            delay: 0.3,
            ease: "Expo.out",
          },
          "<",
        )
        .to(clickRef.current, {
          delay: 0.3,
          opacity: 0,
        })
        .play()
    },
    {
      scope: containerRef,
    },
  )

  return (
    <div className="cursor-animation" ref={containerRef}>
      <MousePointer ref={pointerRef} />
      <MousePointerClick ref={clickRef} className="hidden" />
    </div>
  )
}
