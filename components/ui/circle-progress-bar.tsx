import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip"

type Props = {
  progress: number
  size?: number
  strokeWidth?: number
} & React.ComponentProps<"svg">

export const CircularProgressBar = ({
  progress,
  size = 20,
  strokeWidth = 6,
  className,
  ...props
}: Props) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger>
          <svg
            width={size}
            height={size}
            {...props}
            className={className}
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <circle
              className="stroke-primary-dark-green"
              strokeWidth={strokeWidth}
              fill="transparent"
              r={radius}
              cx={size / 2}
              cy={size / 2}
            />
            <circle
              className="stroke-green-caribbean"
              strokeWidth={strokeWidth}
              fill="transparent"
              r={radius}
              cx={size / 2}
              cy={size / 2}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`} // Rotate to start from top
            />
          </svg>
        </TooltipTrigger>
        <TooltipContent>{progress}%</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
