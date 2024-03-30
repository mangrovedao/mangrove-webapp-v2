import InfoTooltip from "@/components/info-tooltip"
import { cn } from "@/utils"
import { getLevels } from "../constants"
import { Boosts } from "../schemas/boosts"
import { formatNumber } from "../utils"
import BoxContainer from "./box-container"

type Props = {
  className?: string
  level?: number
  volume?: number
  boost?: number
  boosts?: Boosts | null
}

function formatNFTName(name: string): string {
  return name
    .replace(/(?!^)([A-Z][a-z])/g, " $1") // Insert a space before each uppercase letter that is not at the start of the string and is not preceded by another uppercase letter
    .trim() // Remove any leading or trailing spaces
}

export default function CurrentBoost({
  className,
  // level = 0,
  boost = 1,
  volume = 0,
  boosts,
}: Props) {
  const { nextIndex, currentIndex } = getLevels(volume)
  const level = currentIndex

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
          <div className="flex items-center flex-wrap">
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
              Level {nextIndex}
            </span>

            {boosts?.map((b) => {
              if (b.type.toLowerCase() === "volume") return
              return (
                <span
                  className={cn(
                    "ml-3 max-h-[24px] p-1.5 bg-green-bangladesh text-sm rounded-md flex items-center line-clamp-1",
                  )}
                >
                  {formatNFTName(b.type)}
                  <InfoTooltip className="text-white">
                    You've received a {b.boost}x boost for holding the{" "}
                    {formatNFTName(b.type)}
                  </InfoTooltip>
                </span>
              )
            })}

            {/* {type ? (
              <span
                className={cn(
                  "ml-3 max-h-[24px] p-1.5 bg-green-bangladesh text-sm rounded-md flex items-center line-clamp-1",
                )}
              >
                {formatNFTName(type)}
                <InfoTooltip className="text-white">
                  You've received a {boost}x boost for holding the{" "}
                  {formatNFTName(type)}
                </InfoTooltip>
              </span>
            ) : undefined} */}
          </div>
          <div className="text-xs text-cloud-200 flex items-center pt-7">
            previous volume {formatNumber(volume)}
          </div>
        </div>
      </div>
    </BoxContainer>
  )
}
