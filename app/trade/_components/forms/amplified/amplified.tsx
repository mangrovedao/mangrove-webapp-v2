import React from "react"

import { CustomBalance } from "@/components/stateful/token-balance/custom-balance"
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
import { useAccount } from "wagmi"
import { Accordion } from "../components/accordion"
import FromWalletAmplifiedOrderDialog from "./components/from-wallet-order-dialog"
import { TimeInForce, TimeToLiveUnit } from "./enums"
import liquiditySourcing from "./hooks/liquidity-sourcing"
import { useAmplified } from "./hooks/use-amplified"
import type { Form } from "./types"
import { sendValidator } from "./validators"

export function Amplified() {
  const [formData, setFormData] = React.useState<Form>()
  const {
    handleSubmit,
    form,
    market,
    timeInForce,
    sendSource,
    sendToken,
    firstAssetToken,
    secondAssetToken,
    selectedToken,
    logics,
    availableTokens,
    currentTokens,
  } = useAmplified({
    onSubmit: (formData) => setFormData(formData),
  })

  const { address } = useAccount()

  const { balanceLogic } = liquiditySourcing({
    sendToken: selectedToken,
    sendFrom: sendSource,
    fundOwner: address,
    //@ts-ignore
    logics,
  })

  const { balanceLogic: firstAssetBalance } = liquiditySourcing({
    sendToken: firstAssetToken,
    sendFrom: sendSource,
    fundOwner: address,
    //@ts-ignore
    logics,
  })

  const { balanceLogic: secondAssetBalance } = liquiditySourcing({
    sendToken: secondAssetToken,
    sendFrom: sendSource,
    fundOwner: address,
    //@ts-ignore
    logics,
  })

  const [markets, setMarkets] = React.useState(0)

  const addMarket = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    setMarkets(markets + 1)
  }

  return (
    <div className="grid space-y-2">
      <Text className="text-muted-foreground text-xs" variant={"text2"}>
        Place multiple limit orders using the same liquidity. The execution of
        one order will automatically update the others if partially filled or
        cancel the others if fully filled.
      </Text>

      <form.Provider>
        <form onSubmit={handleSubmit} autoComplete="off">
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
                        {logics.map(
                          (logic) =>
                            logic && (
                              <SelectItem key={logic.id} value={logic.id}>
                                <div className="flex space-x-3">
                                  <WalletIcon />
                                  <Text className="capitalize">
                                    {logic?.title}
                                  </Text>
                                </div>
                              </SelectItem>
                            ),
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            <div className="flex gap-2">
              <form.Field
                name="sendAmount"
                onChange={sendValidator(Number(balanceLogic?.formatted ?? 0))}
              >
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
                    disabled={!market || !sendSource}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {availableTokens.map((token) => (
                          <SelectItem key={token.id} value={token.id}>
                            <div className="flex space-x-3">
                              <TokenIcon symbol={token.symbol} />
                              <Text>{token.symbol}</Text>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              </form.Field>
            </div>

            {selectedToken && (
              <CustomBalance
                token={selectedToken}
                balance={balanceLogic?.formatted}
                label={"Balance"}
              />
            )}

            <div />

            <Caption variant={"caption1"} as={"label"}>
              Buy Asset #1
            </Caption>

            <div className="flex justify-between space-x-1">
              <form.Field
                name="firstAsset.amount"
                onChange={sendValidator(
                  Number(firstAssetBalance?.formatted ?? 0),
                )}
              >
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
                    disabled={!market || !sendToken}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {currentTokens.map((token) => (
                          <SelectItem key={token.id} value={token.id}>
                            <div className="flex space-x-3">
                              <TokenIcon symbol={token.symbol} />
                              <Text>{token.id}</Text>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              </form.Field>
            </div>

            {firstAssetBalance && (
              <CustomBalance
                token={firstAssetToken}
                balance={firstAssetBalance?.formatted}
                label={"Balance"}
              />
            )}

            <form.Field name="firstAsset.limitPrice">
              {(field) => (
                <EnhancedNumericInput
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={({ target: { value } }) => {
                    field.handleChange(value)
                  }}
                  token={firstAssetToken}
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
                        {logics.map(
                          (logic) =>
                            logic && (
                              <SelectItem key={logic.id} value={logic.id}>
                                <div className="flex space-x-3">
                                  <WalletIcon />
                                  <Text className="capitalize">
                                    {logic?.title}
                                  </Text>
                                </div>
                              </SelectItem>
                            ),
                        )}
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
              <form.Field
                name="secondAsset.amount"
                onChange={sendValidator(
                  Number(secondAssetBalance?.formatted ?? 0),
                )}
              >
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
                    disabled={!market || !sendToken}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {currentTokens.map((token) => (
                          <SelectItem key={token.id} value={token.id}>
                            <div className="flex space-x-3">
                              <TokenIcon symbol={token.symbol} />
                              <Text>{token.id}</Text>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              </form.Field>
            </div>

            {secondAssetBalance && (
              <CustomBalance
                token={secondAssetToken}
                balance={secondAssetBalance?.formatted}
                label={"Balance"}
              />
            )}

            <form.Field name="secondAsset.limitPrice">
              {(field) => (
                <EnhancedNumericInput
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={({ target: { value } }) => {
                    field.handleChange(value)
                  }}
                  token={secondAssetToken}
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
                        {logics.map(
                          (logic) =>
                            logic && (
                              <SelectItem key={logic.id} value={logic.id}>
                                <div className="flex space-x-3">
                                  <WalletIcon />
                                  <Text className="capitalize">
                                    {logic?.title}
                                  </Text>
                                </div>
                              </SelectItem>
                            ),
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            {/* {Array.from(Array(markets).keys()).map((item, i) => (
              <>
                <div className="flex items-center gap-2 justify-center">
                  <Separator className="bg-green-bangladesh max-w-[135px]" />
                  <Caption>or</Caption>
                  <Separator className="bg-green-bangladesh max-w-[135px]" />
                </div>
                <div className="flex justify-between items-center">
                  <Caption variant={"caption1"} as={"label"}>
                    Buy Asset #{item + 3}
                  </Caption>
                  <span
                    className="text-white cursor-pointer"
                    onClick={() => setMarkets(markets - 1)}
                  >
                    <XIcon className="w-4 h-4 hover:text-green-caribbean" />
                  </span>
                </div>
                <div className="flex justify-between space-x-2">
                  <EnhancedNumericInput name="" value={""} disabled={!market} />

                  <Select name={""} value={""} disabled={!market}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {logics.map(
                          (logic) =>
                            logic && (
                              <SelectItem key={logic.id} value={logic.id}>
                                <div className="flex space-x-3">
                                  <WalletIcon />
                                  <Text className="capitalize">
                                    {logic?.title}
                                  </Text>
                                </div>
                              </SelectItem>
                            ),
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <CustomBalance
                  token={selectedToken}
                  balance={balanceLogic?.formatted}
                  label={"Balance"}
                />

                <EnhancedNumericInput
                  name={""}
                  value={""}
                  label="Limit price"
                  disabled={!market}
                />

                <div className="flex-col flex">
                  <Caption variant={"caption1"} as={"label"}>
                    Receive to
                  </Caption>
                  <Select name={""} value={""} disabled={!market}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {logics.map(
                          (logic) =>
                            logic && (
                              <SelectItem key={logic.id} value={logic.id}>
                                <div className="flex space-x-3">
                                  <WalletIcon />
                                  <Text className="capitalize">
                                    {logic?.title}
                                  </Text>
                                </div>
                              </SelectItem>
                            ),
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ))} */}

            <Button
              disabled
              onClick={(e) => addMarket(e)}
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
                state.values.sendSource,
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
        <FromWalletAmplifiedOrderDialog
          form={formData}
          onClose={() => setFormData(undefined)}
        />
      )}
    </div>
  )
}
