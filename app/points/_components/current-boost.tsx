import { cn } from "@/utils"
import BoxContainer from "./box-container"

type Props = {
  className?: string
}

export default function CurrentBoost({ className }: Props) {
  return (
    <BoxContainer className={cn(className)}>
      <div className="flex space-x-4">
        <div className="rounded-lg p-[10px] aspect-square h-12 flex items-center justify-center bg-primary-dark-green">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
          >
            <path
              stroke="#AACBC4"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M12 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
            />
            <path
              stroke="#AACBC4"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"
            />
          </svg>
        </div>
        <div>
          <div className="text-sm text-cloud-200">Current boost</div>
          <div className="flex items-center">
            <span className="font-medium text-[32px]">5%</span>
            <span className="ml-3 max-h-[24px] text-primary-bush-green p-1.5 bg-green-caribbean text-sm rounded-md flex items-center">
              Level 2
            </span>
          </div>
          <div className="text-xs text-cloud-200 flex items-center pt-7">
            previous volume $15,400
          </div>
        </div>
      </div>
    </BoxContainer>
  )
}
