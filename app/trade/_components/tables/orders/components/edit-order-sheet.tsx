import React from "react"

import { EnhancedNumericInput } from "@/components/token-input"
import { TokenPair } from "@/components/token-pair"
import { Text } from "@/components/typography/text"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import { CircularProgressBar } from "@/components/ui/circle-progress-bar"
import * as SheetRoot from "@/components/ui/sheet-new"
import { ScrollArea, ScrollBar } from "@/components/ui/sheet-scroll-area"
import useMarket from "@/providers/market"
import { cn } from "@/utils"
import { formatDateWithoutHours, formatHoursOnly } from "@/utils/date"
import { formatUnits } from "viem"
import { TimeInForce } from "../../../forms/limit/enums"
import {
  isGreaterThanZeroValidator,
  sendValidator,
} from "../../../forms/limit/validators"
import { useEditOrder } from "../hooks/use-edit-order"
import { type Order } from "../schema"
import { Form } from "../types"
import { getOrderProgress } from "../utils/edit-order"
import EditOrderSteps from "./edit-order-steps"
import { Timer } from "./timer"

type SheetLineProps = {
  title: React.ReactNode
  item: React.ReactNode
  secondaryItem?: React.ReactNode
}

const SheetLine = ({ title, item, secondaryItem }: SheetLineProps) => (
  <div className="flex justify-between items-center">
    <Text className="text-muted-foreground whitespace-nowrap">{title}</Text>
    <div className="grid justify-items-end max-w-60 space-y-2">
      <div>{item}</div>
      <div>{secondaryItem}</div>
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
    <span className="bg-green-caribbean rounded-full h-[6px] w-[6px]" />
    <Title variant="title3">{title}</Title>
  </div>
)

type EditOrderSheetProps = {
  onClose: () => void
  orderInfos?: { order: Order; mode: "edit" | "view" }
  market?: ReturnType<typeof useMarket>
}

