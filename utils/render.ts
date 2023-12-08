import React from "react"

export function renderElement(
  elm: React.JSX.Element | (() => React.JSX.Element),
) {
  return typeof elm === "function" ? React.createElement(elm) : elm
}
