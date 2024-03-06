import { SVGProps } from "react"

const DownArrowIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={10}
    height={5}
    fill="none"
    {...props}
  >
    <path
      fill="#FF5C5C"
      d="M3.416 4.372a.5.5 0 0 1-.832 0L.186.777A.5.5 0 0 1 .602 0h4.796a.5.5 0 0 1 .416.777L3.416 4.372Z"
    />
  </svg>
)
export default DownArrowIcon
