import { cn } from "@/utils"
import BoxContainer from "./box-container"

type Props = {
  className?: string
  rank?: number
  totalTraders?: number
}

export default function Rank({
  className,
  rank = 103,
  totalTraders = 39059,
}: Props) {
  return (
    <BoxContainer className={cn(className)}>
      <div className="flex space-x-4">
        <div className="rounded-lg p-[10px] aspect-square h-12 flex items-center justify-center bg-primary-dark-green">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 32 32"
          >
            <path
              stroke="#AACBC4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M18.726 14.472l3.666-8.304m-8.54 8.488L9.609 6.168m7.633 7.914L13.38 6.168m5.432 0L17.79 8.626m-7.198 11.309a5.9 5.9 0 1011.8 0 5.9 5.9 0 00-11.8 0z"
            ></path>
          </svg>
        </div>
        <div>
          <div className="text-sm text-cloud-200">Rank</div>
          <div className="flex items-center">
            <span
              className={cn("font-medium text-[32px]", {
                "text-cloud-00": !rank,
              })}
            >
              {rank}
            </span>
          </div>
          <div className="text-xs text-cloud-200 flex items-center pt-7">
            of {totalTraders} traders
          </div>
        </div>
      </div>
    </BoxContainer>
  )
}