export default function EditOrderSheet({
  orderInfos,
  market,
  onClose,
}: EditOrderSheetProps) {
  if (!orderInfos || !market) return null
  const [formData, setFormData] = React.useState<Form>()
  const order = orderInfos?.order
  const mode = orderInfos?.mode
  const { expiryDate, isBid } = order
  const {
    handleSubmit,
    setToggleEdit,
    computeSendAmount,
    computeReceiveAmount,
    form,
    toggleEdit,
    displayDecimals,
    isOrderExpired,
    formattedPrice,
    sendTokenBalance,
    sendFrom,
    receiveTo,
  } = useEditOrder({
    order,
    onSubmit: (formData) => setFormData(formData),
  })

  const { base, quote } = market.currentMarket ?? {}

  const { progress, progressInPercent, gives, filled, wants } =
    getOrderProgress(order, base, quote)

  React.useEffect(() => {
    if (mode === "edit") setToggleEdit(true)
  }, [])

  const sendTokenDecimals = isBid ? quote?.decimals : base?.decimals

  return (
    <SheetRoot.Sheet open={!!order} onOpenChange={onClose}>
      <SheetRoot.SheetContent>
        <SheetRoot.SheetHeader>
          <SheetRoot.SheetTitle>Order Details</SheetRoot.SheetTitle>
        </SheetRoot.SheetHeader>
        <form.Provider>
          <ScrollArea scrollHideDelay={200}>
            {formData ? (
              <EditOrderSteps
                order={order}
                form={formData}
                onClose={onClose}
                onCloseForm={() => {
                  setToggleEdit(false)
                  setFormData(undefined)
                }}
                displayDecimals={displayDecimals}
              />
            ) : (
              <form
                onSubmit={handleSubmit}
                autoComplete="off"
                className="flex flex-col flex-1 p-3"
              >
                <SheetRoot.SheetBody>
                  <TokenPair
                    tokenClasses="h-7 w-7"
                    baseToken={base}
                    quoteToken={quote}
                    titleProps={{ variant: "title1" }}
                  />

                  <SheetLine
                    title="Status"
                    item={
                      <Badge
                        title={isOrderExpired ? "Closed" : "Open"}
                        isExpired={isOrderExpired}
                      />
                    }
                  />

                  {expiryDate && (
                    <SheetLine
                      title="Order Date"
                      item={<Text>{formatDateWithoutHours(expiryDate)}</Text>}
                      secondaryItem={
                        <Text className="text-muted-foreground">
                          {formatHoursOnly(expiryDate)}
                        </Text>
                      }
                    />
                  )}

                  <SheetLine
                    title="Side"
                    item={
                      <Text
                        className={
                          isBid ? "text-green-caribbean" : "text-red-100"
                        }
                      >
                        {isBid ? "Buy" : "Sell"}
                      </Text>
                    }
                  />

                  <SheetLine title="Type" item={<Text>Limit</Text>} />

                  <SheetLine
                    title={`Filled/Amount`}
                    item={
                      <Text>{`${filled} / ${wants} ${
                        isBid ? base?.symbol : quote?.symbol
                      }`}</Text>
                    }
                    secondaryItem={
                      <div className="flex gap-1 align-baseline">
                        <CircularProgressBar
                          progress={progress}
                          className="h-5 w-5"
                        />
                        <Text>{progressInPercent}%</Text>
                      </div>
                    }
                  />

                  <SheetLine
                    title="Limit price"
                    item={
                      !toggleEdit ? (
                        <Text>{formattedPrice}</Text>
                      ) : (
                        <form.Field
                          name="limitPrice"
                          onChange={isGreaterThanZeroValidator}
                        >
                          {(field) => (
                            <EnhancedNumericInput
                              inputClassName="h-10"
                              name={field.name}
                              value={field.state.value}
                              placeholder={formattedPrice}
                              onBlur={field.handleBlur}
                              onChange={(e) => {
                                field.handleChange(e.target.value)
                                computeReceiveAmount()
                              }}
                              error={field.state.meta.touchedErrors}
                              token={quote}
                              disabled={!market}
                            />
                          )}
                        </form.Field>
                      )
                    }
                  />

                  <SheetLine
                    title={
                      <Text className="text-wrap">
                        Send from {sendFrom?.name || "Wallet"}
                      </Text>
                    }
                    item={
                      !toggleEdit ? (
                        <Text>{`${gives} ${
                          isBid ? quote?.symbol : base?.symbol
                        }`}</Text>
                      ) : (
                        <form.Field
                          name="send"
                          onChange={sendValidator(
                            Number(
                              formatUnits(
                                sendTokenBalance.balance?.balance || 0n,
                                sendTokenDecimals || 18,
                              ),
                            ),
                          )}
                        >
                          {(field) => (
                            <EnhancedNumericInput
                              className="h-10"
                              inputClassName="h-10"
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => {
                                field.handleChange(e.target.value)
                                computeReceiveAmount()
                              }}
                              error={field.state.meta.touchedErrors}
                              token={isBid ? quote : base}
                              disabled={!market}
                              showBalance
                            />
                          )}
                        </form.Field>
                      )
                    }
                  />

                  <SheetLine
                    title={
                      <Text className="text-wrap">
                        Receive to {receiveTo?.name || "Wallet"}
                      </Text>
                    }
                    item={
                      !toggleEdit ? (
                        <Text>{`${wants} ${
                          isBid ? base?.symbol : quote?.symbol
                        }`}</Text>
                      ) : (
                        <form.Field
                          name="receive"
                          onChange={isGreaterThanZeroValidator}
                        >
                          {(field) => (
                            <EnhancedNumericInput
                              className="h-10"
                              inputClassName="h-10"
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => {
                                field.handleChange(e.target.value)
                                computeSendAmount()
                              }}
                              error={field.state.meta.touchedErrors}
                              token={isBid ? base : quote}
                              disabled={!market}
                              showBalance
                            />
                          )}
                        </form.Field>
                      )
                    }
                  />

                  <SheetLine
                    title="Time in force"
                    item={<Text>{TimeInForce.GTC}</Text>}
                    secondaryItem={
                      expiryDate && (
                        <Text className="text-muted-foreground">
                          <Timer expiry={expiryDate} />
                        </Text>
                      )
                    }
                  />
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
                            {toggleEdit ? "Cancel" : "Close"}
                          </Button>
                        )
                      }}
                    </form.Subscribe>
                  </SheetRoot.SheetClose>

                  {!toggleEdit ? (
                    <Button
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
                            disabled={!canSubmit || !market}
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
