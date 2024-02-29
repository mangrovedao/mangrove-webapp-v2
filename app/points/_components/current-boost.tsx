import { cn } from "@/utils"
import { formatNumber } from "../utils"
import BoxContainer from "./box-container"

type Props = {
  className?: string
  level?: number
  boost?: number
  previousVolume?: number
}

export default function CurrentBoost({
  className,
  level = 0,
  boost = 1,
  previousVolume = 0,
}: Props) {
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
            <span
              className={cn("font-medium text-[32px]", {
                "text-cloud-00": !boost,
              })}
            >
              {boost}x
            </span>
            <span
              className={cn(
                "ml-3 max-h-[24px] p-1.5 bg-green-caribbean text-sm rounded-md flex items-center",
                !level ? "bg-cloud-300" : "text-primary-bush-green",
              )}
            >
              Level {level}
            </span>
          </div>
          <div className="text-xs text-cloud-200 flex items-center pt-7">
            previous volume {formatNumber(previousVolume)}
          </div>
        </div>
      </div>
    </BoxContainer>
  )
}
