import useMarket from "@/providers/market"
import React, { useEffect } from "react"

export default function useScrollToMiddle() {
  const { currentMarket } = useMarket()
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)
  const bodyRef = React.useRef<HTMLTableSectionElement>(null)
  const spreadRef = React.useRef<HTMLDivElement>(null)
  const userScrolled = React.useRef(false)

  // Enable auto scroll on market change
  useEffect(() => {
    userScrolled.current = false

    // Add a small delay to ensure the DOM is updated
    const timer = setTimeout(() => {
      scrollToMiddle()
    }, 300)

    return () => clearTimeout(timer)
  }, [currentMarket?.base.address, currentMarket?.quote.address])

  // Function to scroll to the middle
  const scrollToMiddle = () => {
    if (!scrollAreaRef.current || !spreadRef.current || userScrolled.current)
      return

    try {
      // Find the scroll area viewport
      const scrollAreaElement = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      )
      if (!scrollAreaElement) {
        console.log("Could not find scroll area viewport")
        return
      }

      // Get the position of the spread element
      const spreadRect = spreadRef.current.getBoundingClientRect()
      const scrollAreaRect = scrollAreaElement.getBoundingClientRect()

      // Calculate the scroll position to center the spread
      const scrollElement = scrollAreaElement as HTMLElement
      const currentScrollTop = scrollElement.scrollTop
      const targetScrollTop =
        spreadRect.top -
        scrollAreaRect.top +
        currentScrollTop -
        scrollAreaRect.height / 2 +
        spreadRect.height / 2

      // Scroll smoothly
      scrollElement.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: "smooth",
      })

      console.log("Scrolled to middle:", {
        spreadTop: spreadRect.top,
        scrollAreaTop: scrollAreaRect.top,
        currentScrollTop,
        targetScrollTop,
        scrollAreaHeight: scrollAreaRect.height,
        spreadHeight: spreadRect.height,
      })
    } catch (error) {
      console.error("Error scrolling to middle:", error)
    }
  }

  // Add scroll event listener to detect user scrolling
  useEffect(() => {
    const scrollAreaElement = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    )
    if (!scrollAreaElement) return

    const handleScroll = () => {
      userScrolled.current = true
    }

    scrollAreaElement.addEventListener("wheel", handleScroll, { passive: true })
    scrollAreaElement.addEventListener("touchmove", handleScroll, {
      passive: true,
    })

    return () => {
      scrollAreaElement.removeEventListener("wheel", handleScroll)
      scrollAreaElement.removeEventListener("touchmove", handleScroll)
    }
  }, [scrollAreaRef.current])

  // Attempt to scroll to middle when component mounts
  useEffect(() => {
    const timer = setTimeout(scrollToMiddle, 500)
    return () => clearTimeout(timer)
  }, [])

  return {
    scrollAreaRef,
    bodyRef,
    spreadRef,
    scrollToMiddle,
  }
}
