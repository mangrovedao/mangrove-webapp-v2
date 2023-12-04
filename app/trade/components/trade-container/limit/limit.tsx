import type { Token } from "@mangrovedao/mangrove.js"
import { LucideChevronRight } from "lucide-react"
import React from "react"

import {
  CustomRadioGroup,
  CustomRadioGroupItem,
} from "@/components/stateless/custom-radio-group"
import {
  NumericInput,
  type NumericInputProps,
} from "@/components/stateless/numeric-input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import useMarket from "@/providers/market"
import { TokenBalance } from "../components/token-balance"

enum TradeAction {
  SEND = "Send",
  RECEIVE = "Receive",
}

export function Limit() {
  const { selectedMarket } = useMarket()
  const base = selectedMarket?.base
  const quote = selectedMarket?.quote

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const action = formData.get("tradeAction")
    const limitprice = formData.get("limit-price")
    const send = formData.get("send")
    const receive = formData.get("receive")

    console.log({
      formData,
      action,
      limitprice,
      send,
      receive,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <CustomRadioGroup defaultValue={TradeAction.SEND} name="tradeAction">
        {Object.values(TradeAction).map((action) => (
          <CustomRadioGroupItem
            key={action}
            value={action}
            id={action}
            variant={action === TradeAction.RECEIVE ? "secondary" : "primary"}
          >
            {action}
          </CustomRadioGroupItem>
        ))}
      </CustomRadioGroup>
      <div className="space-y-4 !mt-6">
        <TradeInput token={quote} label="Limit price" name={"limit-price"} />
        <TradeInput
          token={base}
          label="Send amount"
          name={"send"}
          showBalance
        />
        <TradeInput
          token={quote}
          label="Receive amount"
          name={"receive"}
          showBalance
        />

        <Button
          className="w-full flex items-center justify-center !mb-4"
          size={"lg"}
          type="submit"
        >
          Buy
          <div className="ml-2 bg-white h-6 w-6 rounded-full text-secondary flex items-center justify-center">
            <LucideChevronRight className="h-4 text-current" />
          </div>
        </Button>
      </div>
    </form>
  )
}

type TradeInputProps = {
  token?: Token
  disabled?: boolean
  label: string
  showBalance?: boolean
} & NumericInputProps

const TradeInput = React.forwardRef<HTMLInputElement, TradeInputProps>(
  ({ label, token, showBalance = false, ...inputProps }, ref) => {
    return (
      <div className="flex-col flex">
        <Label>{label}</Label>
        <NumericInput
          {...inputProps}
          ref={ref}
          icon={token?.symbol}
          symbol={token?.symbol}
        />
        {showBalance && <TokenBalance token={token} />}
      </div>
    )
  },
)

TradeInput.displayName = "TradeInput"
