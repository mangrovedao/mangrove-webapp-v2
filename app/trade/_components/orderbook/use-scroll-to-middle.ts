import React from "react"

export default function useScrollToMiddle() {
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)
  const bodyRef = React.useRef<HTMLTableSectionElement>(null)
  const spreadRef = React.useRef<HTMLTableRowElement>(null)

  React.useEffect(() => {
    if (!scrollAreaRef.current || !bodyRef.current) return
    const scrollAreaRect = scrollAreaRef.current.getBoundingClientRect()
    const scrollableViewport = scrollAreaRef.current.querySelector(
      "div[data-radix-scroll-area-viewport]",
    )

    if (!scrollableViewport) return
    const bodyRect = scrollAreaRef.current.getBoundingClientRect()
    const middle = scrollAreaRect.height / 2
    const targetElement = spreadRef.current

    if (!targetElement) return
    const targetRect = targetElement.getBoundingClientRect()
    const scrollPosition =
      targetRect.top -
      bodyRect.top +
      scrollableViewport.scrollTop -
      targetRect.height / 2 -
      middle

    if (scrollPosition < 0) return
    scrollableViewport.scrollTop = scrollPosition
  })

  return {
    scrollAreaRef,
    bodyRef,
    spreadRef,
  }
}
