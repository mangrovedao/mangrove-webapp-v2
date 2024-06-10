import Mangrove from "@mangrovedao/mangrove.js"
import React from "react"
import { Address } from "viem"

import { TokenIcon } from "@/components/token-icon"
import { EnhancedNumericInput } from "@/components/token-input"
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
import * as SheetRoot from "@/components/ui/sheet"
import { ScrollArea, ScrollBar } from "@/components/ui/sheet-scroll-area"
import { useTokenFromAddress } from "@/hooks/use-token-from-address"
import { cn } from "@/utils"
import { formatDateWithoutHours, formatHoursOnly } from "@/utils/date"
import { Token } from "@mangrovedao/mgv"
import { TimeInForce, TimeToLiveUnit } from "../../../forms/amplified/enums"
import {
  isGreaterThanZeroValidator,
  sendValidator,
} from "../../../forms/amplified/validators"
import { useEditAmplifiedOrder } from "../hooks/use-edit-amplified-order"
import { AmplifiedOrder } from "../schema"
import { AmplifiedForm } from "../types"
import EditAmplifiedOrderSteps from "./edit-amplified-order-steps"
import { Timer } from "./timer"

type SheetLineProps = {
  title: string
  item: React.ReactNode
  secondaryItem?: React.ReactNode
}

const SheetLine = ({ title, item, secondaryItem }: SheetLineProps) => (
  <div className="flex justify-between items-center">
    <Text className="text-muted-foreground whitespace-nowrap">{title}:</Text>
    <div className="grid justify-items-end max-w-60">
      {item}
      {secondaryItem}
    </div>
  </div>
)

const Badge = ({
  title,
  isExpired,
}: {
  title: string
  isExpired?: boolean
}) => (
  <div
    className={cn(
      "flex pl-2 pr-2 py-1 space-x-2 justify-between text-green-caribbean bg-primary-dark-green rounded items-center",
      { "text-red-100 bg-red-950": isExpired },
    )}
  >
    <span
      className={cn("bg-green-caribbean rounded-full h-[6px] w-[6px]", {
        "bg-red-600": isExpired,
      })}
    />
    <Title variant="title3">{title}</Title>
  </div>
)

type EditAmplifiedOrderSheetProps = {
  onClose: () => void
  orderInfos?: { order: AmplifiedOrder; mode: "edit" | "view" }
  openMarkets?: Mangrove.OpenMarketInfo[]
}

