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

export function Closed(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 20 20"
      {...props}
    >
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.25"
        clipPath="url(#aaas)"
      >
        <path d="M10 15.556a5.556 5.556 0 100-11.111 5.556 5.556 0 000 11.11zM6.072 6.072l7.856 7.856"></path>
      </g>
      <defs>
        <clipPath id="aaas">
          <path fill="#fff" d="M3.333 3.333h13.333v13.333H3.333z"></path>
        </clipPath>
      </defs>
    </svg>
  )
}

export function ExclamationMark(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="52"
      height="52"
      fill="none"
      viewBox="0 0 52 52"
      {...props}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        d="M23.36 10.582L9.44 33.82a3.287 3.287 0 002.81 4.93h27.84a3.286 3.286 0 002.81-4.93L28.98 10.582a3.287 3.287 0 00-5.62 0zM26.17 19.03v6.573M26.17 32.177h.017"
      ></path>
    </svg>
  )
}

export function Check(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="52"
      height="52"
      fill="none"
      viewBox="0 0 52 52"
      {...props}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        d="M40.875 15.375L20.422 35.208l-9.297-9.015"
      ></path>
    </svg>
  )
}

export function Info(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 36 35"
      {...props}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        d="M18 31.962c7.988 0 14.463-6.475 14.463-14.462S25.988 3.038 18 3.038 3.539 9.513 3.539 17.5s6.475 14.462 14.462 14.462z"
      ></path>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3.188"
        d="M18 23.285V17.5m0-5.785h.017"
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

export function TooltipInfo(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      {...props}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M12 18.805a6.806 6.806 0 100-13.61 6.806 6.806 0 000 13.61zm0-4.083V12m0-2.722h.008"
      ></path>
    </svg>
  )
}
