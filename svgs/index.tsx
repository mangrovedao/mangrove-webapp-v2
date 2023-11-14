import React from "react"

export function ChevronDown(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 10 6"
      {...props}
    >
      <path
        fill="currentColor"
        d="M5 3.712L8.714 0l1.06 1.06-4.772 4.774L.228 1.06 1.288 0l3.713 3.712z"
      ></path>
    </svg>
  )
}

export function Bell(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      {...props}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M4 5.333a4 4 0 018 0c0 4.667 2 6 2 6H2s2-1.333 2-6zM6.867 14a1.293 1.293 0 002.266 0"
      ></path>
    </svg>
  )
}
