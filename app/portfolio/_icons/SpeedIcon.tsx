import { SVGProps } from "react"

const SpeedIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={17}
    height={16}
    fill="none"
    {...props}
  >
    <g
      stroke="#AACBC4"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      clipPath="url(#a)"
    >
      <path d="m8.6 9.111 2.844-2.844M2.442 12.667a7.111 7.111 0 1 1 12.316 0" />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M.6 0h16v16H.6z" />
      </clipPath>
    </defs>
  </svg>
)
export default SpeedIcon
