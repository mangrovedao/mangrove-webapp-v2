import React from "react"

export function useFocusOutlineOnlyForKeyboard() {
  React.useEffect(() => {
    const handleMouseDown = () => {
      document.body.classList.add("mouse-down")
    }

    const handleKeyDown = () => {
      document.body.classList.remove("mouse-down")
    }

    document.addEventListener("mousedown", handleMouseDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])
}
