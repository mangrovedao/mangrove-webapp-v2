import React from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatDate, formatExpiryDate, hasExpired } from "@/utils/date"

export function Timer({ expiry }: { expiry: string }) {
  const [timeleft, setTimeleft] = React.useState(formatExpiryDate(expiry))
  const expired = hasExpired(expiry)

  const computeTimeLeft = React.useCallback(() => {
    setTimeleft(formatExpiryDate(expiry))
  }, [expiry])

  React.useEffect(() => {
    if (expired) return
    const interval = setInterval(() => computeTimeLeft(), 1000)

    return () => clearInterval(interval)
  }, [computeTimeLeft, expired])
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger>
          <div className="inline-flex space-x-1">
            <span>{expired ? "expired" : timeleft}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>{formatDate(expiry)}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
