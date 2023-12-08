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

export function ChevronRight(props: React.ComponentProps<"svg">) {
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
        d="M6.5 11l3-3-3-3"
      ></path>
    </svg>
  )
}

export function Pen(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.313"
        d="M14.333 6.75l2.917 2.917-7.583 7.583H6.75v-2.917l7.583-7.583z"
      ></path>
    </svg>
  )
}

export function Close(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M17 7L7 17M7 7l10 10"
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

export function VariationArrow(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 12 12"
      {...props}
    >
      <path
        fill="currentColor"
        d="M5.584 3.627a.5.5 0 01.832 0l2.398 3.596A.5.5 0 018.398 8H3.602a.5.5 0 01-.416-.777l2.398-3.595z"
      ></path>
    </svg>
  )
}
