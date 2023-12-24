"use client"
import { useSearchParams } from "next/navigation"
import { type Address } from "viem"

import { TokenInput } from "@/components/token-input"
import { Skeleton } from "@/components/ui/skeleton"
import { useTokenFromId } from "@/hooks/use-token-from-id"
import { cn } from "@/utils"
import { Fieldset } from "../fieldset"

export function Form({ className }: { className?: string }) {
  const searchParams = useSearchParams()
  const market = searchParams.get("market")
  const [baseId, quoteId] = market?.split(",") ?? []
  const { data: baseToken } = useTokenFromId(baseId as Address)
  const { data: quoteToken } = useTokenFromId(quoteId as Address)

  if (!baseToken || !quoteToken)
    return <Skeleton className="w-full h-[312px]" />

  return (
    <form className={cn("space-y-6", className)}>
      <Fieldset className="space-y-4" legend="Set initial inventory">
        <TokenInput
          // name={field.name}
          // value={field.state.value}
          // onBlur={field.handleBlur}
          // onChange={({ target: { value } }) => {
          //   field.handleChange(value)
          //   computeReceiveAmount()
          // }}
          token={baseToken}
          label={`${baseToken?.symbol} deposit`}
          // disabled={!market}
          showBalance
          // error={field.state.meta.touchedErrors}
        />
        <TokenInput
          // name={field.name}
          // value={field.state.value}
          // onBlur={field.handleBlur}
          // onChange={({ target: { value } }) => {
          //   field.handleChange(value)
          //   computeReceiveAmount()
          // }}
          token={quoteToken}
          label={`${quoteToken?.symbol} deposit`}
          // disabled={!market}
          showBalance
          // error={field.state.meta.touchedErrors}
        />
      </Fieldset>

      <Fieldset legend="Settings">
        <TokenInput label="Number of price points" />
        <TokenInput label="Ratio" />
        <TokenInput label="Step size" />
      </Fieldset>
    </form>
  )
}
