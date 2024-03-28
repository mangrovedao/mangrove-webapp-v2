import { SVGProps } from "react"

const PercentageIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={25}
    height={24}
    fill="none"
    {...props}
  >
    <path
      stroke="#AACBC4"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="m17.65 6.75-10.5 10.5M8.275 9.75a1.875 1.875 0 1 0 0-3.75 1.875 1.875 0 0 0 0 3.75ZM16.525 18a1.875 1.875 0 1 0 0-3.75 1.875 1.875 0 0 0 0 3.75Z"
    />
  </svg>
)

export default PercentageIcon
