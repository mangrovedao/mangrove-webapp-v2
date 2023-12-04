/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { Token } from "@mangrovedao/mangrove.js"
import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import { LucideChevronRight } from "lucide-react"
import React from "react"
import { z } from "zod"

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
import { useTokenBalance } from "@/hooks/use-token-balance"
import useMangrove from "@/providers/mangrove"
import useMarket from "@/providers/market"
import { cn } from "@/utils"
import Big from "big.js"
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
    validator: zodValidator,

    defaultValues: {
      tradeAction: TradeAction.SEND,
      limitPrice: "",
      send: "",
      receive: "",
    },
    onSubmit: async ({ tradeAction, send, receive, limitPrice }) => {
      if (!selectedMarket) return
      console.log(tradeAction, send, receive, limitPrice)
      try {
        // DOUBLE Approval for limit order's explanation:
        /** limit orders first calls take() on the underlying contract which consumes the given amount of allowance,
        then if it posts an offer, then it transfers the tokens back to the wallet, and the offer then consumes up to the given amount of allowance 
        */
        const spender = await mangrove?.orderContract.router()
        if (!spender) return

        const { baseQuoteToSendReceive } =
          TRADEMODE_AND_ACTION_PRESENTATION.limit[tradeAction]
        const [sendToken] = baseQuoteToSendReceive(
          selectedMarket.base,
          selectedMarket.quote,
        )
        await sendToken.increaseApproval(spender, send)
        await selectedMarket?.buy({
          gives: send,
          wants: receive,
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
  // const { formattedWithSymbol, formatted, isFetching } = useTokenBalance(quote)
  const [sendToken, receiveToken] =
    tradeAction === TradeAction.RECEIVE ? [quote, base] : [base, quote]
  const sendTokenBalance = useTokenBalance(sendToken)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    e.stopPropagation()
    void form.handleSubmit()
  }

  const hasSufficientBalanceValidator = (
    tokenBalance: ReturnType<typeof useTokenBalance>,
  ) =>
    z.string().superRefine((val, ctx) => {
      if (Big(Number(val)).gt(Number(tokenBalance?.formatted))) {
        ctx.addIssue({
          code: "custom",
          message: "Insufficient balance",
          params: {
            val,
          },
        })
      }
    })

  function setFieldValue(
    field: unknown,
    value: string,
    params: Parameters<typeof form.setFieldValue>,
  ) {
    // @ts-expect-error
    field.handleChange(value)
    form.setFieldValue(...params)
    form.validateAllFields("change")
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
          <form.Subscribe selector={(state) => [state.values.send]}>
            {([send]) => (
              <form.Field name="limitPrice">
                {(field) => (
                  <TradeInput
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      const val = Big(Number(send ?? 0))
                        .mul(Number(e.target.value ?? 0))
                        .toString()
                      setFieldValue(field, e.target.value, ["receive", val])
                    }}
                    token={quote}
                    label="Limit price"
                    disabled={!selectedMarket}
                  />
                )}
              </form.Field>
            )}
          </form.Subscribe>

          <form.Subscribe selector={(state) => [state.values.limitPrice]}>
            {([limitPrice]) => (
              <>
                <form.Field
                  name="send"
                  onChange={hasSufficientBalanceValidator(sendTokenBalance)}
                >
                  {(field) => (
                    <TradeInput
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        const val = Big(Number(limitPrice ?? 0))
                          .mul(Number(e.target.value ?? 0))
                          .toString()

                        setFieldValue(field, e.target.value, ["receive", val])
                      }}
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
                      onChange={(e) => {
                        const val = Big(Number(limitPrice ?? 0))
                          .mul(Number(e.target.value ?? 0))
                          .toString()
                        setFieldValue(field, e.target.value, ["send", val])
                      }}
                      token={receiveToken}
                      label="Receive amount"
                      disabled={!(selectedMarket && form.state.isFormValid)}
                      showBalance
                    />
                  )}
                </form.Field>
              </>
            )}
          </form.Subscribe>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                className="w-full flex items-center justify-center !mb-4 capitalize"
                size={"lg"}
                type="submit"
                disabled={!canSubmit}
              >
                {isSubmitting ? "Processing..." : tradeAction}
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
            )}
          </form.Subscribe>
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
