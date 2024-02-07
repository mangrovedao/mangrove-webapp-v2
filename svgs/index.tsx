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

export function MangroveLogo(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      fill="none"
      {...props}
    >
      <rect width="48" height="48" fill="#00DF81" rx="24"></rect>
      <path
        fill="#010D0D"
        d="M35.399 23.039c-1.73 0-3.31.676-4.577 1.806a11.31 11.31 0 00-3.345-1.709 6.036 6.036 0 001.73-1.886c1.8-.034 3.507-.654 4.797-1.932 1.58-1.565 2.17-3.756 1.893-5.98a8.4 8.4 0 00-1.077-.063c-1.863 0-3.628.619-4.959 1.938-1.33 1.318-1.955 3.073-1.955 4.92a4.37 4.37 0 01-3.061 2.367v-4.134c1.296-1.301 2.089-2.97 2.089-4.81 0-2.213-1.14-4.18-2.928-5.556-1.788 1.37-2.928 3.337-2.928 5.556 0 1.84.793 3.514 2.083 4.81v4.157a4.396 4.396 0 01-3.165-2.368c0-1.852-.62-3.618-1.956-4.937-1.33-1.318-3.095-1.938-4.959-1.938a8.59 8.59 0 00-1.076.064c-.283 2.224.307 4.414 1.892 5.98 1.285 1.272 2.986 1.892 4.785 1.932a5.967 5.967 0 001.765 1.91 11.28 11.28 0 00-3.263 1.679c-1.267-1.124-2.847-1.806-4.577-1.806-2.234 0-4.218 1.13-5.607 2.901 1.383 1.772 3.368 2.901 5.607 2.901 1.701 0 3.258-.653 4.513-1.748.046-.04.093-.087.139-.127a6.18 6.18 0 00.197-.189 9.65 9.65 0 015.7-2.465v3.75c-4.659.412-8.345 4.23-8.559 8.938h1.684c.174-3.813 3.125-6.852 6.88-7.259v7.219h1.684v-7.22c3.75.396 6.712 3.44 6.897 7.259h1.684c-.226-4.713-3.923-8.537-8.581-8.939v-3.744a9.673 9.673 0 015.705 2.472c.064.057.122.12.185.177.047.046.099.092.145.138 1.256 1.09 2.812 1.749 4.513 1.749 2.234 0 4.218-1.13 5.607-2.901-1.383-1.772-3.368-2.902-5.607-2.902l.006-.011zm-4.351-6.64c1.012-1.003 2.216-1.335 3.211-1.427-.11 1.25-.596 2.345-1.44 3.17-1.013 1.004-2.217 1.336-3.212 1.428.11-1.25.596-2.345 1.44-3.17zm-8.292-2.843c0-1.17.44-2.3 1.244-3.257.816.963 1.244 2.076 1.244 3.257 0 1.18-.44 2.299-1.244 3.256-.816-.963-1.244-2.087-1.244-3.256zm-7.673 4.586c-.844-.837-1.33-1.926-1.44-3.17.983.086 2.198.424 3.211 1.428.833.837 1.33 1.926 1.44 3.17-.983-.086-2.198-.424-3.21-1.428zm-2.482 9.03c-1.186 0-2.32-.435-3.287-1.232.973-.808 2.107-1.233 3.287-1.233 1.18 0 2.32.436 3.287 1.233-.972.808-2.095 1.233-3.287 1.233zm22.792 0c-1.186 0-2.32-.435-3.287-1.232.973-.808 2.107-1.233 3.287-1.233 1.18 0 2.32.436 3.287 1.233-.972.808-2.095 1.233-3.287 1.233z"
      ></path>
    </svg>
  )
}
