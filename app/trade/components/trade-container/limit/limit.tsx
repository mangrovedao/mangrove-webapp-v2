/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { Token } from "@mangrovedao/mangrove.js"
import { useForm } from "@tanstack/react-form"
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
import useMangrove from "@/providers/mangrove"
import useMarket from "@/providers/market"
import { cn } from "@/utils"
import { TokenBalance } from "../components/token-balance"

enum TradeMode {
  LIMIT = "limit",
  MARKET = "market",
}

enum TradeAction {
  SEND = "send",
  RECEIVE = "receive",
}

const DEFAULT_VALUES = {
  tradeAction: "147",
  limitPrice: "1234",
  send: "41",
  receive: "78",
}

export type TradeModeValue = `${TradeMode}`
export type TradeActionValue = `${TradeAction}`

export type TradeModeAndActionPresentation = {
  [key in TradeModeValue]: {
    [key in TradeActionValue]: {
      baseQuoteToSendReceive: <T>(base: T, quote: T) => [T, T]
      baseQuoteToApproveToken: <T>(base: T, quote: T) => T
      sendReceiveToBaseQuote: <T>(send: T, receive: T) => [T, T]
    }
  }
}

// @ts-expect-error
const TRADEMODE_AND_ACTION_PRESENTATION: TradeModeAndActionPresentation = {
  limit: {
    send: {
      baseQuoteToSendReceive: (base, quote) => [base, quote],
      baseQuoteToApproveToken: (base, _) => base,
      sendReceiveToBaseQuote: (send, receive) => [send, receive],
    },
    receive: {
      baseQuoteToSendReceive: (base, quote) => [quote, base],
      baseQuoteToApproveToken: (_, quote) => quote,
      sendReceiveToBaseQuote: (send, receive) => [receive, send],
    },
  },
}

export function Limit() {
  const { mangrove } = useMangrove()
  const { selectedMarket } = useMarket()
  const form = useForm({
    defaultValues: {
      tradeAction: TradeAction.SEND,
      limitPrice: "",
      send: "",
      receive: "",
    },
    onSubmit: async (values) => {
      if (!selectedMarket) return
      // Do something with form data
      console.log(values)
      try {
        // DOUBLE Approval for limit order's explanation:
        /** limit orders first calls take() on the underlying contract which consumes the given amount of allowance,
        then if it posts an offer, then it transfers the tokens back to the wallet, and the offer then consumes up to the given amount of allowance 
        */
        const spender = await mangrove?.orderContract.router()
        if (!spender) return

        const { baseQuoteToSendReceive } =
          TRADEMODE_AND_ACTION_PRESENTATION.limit[values.tradeAction]
        const [sendToken] = baseQuoteToSendReceive(
          selectedMarket.base,
          selectedMarket.quote,
        )
        await sendToken.increaseApproval(spender, values.send)
        await selectedMarket?.buy({
          gives: values.send,
          wants: values.receive,
        })
        form.reset()
      } catch (e) {
        console.error(e)
      }
    },
  })
  const tradeAction = form.useStore((state) => state.values.tradeAction)
  const base = selectedMarket?.base
  const quote = selectedMarket?.quote
  const [sendToken, receiveToken] =
    tradeAction === TradeAction.RECEIVE ? [quote, base] : [base, quote]

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    e.stopPropagation()
    void form.handleSubmit()
  }

  return (
    <form.Provider>
      <form onSubmit={handleSubmit} autoComplete="off">
        <form.Field name="tradeAction">
          {(field) => (
            <CustomRadioGroup
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onValueChange={(e: TradeAction) => field.handleChange(e)}
            >
              {Object.values(TradeAction).map((action) => (
                <CustomRadioGroupItem
                  key={action}
                  value={action}
                  id={action}
                  variant={
                    action === TradeAction.RECEIVE ? "secondary" : "primary"
                  }
                  className="capitalize"
                >
                  {action}
                </CustomRadioGroupItem>
              ))}
            </CustomRadioGroup>
          )}
        </form.Field>
        <div className="space-y-4 !mt-6">
          <form.Field name="limitPrice">
            {(field) => (
              <TradeInput
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                token={quote}
                label="Limit price"
                disabled={!selectedMarket}
              />
            )}
          </form.Field>
          <form.Field name="send">
            {(field) => (
              <TradeInput
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                token={sendToken}
                label="Send amount"
                disabled={!selectedMarket}
                showBalance
              />
            )}
          </form.Field>
          <form.Field name="receive">
            {(field) => (
              <TradeInput
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                token={receiveToken}
                label="Receive amount"
                disabled={!selectedMarket}
                showBalance
              />
            )}
          </form.Field>

          <Button
            className="w-full flex items-center justify-center !mb-4"
            size={"lg"}
            type="submit"
            disabled={!selectedMarket}
          >
            {tradeAction}
            <div
              className={cn(
                "ml-2 bg-white h-6 w-6 rounded-full text-secondary flex items-center justify-center transition-opacity",
                {
                  "opacity-10": !selectedMarket,
                },
              )}
            >
              <LucideChevronRight className="h-4 text-current" />
            </div>
          </Button>
        </div>
      </form>
    </form.Provider>
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
