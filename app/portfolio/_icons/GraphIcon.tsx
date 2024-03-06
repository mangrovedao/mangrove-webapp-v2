import { SVGProps } from "react"

const GraphIcon = (props: SVGProps<SVGSVGElement>) => (
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
      d="M5.8 14v3m4.333-6v6m4.334-9v9M18.8 5v12"
    />
  </svg>
)
export default GraphIcon
