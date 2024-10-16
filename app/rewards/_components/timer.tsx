import { cn } from "@/utils"

export default function Timer({
  count = 4,
  duration = 10,
}: {
  count?: number
  duration?: number
}) {
  const degrees = (count / duration) * 360
  const isSecondHalf = count / duration > 0.5

  return (
    <div className="relative h-[52px] w-[52px] rounded-full bg-bg-tertiary">
      <div
        style={{ transform: `rotate(${degrees}deg)` }}
        className="absolute h-full w-1/2 bg-text-brand rounded-l-full origin-right transition-transform ease-linear"
      />
      <div
        className={cn("absolute h-full w-1/2 ", {
          "rounded-r-full bg-text-brand right-0": isSecondHalf,
          "bg-bg-tertiary rounded-l-full": !isSecondHalf,
        })}
      />
    </div>
  )
}
