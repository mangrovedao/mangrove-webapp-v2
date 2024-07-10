import useMarket from "@/providers/market.new"
import React from "react"

export default function useScrollToMiddle() {
  const { currentMarket } = useMarket()
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)
  const bodyRef = React.useRef<HTMLTableSectionElement>(null)
  const spreadRef = React.useRef<HTMLTableRowElement>(null)
  const userScrolled = React.useRef(false)

  // Enable auto scroll on market change
  React.useEffect(() => {
    userScrolled.current = false
  }, [currentMarket?.base.address, currentMarket?.quote.address])

  // Disable auto scroll on user scroll
  React.useEffect(() => {
    if (!scrollAreaRef.current) return
    const handleScroll = () => {
      userScrolled.current = true
    }
    scrollAreaRef.current?.addEventListener("wheel", handleScroll)
    return () =>
      scrollAreaRef.current?.removeEventListener("wheel", handleScroll)
  }, [scrollAreaRef.current])

  React.useEffect(() => {
    if (!scrollAreaRef.current || !bodyRef.current || userScrolled.current)
      return
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
