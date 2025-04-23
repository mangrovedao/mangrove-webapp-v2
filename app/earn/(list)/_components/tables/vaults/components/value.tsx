import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/utils"
import { CheckIcon } from "lucide-react"

type Props = {
  value: string | number
  trusted?: boolean
  symbol?: string
  className?: string
}
export function Value({ value, trusted, symbol, className }: Props) {
  if (!value) {
    return <Skeleton className="h-6 w-full" />
  }

  if (symbol) {
    console.log(value, "val")
  }

  return (
    <div
      className={cn(
        "flex items-center",
        symbol === "$" ? "justify-end" : "space-x-3",
        className,
      )}
    >
      {trusted ? (
        <div className="relative h-4 w-4 ml-3">
          <div className="absolute inset-0 bg-bg-tertiary rounded-full"></div>
          <CheckIcon className="absolute inset-0 h-3 w-3 m-auto text-white" />
        </div>
      ) : undefined}
      <span className="text-sm whitespace-nowrap">
        {value}{" "}
        {symbol === "$" ? (
          <span className="text-text-tertiary">$</span>
        ) : undefined}
        {symbol && symbol !== "$" ? (
          <span className="text-text-secondary">{symbol}</span>
        ) : undefined}
      </span>
    </div>
  )
}