export default function EditAmplifiedOrderSheet({
  orderInfos,
  openMarkets,
  onClose,
}: EditAmplifiedOrderSheetProps) {
  if (!orderInfos || !openMarkets) return null
  const [formData, setFormData] = React.useState<AmplifiedForm>()
  const order = orderInfos.order
  const mode = orderInfos.mode
  const { creationDate, offers, expiryDate } = order

  const tokens = offers.map((offer) => {
    return useTokenFromAddress(offer.market.inbound_tkn as Address).data
  })

  const {
    handleSubmit,
    form,
    setToggleEdit,
    toggleEdit,
    assets,
    send,
    sendToken,
    timeInForce,
    timeToLive,
    timeToLiveUnit,
    status,
    sendTokenBalance,
  } = useEditAmplifiedOrder({
    order,
    onSubmit: (formData) => setFormData(formData),
  })

  React.useEffect(() => {
    if (mode === "edit") setToggleEdit(true)
  }, [])

  return (
    <SheetRoot.Sheet open={!!order} onOpenChange={onClose}>
      <SheetRoot.SheetContent>
        <SheetRoot.SheetHeader>
          <SheetRoot.SheetTitle>Order Details</SheetRoot.SheetTitle>
        </SheetRoot.SheetHeader>
        <form.Provider>
          <ScrollArea scrollHideDelay={200}>
            {formData ? (
              <EditAmplifiedOrderSteps
                order={order}
                form={{ ...formData, sendToken: sendToken as Token }}
                onClose={onClose}
                onCloseForm={() => {
                  setToggleEdit(false)
                  setFormData(undefined)
                }}
              />
            ) : (
              <form
                onSubmit={handleSubmit}
                autoComplete="off"
                className="flex flex-col flex-1 p-3"
              >
                <SheetRoot.SheetBody>
                  <div className="flex space-x-3">
                    <div className="flex -space-x-2">
                      {tokens?.map((token) =>
                        token ? (
                          <TokenIcon symbol={token?.symbol} />
                        ) : (
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-dark-green">
                            ?
                          </div>
                        ),
                      )}
                    </div>
                    <Title>Multiple</Title>
                  </div>
                  <SheetLine
                    title="Status"
                    item={
                      <Badge
                        title={
                          !order.offers.find((offer) => offer.isOpen)
                            ? "Closed"
                            : "Open"
                        }
                        isExpired={!order.offers.find((offer) => offer.isOpen)}
                      />
                    }
                  />

                  {creationDate && (
                    <SheetLine
                      title="Order Date"
                      item={
                        <Text>
                          {formatDateWithoutHours(
                            new Date(Number(`${creationDate}000`)),
                          )}
                        </Text>
                      }
                      secondaryItem={
                        <Text className="text-muted-foreground">
                          {formatHoursOnly(
                            new Date(Number(`${creationDate}000`)),
                          )}
                        </Text>
                      }
                    />
                  )}

                  <SheetLine
                    title="Side"
                    item={<Text className={"text-green-caribbean"}>Buy</Text>}
                  />

                  <SheetLine title="Type" item={<Text>Amplified</Text>} />

                  <SheetLine
                    title="Amount"
                    item={
                      !toggleEdit ? (
                        <Text>{`${send} ${sendToken?.symbol}`}</Text>
                      ) : (
                        <form.Field
                          name="send"
                          onChange={sendValidator(
                            Number(sendTokenBalance ?? 0),
                          )}
                        >
                          {(field) => (
                            <EnhancedNumericInput
                              className="h-10"
                              inputClassName="h-10"
                              name={field.name}
                              value={field.state.value}
                              placeholder={send}
                              onBlur={field.handleBlur}
                              onChange={(e) => {
                                field.handleChange(e.target.value)
                              }}
                              error={field.state.meta.touchedErrors}
                              token={sendToken || ""}
                              showBalance
                              disabled={!sendToken || sendTokenBalance === "0"}
                            />
                          )}
                        </form.Field>
                      )
                    }
                  />

                  {toggleEdit ? (
                    <SheetLine
                      title="Time in force"
                      item={
                        <div className="flex flex-col space-y-2">
                          <form.Field name="timeInForce">
                            {(field) => {
                              return (
                                <div className="grid text-md space-y-2">
                                  <Select
                                    name={field.name}
                                    value={field.state.value}
                                    onValueChange={(value: TimeInForce) => {
                                      field.handleChange(value)
                                    }}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select time in force" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectGroup>
                                        {Object.values(TimeInForce).map(
                                          (timeInForce) => (
                                            <SelectItem
                                              key={timeInForce}
                                              value={timeInForce}
                                            >
                                              {timeInForce}
                                            </SelectItem>
                                          ),
                                        )}
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
                            <form.Field
                              name="timeToLive"
                              onChange={isGreaterThanZeroValidator}
                            >
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
                                  disabled={!form.state.isFormValid}
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
                                  // disabled={!market}
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
                        </div>
                      }
                    />
                  ) : (
                    <SheetLine
                      title="Time in force"
                      item={<Text>{timeInForce}</Text>}
                      secondaryItem={
                        expiryDate && (
                          <Text className="text-muted-foreground">
                            <Timer expiry={expiryDate} />
                          </Text>
                        )
                      }
                    />
                  )}

                  {assets.map((asset, index) => {
                    return (
                      <div key={`asset-${index}`}>
                        <Separator className="!my-6" />

                        <div className="flex space-x-2 mb-4">
                          <TokenIcon symbol={asset.token?.symbol} />
                          <Text>{asset.token?.symbol} </Text>
                        </div>
                        <SheetLine
                          title="Limit price"
                          item={asset.limitPrice}
                        />

                        <SheetLine
                          title={`Receive to wallet`}
                          item={asset.receiveAmount}
                        />

                        <SheetLine title="Status" item={asset.status} />
                      </div>
                    )
                  })}
                </SheetRoot.SheetBody>

                <SheetRoot.SheetFooter>
                  <SheetRoot.SheetClose className="flex-1">
                    <form.Subscribe selector={(state) => [state.isSubmitting]}>
                      {([isSubmitting]) => {
                        return (
                          <Button
                            className="w-full"
                            variant="secondary"
                            size="lg"
                            onClick={
                              toggleEdit
                                ? (e) => {
                                    e.preventDefault()
                                    setToggleEdit(!toggleEdit)
                                  }
                                : undefined
                            }
                            disabled={isSubmitting}
                          >
                            {toggleEdit ? "Back" : "Close"}
                          </Button>
                        )
                      }}
                    </form.Subscribe>
                  </SheetRoot.SheetClose>

                  {!toggleEdit ? (
                    <Button
                      disabled={
                        !assets.some((asset) => asset.status === "Open")
                      }
                      className="flex-1"
                      variant="primary"
                      size="lg"
                      onClick={() => setToggleEdit(!toggleEdit)}
                    >
                      Modify
                    </Button>
                  ) : (
                    <form.Subscribe
                      selector={(state) => [
                        state.canSubmit,
                        state.isSubmitting,
                      ]}
                    >
                      {([canSubmit, isSubmitting]) => {
                        return (
                          <Button
                            type="submit"
                            className="flex-1"
                            variant="primary"
                            size="lg"
                            disabled={!canSubmit || !openMarkets}
                            loading={!!isSubmitting}
                          >
                            Save
                          </Button>
                        )
                      }}
                    </form.Subscribe>
                  )}
                </SheetRoot.SheetFooter>
              </form>
            )}

            <ScrollBar
              orientation="vertical"
              className="bg-primary-dark-green"
            />
          </ScrollArea>
        </form.Provider>
      </SheetRoot.SheetContent>
    </SheetRoot.Sheet>
  )
}
