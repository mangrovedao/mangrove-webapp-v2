import { Caption } from "@/components/typography/caption"
import { Title } from "@/components/typography/title"

export default function UnrealizedPnl() {
  return (
    <div className="flex items-end space-x-2">
      <span className="bg-black-rich rounded-lg p-1 w-8 h-8 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 17 14"
          width={14}
        >
          <path
            stroke="#AACBC4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M4.58 2.286V12.5M1.438 4.643L4.58 1.5l3.143 3.143m4.697 7.071V1.5m3.143 7.857L12.42 12.5 9.277 9.357"
          ></path>
        </svg>
      </span>
      <span className="flex flex-col space-y-2">
        <Caption
          variant={"caption1"}
          className="text-cloud-300 flex items-center"
        >
          Unrealized PnL
        </Caption>
        <Title variant={"title1"}>{"-"}</Title>
      </span>
    </div>
  )
}
