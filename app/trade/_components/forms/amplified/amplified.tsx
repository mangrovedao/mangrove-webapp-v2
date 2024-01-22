import React from "react"

import {
  CustomRadioGroup,
  CustomRadioGroupItem,
} from "@/components/custom-radio-group"
import { TokenBalance } from "@/components/stateful/token-balance/token-balance"
import { EnhancedNumericInput } from "@/components/token-input"
import { Caption } from "@/components/typography/caption"
import { Text } from "@/components/typography/text"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Accordion } from "../components/accordion"
import { MarketDetails } from "../components/market-details"
import { TradeAction } from "../enums"
import FromWalletLimitOrderDialog from "./components/from-wallet-order-dialog"
import { useAmplified } from "./hooks/use-amplified"
import type { Form } from "./types"
import { isGreaterThanZeroValidator } from "./validators"

const sliderValues = [25, 50, 75, 100]

export function Amplified() {
  const [formData, setFormData] = React.useState<Form>()
  const {
    sendTokenBalance,
    handleSubmit,
    form,
    quoteToken,
    market,
    sendToken,
    receiveToken,
    tickSize,
    feeInPercentageAsString,
    send,
  } = useAmplified({
    onSubmit: (formData) => setFormData(formData),
  })

  return (
    <div className="grid space-y-2">
      <Text className="text-muted-foreground text-xs" variant={"text2"}>
        Amplified order is a lorem ipsum dolor sit amet consectetur adipiscing
        elit.
      </Text>
      <form.Provider>
        <form onSubmit={handleSubmit} autoComplete="off">
          <form.Field name="tradeAction">
            {(field) => (
              <CustomRadioGroup
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onValueChange={(e: TradeAction) => {
                  field.handleChange(e)
                }}
              >
                {Object.values(TradeAction).map((action) => (
                  <CustomRadioGroupItem
                    key={action}
                    value={action}
                    id={action}
                    variant={
                      action === TradeAction.SELL ? "secondary" : "primary"
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
            <Title variant={"title2"}> Liquidity sourcing</Title>

            <form.Field name="sendSource">
              {(field) => (
                <Select
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(value: string) => {
                    field.handleChange(value)
                  }}
                  disabled={!market}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Send from" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {["wallet1", "wallet2"].map((source) => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            </form.Field>
            <div className="flex space-x-2">
              <form.Field
                name="sendBalance"
                onChange={isGreaterThanZeroValidator}
              >
                {(field) => (
                  <EnhancedNumericInput
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      field.handleChange(e.target.value)
                    }}
                    // label="Send"
                    disabled={!market}
                    error={field.state.meta.errors}
                  />
                )}
              </form.Field>

              <form.Field name="sendBalance">
                {(field) => (
                  <Select
                    name={field.name}
                    value={field.state.value}
                    onValueChange={(value: string) => {
                      field.handleChange(value)
                    }}
                    disabled={!market}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Send from" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {["wallet1", "wallet2"].map((source) => (
                          <SelectItem key={source} value={source}>
                            {source}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              </form.Field>
            </div>

            <div />
            <Caption variant={"caption1"} as={"label"}>
              Buy (Asset 1)
            </Caption>
            <div className="flex justify-between space-x-1">
              <form.Field
                name="buyAmount"
                onChange={isGreaterThanZeroValidator}
              >
                {(field) => (
                  <EnhancedNumericInput
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={({ target: { value } }) => {
                      field.handleChange(value)
                    }}
                    token={receiveToken}
                    disabled={!(market && form.state.isFormValid)}
                    error={field.state.meta.touchedErrors}
                  />
                )}
              </form.Field>

              <form.Field
                name="buyToken"
                // onChange={sendValidator(Number(sendTokenBalance.formatted ?? 0))}
              >
                {(field) => (
                  <Select
                    name={field.name}
                    value={field.state.value}
                    onValueChange={(value: string) => {
                      field.handleChange(value)
                    }}
                    disabled={!market}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {["wallet1", "wallet2"].map((source) => (
                          <SelectItem key={source} value={source}>
                            {source}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              </form.Field>
            </div>
            <TokenBalance token={receiveToken} label={"Balance"} />

            <form.Field name="limitPrice" onChange={isGreaterThanZeroValidator}>
              {(field) => (
                <EnhancedNumericInput
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={({ target: { value } }) => {
                    field.handleChange(value)
                  }}
                  token={receiveToken}
                  label="Limit price"
                  disabled={!(market && form.state.isFormValid)}
                  error={field.state.meta.touchedErrors}
                  showBalance
                />
              )}
            </form.Field>

            <form.Field name="receiveTo">
              {(field) => (
                <Select
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(value: string) => {
                    field.handleChange(value)
                  }}
                  disabled={!market}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {["wallet1", "wallet2"].map((source) => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            </form.Field>

            <Caption variant={"caption1"} as={"label"}>
              Buy
            </Caption>
            <div className="flex justify-between space-x-2">
              <form.Field
                name="buyAmount"
                onChange={isGreaterThanZeroValidator}
              >
                {(field) => (
                  <EnhancedNumericInput
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={({ target: { value } }) => {
                      field.handleChange(value)
                    }}
                    token={quoteToken}
                    disabled={!(market && form.state.isFormValid)}
                    error={field.state.meta.touchedErrors}
                  />
                )}
              </form.Field>

              <form.Field name="buyToken">
                {(field) => (
                  <Select
                    name={field.name}
                    value={field.state.value}
                    onValueChange={(value: string) => {
                      field.handleChange(value)
                    }}
                    disabled={!market}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {["wallet1", "wallet2"].map((source) => (
                          <SelectItem key={source} value={source}>
                            {source}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              </form.Field>
            </div>
            <TokenBalance token={quoteToken} label={"Balance"} />

            <form.Field name="limitPrice" onChange={isGreaterThanZeroValidator}>
              {(field) => (
                <EnhancedNumericInput
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={({ target: { value } }) => {
                    field.handleChange(value)
                  }}
                  token={quoteToken}
                  label="Limit price"
                  disabled={!(market && form.state.isFormValid)}
                  error={field.state.meta.touchedErrors}
                  showBalance
                />
              )}
            </form.Field>

            <form.Field name="receiveTo">
              {(field) => (
                <Select
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(value: string) => {
                    field.handleChange(value)
                  }}
                  disabled={!market}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {["wallet1", "wallet2"].map((source) => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            </form.Field>

            <Separator className="!my-6" />

            <Accordion title="Advanced">
              <p></p>
            </Accordion>

            <Separator className="!my-6" />

            <MarketDetails
              takerFee={feeInPercentageAsString}
              tickSize={tickSize}
            />

            <form.Subscribe
              selector={(state) => [
                state.canSubmit,
                state.isSubmitting,
                state.values.tradeAction,
              ]}
            >
              {([canSubmit, isSubmitting, tradeAction]) => {
                return (
                  <Button
                    className="w-full flex items-center justify-center !mb-4 capitalize !mt-6"
                    size={"lg"}
                    disabled={!canSubmit || !market}
                    rightIcon
                    loading={!!isSubmitting}
                  >
                    {tradeAction}
                  </Button>
                )
              }}
            </form.Subscribe>
          </div>
        </form>
      </form.Provider>

      {formData && (
        <FromWalletLimitOrderDialog
          form={formData}
          onClose={() => setFormData(undefined)}
        />
      )}
    </div>
  )
}
