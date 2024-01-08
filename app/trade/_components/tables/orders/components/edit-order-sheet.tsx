import { type Market } from "@mangrovedao/mangrove.js"
import { DotIcon } from "lucide-react"
import React from "react"

import { EnhancedNumericInput } from "@/components/token-input"
import { TokenPair } from "@/components/token-pair"
import { Text } from "@/components/typography/text"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import { CircularProgressBar } from "@/components/ui/circle-progress-bar"
import * as SheetRoot from "@/components/ui/sheet"
import { cn } from "@/utils"
import { formatDateWithoutHours, formatHoursOnly } from "@/utils/date"
import { TimeInForce } from "../../../forms/limit/enums"
import { isGreaterThanZeroValidator } from "../../../forms/limit/validators"
import { useEditOrder } from "../hooks/use-edit-order"
import { type Order } from "../schema"
import { Form } from "../types"
import { getOrderProgress } from "../utils/tables"
import EditOrderSteps from "./edit-order-steps"
import { Timer } from "./timer"

type SheetLineProps = {
  title: string
  item: React.ReactNode
  secondaryItem?: React.ReactNode
}

const SheetLine = ({ title, item, secondaryItem }: SheetLineProps) => (
  <div className="flex justify-between">
    <Text className="text-muted-foreground">{title}:</Text>
    <div className="grid justify-items-end">
      <Text>{item}</Text>
      {secondaryItem && (
        <Text className="text-muted-foreground">{secondaryItem}</Text>
      )}
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
      "flex pl-1 pr-2 justify-between text-green-caribbean bg-primary-dark-green rounded items-center",
      { "text-red-100 bg-red-950": isExpired },
    )}
  >
    <DotIcon className="h-6 w-6" />
    <Title variant="title3">{title}</Title>
  </div>
)

type EditOrderSheetProps = {
  onClose: () => void
  order?: Order
  market?: Market
}

export default function EditOrderSheet({
  order,
  market,
  onClose,
}: EditOrderSheetProps) {
  if (!order || !market) return null
  const [formData, setFormData] = React.useState<Form>()
  const { expiryDate, isBid } = order
  const {
    handleSubmit,
    form,
    setToggleEdit,
    toggleEdit,

    isOrderExpired,
    formattedPrice,
  } = useEditOrder({
    order,
    onSettled: onClose,
    onSubmit: (formData) => setFormData(formData),
  })
  const { base, quote } = market

  const {
    progress,
    progressInPercent,
    amount: volume,
    filled,
  } = getOrderProgress(order, market)

  return (
    <SheetRoot.Sheet open={!!order} onOpenChange={onClose}>
      <SheetRoot.SheetContent>
        <SheetRoot.SheetHeader>
          <SheetRoot.SheetTitle>Order Details</SheetRoot.SheetTitle>
        </SheetRoot.SheetHeader>
        <form.Provider>
          {formData ? (
            <EditOrderSteps order={order} form={formData} onClose={onClose} />
          ) : (
            <form
              onSubmit={handleSubmit}
              autoComplete="off"
              className="flex flex-col flex-1"
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
                    item={formatDateWithoutHours(expiryDate)}
                    secondaryItem={formatHoursOnly(expiryDate)}
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

                <SheetLine title="Type" item="Wallet" />

                <SheetLine
                  title="Filled"
                  item={`${filled} ${base.symbol}`}
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
                  title="Amount"
                  item={
                    !toggleEdit ? (
                      `${volume} ${base.symbol}`
                    ) : (
                      <form.Field
                        name="send"
                        onChange={isGreaterThanZeroValidator}
                      >
                        {(field) => (
                          <EnhancedNumericInput
                            className="h-10"
                            inputClassName="h-10"
                            name={field.name}
                            value={field.state.value}
                            placeholder={volume}
                            onBlur={field.handleBlur}
                            onChange={(e) => {
                              console.log(e.target.value)
                              field.handleChange(e.target.value)
                            }}
                            error={field.state.meta.touchedErrors}
                            token={base.symbol}
                            disabled={!market}
                          />
                        )}
                      </form.Field>
                    )
                  }
                />

                <SheetLine
                  title="Limit Price"
                  item={
                    !toggleEdit ? (
                      formattedPrice
                    ) : (
                      <form.Field
                        name="limitPrice"
                        onChange={isGreaterThanZeroValidator}
                      >
                        {(field) => (
                          <EnhancedNumericInput
                            className="h-10"
                            inputClassName="h-10"
                            name={field.name}
                            value={field.state.value}
                            placeholder={formattedPrice}
                            onBlur={field.handleBlur}
                            onChange={(e) => {
                              console.log(e.target.value)
                              field.handleChange(e.target.value)
                            }}
                            error={field.state.meta.touchedErrors}
                            token={quote.symbol}
                            disabled={!market}
                          />
                        )}
                      </form.Field>
                    )
                  }
                />

                <SheetLine
                  title="Time in force"
                  item={TimeInForce.GOOD_TIL_TIME}
                  secondaryItem={expiryDate && <Timer expiry={expiryDate} />}
                />
                {formData && (
                  <EditOrderSteps
                    order={order}
                    form={formData}
                    onClose={onClose}
                  />
                )}
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
                          Cancel
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
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
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
        </form.Provider>
      </SheetRoot.SheetContent>
    </SheetRoot.Sheet>
  )
}
