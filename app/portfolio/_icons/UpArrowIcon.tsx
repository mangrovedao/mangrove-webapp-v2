import { SVGProps } from "react"

const UpArrowIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={10}
    height={5}
    fill="none"
    {...props}
  >
    <g clipPath="url(#a)">
      <path
        fill="#00DF81"
        d="M2.584.628a.5.5 0 0 1 .831 0l2.398 3.595A.5.5 0 0 1 5.397 5H.602a.5.5 0 0 1-.416-.777L2.584.628Z"
      />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M6 5H0V0h6z" />
      </clipPath>
    </defs>
  </svg>
)
export default UpArrowIcon
