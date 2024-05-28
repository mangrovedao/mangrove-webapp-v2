import React from "react"

export default function useScrollToRight() {
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!scrollAreaRef.current) return
    const scrollableViewport = scrollAreaRef.current.querySelector(
      "div[data-radix-scroll-area-viewport]",
    )

    if (!scrollableViewport) return
    const bodyRect = scrollAreaRef.current.getBoundingClientRect()

    const scrollPosition = bodyRect.right

    if (scrollPosition < 0) return
    scrollableViewport.scrollLeft = scrollPosition
  })

  return {
    scrollAreaRef,
  }
}
