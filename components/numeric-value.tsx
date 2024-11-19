import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function NumericValue({ value }: { value: string }) {
  const numericValue = Number(value)
  const shouldShowApprox = numericValue <= 0.0001 && Number(value) !== 0
  const displayValue = Number(value) > 0.0001 ? numericValue.toFixed(3) : "0"

  return (
    <>
      {shouldShowApprox ? "~ " : ""}
      <Tooltip>
        <TooltipTrigger>{displayValue}</TooltipTrigger>
        <TooltipContent>{value}</TooltipContent>
      </Tooltip>
    </>
  )
}
