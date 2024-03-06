import { SVGProps } from "react"

const TransactionIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={14}
    fill="none"
    {...props}
  >
    <path
      stroke="#AACBC4"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M4.08 2.286V12.5M.938 4.643 4.08 1.5l3.143 3.143M11.92 11.714V1.5M15.063 9.357 11.92 12.5 8.777 9.357"
    />
  </svg>
)

export default TransactionIcon
