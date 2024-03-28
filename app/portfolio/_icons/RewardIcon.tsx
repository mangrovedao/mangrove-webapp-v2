import { SVGProps } from "react"

const RewardIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={12}
    height={18}
    fill="none"
    {...props}
  >
    <path
      stroke="#AACBC4"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="m8.244 7.853 2.75-6.228M4.589 7.991 1.406 1.625M7.13 7.56 4.234 1.625m4.075 0-.767 1.844M2.144 11.95a4.425 4.425 0 1 0 8.85 0 4.425 4.425 0 0 0-8.85 0Z"
    />
  </svg>
)
export default RewardIcon
