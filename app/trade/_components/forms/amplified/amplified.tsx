import React from "react"

import {
  CustomRadioGroup,
  CustomRadioGroupItem,
} from "@/components/custom-radio-group"
import { TokenBalance } from "@/components/stateful/token-balance/token-balance"
import { TokenIcon } from "@/components/token-icon"
import { EnhancedNumericInput } from "@/components/token-input"
import { Caption } from "@/components/typography/caption"
import { Text } from "@/components/typography/text"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/utils"
import { Plus, WalletIcon } from "lucide-react"
import { Accordion } from "../components/accordion"
import { TradeAction } from "../enums"
import FromWalletLimitOrderDialog from "./components/from-wallet-order-dialog"
import { TimeInForce, TimeToLiveUnit } from "./enums"
import { useAmplified } from "./hooks/use-amplified"
import type { Form } from "./types"

export function Amplified() {
  const [formData, setFormData] = React.useState<Form>()
  const {
    assets,
    handleSubmit,
    form,
    quoteToken,
    market,
    receiveToken,
    timeInForce,
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
                <div className="flex flex-col">
                  <Caption variant={"caption1"} as={"label"}>
                    Send from
                  </Caption>
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
                        {["wallet"].map((source) => (
                          <SelectItem key={source} value={source}>
                            <div className="flex space-x-3">
                              <WalletIcon />
                              <Text className="capitalize"> {source}</Text>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            <div className="flex gap-2">
              <form.Field name="sendAmount">
                {(field) => (
                  <EnhancedNumericInput
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      field.handleChange(e.target.value)
                    }}
                    disabled={!market}
                    error={field.state.meta.errors}
                  />
                )}
              </form.Field>

              <form.Field name="sendToken">
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
                        {assets.map((asset) => (
                          <SelectItem
                            key={asset?.symbol}
                            value={asset?.symbol || ""} //TODO: fix undefined assets
                          >
                            <div className="flex space-x-3">
                              <TokenIcon symbol={asset?.symbol} />
                              <Text>{asset?.symbol}</Text>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              </form.Field>
            </div>
            <TokenBalance token={receiveToken} label={"Balance"} />

            <div />

            <Caption variant={"caption1"} as={"label"}>
              Buy Asset #1
            </Caption>

            <div className="flex justify-between space-x-1">
              <form.Field name="firstAsset.amount">
                {(field) => (
                  <EnhancedNumericInput
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={({ target: { value } }) => {
                      field.handleChange(value)
                    }}
                    disabled={!(market && form.state.isFormValid)}
                    error={field.state.meta.touchedErrors}
                  />
                )}
              </form.Field>

              <form.Field name="firstAsset.token">
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
                        {assets.map((asset) => (
                          <SelectItem
                            key={asset?.symbol}
                            value={asset?.symbol || ""} //TODO: fix undefined assets
                          >
                            <div className="flex space-x-3">
                              <TokenIcon symbol={asset?.symbol} />
                              <Text>{asset?.symbol}</Text>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              </form.Field>
            </div>

            <TokenBalance token={receiveToken} label={"Balance"} />

            <form.Field name="firstAsset.limitPrice">
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
                />
              )}
            </form.Field>

            <form.Field name="firstAsset.receiveTo">
              {(field) => (
                <div className="flex-col flex">
                  <Caption variant={"caption1"} as={"label"}>
                    Receive to
                  </Caption>
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
                        {["wallet"].map((source) => (
                          <SelectItem key={source} value={source}>
                            <div className="flex space-x-3">
                              <WalletIcon />
                              <Text className="capitalize"> {source}</Text>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            <div className="flex items-center gap-2 justify-center">
              <Separator className="bg-green-bangladesh max-w-[135px]" />
              <Caption>or</Caption>
              <Separator className="bg-green-bangladesh max-w-[135px]" />
            </div>

            <Caption variant={"caption1"} as={"label"}>
              Buy Asset #2
            </Caption>
            <div className="flex justify-between space-x-2">
              <form.Field name="secondAsset.amount">
                {(field) => (
                  <EnhancedNumericInput
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={({ target: { value } }) => {
                      field.handleChange(value)
                    }}
                    disabled={!(market && form.state.isFormValid)}
                    error={field.state.meta.touchedErrors}
                  />
                )}
              </form.Field>

              <form.Field name="secondAsset.token">
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
                        {assets.map((asset) => (
                          <SelectItem
                            key={asset?.symbol}
                            value={asset?.symbol || ""} // TODO: fix undefined assets
                          >
                            <div className="flex space-x-3">
                              <TokenIcon symbol={asset?.symbol} />
                              <Text>{asset?.symbol}</Text>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              </form.Field>
            </div>
            <TokenBalance token={quoteToken} label={"Balance"} />

            <form.Field name="secondAsset.limitPrice">
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
                />
              )}
            </form.Field>

            <form.Field name="secondAsset.receiveTo">
              {(field) => (
                <div className="flex-col flex">
                  <Caption variant={"caption1"} as={"label"}>
                    Receive to
                  </Caption>
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
                        {["wallet"].map((source) => (
                          <SelectItem key={source} value={source}>
                            <div className="flex space-x-3">
                              <WalletIcon />
                              <Text className="capitalize"> {source}</Text>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            <Button
              disabled
              variant={"secondary"}
              className="flex justify-center items-center w-full"
            >
              <Plus className="h-4 w-4" /> Add Market
            </Button>

            <Separator className="!my-6" />

            <Accordion title="Advanced">
              <form.Field name="timeInForce">
                {(field) => {
                  return (
                    <div className="grid text-md space-y-2">
                      <Label>Time in force</Label>
                      <Select
                        name={field.name}
                        value={field.state.value}
                        onValueChange={(value: TimeInForce) => {
                          field.handleChange(value)
                        }}
                        disabled={!market}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select time in force" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {Object.values(TimeInForce).map((timeInForce) => (
                              <SelectItem key={timeInForce} value={timeInForce}>
                                {timeInForce}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  )
                }}
              </form.Field>

              <div
                className={cn("flex justify-between space-x-2", {
                  hidden: timeInForce !== TimeInForce.GOOD_TIL_TIME,
                })}
              >
                <form.Field name="timeToLive">
                  {(field) => (
                    <EnhancedNumericInput
                      placeholder="1"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={({ target: { value } }) => {
                        if (!value) return
                        field.handleChange(value)
                      }}
                      disabled={!(market && form.state.isFormValid)}
                      error={field.state.meta.touchedErrors}
                    />
                  )}
                </form.Field>

                <form.Field name="timeToLiveUnit">
                  {(field) => (
                    <Select
                      name={field.name}
                      value={field.state.value}
                      onValueChange={(value: TimeToLiveUnit) => {
                        field.handleChange(value)
                      }}
                      disabled={!market}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {Object.values(TimeToLiveUnit).map(
                            (timeToLiveUnit) => (
                              <SelectItem
                                key={timeToLiveUnit}
                                value={timeToLiveUnit}
                              >
                                {timeToLiveUnit}
                              </SelectItem>
                            ),
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                </form.Field>
              </div>
            </Accordion>

            <Separator className="!my-6" />

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
                    // disabled={!canSubmit || !market}
                    disabled
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
