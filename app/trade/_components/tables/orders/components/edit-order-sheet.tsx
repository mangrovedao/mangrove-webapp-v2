import { type Market } from "@mangrovedao/mangrove.js"
import { DotIcon } from "lucide-react"
import React from "react"

import { EnhancedNumericInput } from "@/components/token-input"
import { TokenPair } from "@/components/token-pair"
import { Text } from "@/components/typography/text"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import { CircularProgressBar } from "@/components/ui/circle-progress-bar"
import * as SelectRoot from "@/components/ui/select"
import * as SheetRoot from "@/components/ui/sheet"
import { cn } from "@/utils"
import {
  formatDateWithoutHours,
  formatHoursOnly,
  hasExpired,
} from "@/utils/date"
import { TimeInForce, TimeToLiveUnit } from "../../../forms/limit/enums"
import { isGreaterThanZeroValidator } from "../../../forms/limit/validators"
import { useEditOrder } from "../hooks/use-edit-order"
import { type Order } from "../schema"
import { getOrderProgress } from "../utils/tables"
import { Timer } from "./timer"

type SheetLineProps = {
  title: string
  item: React.ReactNode
  secondaryItem?: React.ReactNode
}

const SheetLine = ({ title, item, secondaryItem }: SheetLineProps) => (
  <div className="flex justify-between items-center">
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
    <DotIcon className="h-4 w-auto" />
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

  const { handleSubmit, form, setToggleEdit, toggleEdit } = useEditOrder({
    order,
  })

  const { base, quote } = market
  const { expiryDate, price, isBid } = order
  const formattedPrice = `${Number(price).toFixed(4)} ${base.symbol}`
  const isOrderExpired = expiryDate && hasExpired(expiryDate)

  const { progress, amount, filled, progressInPercent } = getOrderProgress(
    order,
    market,
  )

  return (
    <SheetRoot.Sheet open={!!order} onOpenChange={onClose}>
      <SheetRoot.SheetContent>
        <SheetRoot.SheetHeader>
          <SheetRoot.SheetTitle>Order Details</SheetRoot.SheetTitle>
        </SheetRoot.SheetHeader>
        <form.Provider>
          <form onSubmit={handleSubmit} autoComplete="off">
            <SheetRoot.SheetBody className="flex-1">
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
                    className={isBid ? "text-green-caribbean" : "text-red-100"}
                  >
                    {isBid ? "Buy" : "Sell"}
                  </Text>
                }
              />

              <SheetLine title="Type" item="Wallet" />

              <SheetLine
                title="Filled/Amount"
                item={`${filled} / ${amount} ${base.symbol}`}
                secondaryItem={
                  <div className="flex gap-1">
                    <CircularProgressBar
                      progress={progress}
                      className="h-5 w-5"
                    />
                    <Text>{progressInPercent}%</Text>
                  </div>
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
                secondaryItem={
                  !toggleEdit && expiryDate ? (
                    <Timer expiry={expiryDate} />
                  ) : (
                    <div
                      className={cn(
                        "flex justify-between space-x-2 text-primary",
                      )}
                    >
                      <form.Field
                        name="timeToLive"
                        onChange={isGreaterThanZeroValidator}
                      >
                        {(field) => (
                          <EnhancedNumericInput
                            className="h-10"
                            inputClassName="h-10"
                            placeholder="1"
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

                      <form.Field name="timeToLiveUnit">
                        {(field) => (
                          <>
                            <SelectRoot.Select
                              name={field.name}
                              value={field.state.value}
                              onValueChange={(value: TimeToLiveUnit) => {
                                field.handleChange(value)
                              }}
                              disabled={!market}
                            >
                              <SelectRoot.SelectTrigger className="h-10">
                                <SelectRoot.SelectValue placeholder="Select time unit" />
                              </SelectRoot.SelectTrigger>
                              <SelectRoot.SelectContent>
                                <SelectRoot.SelectGroup>
                                  {Object.values(TimeToLiveUnit).map(
                                    (timeToLiveUnit) => (
                                      <SelectRoot.SelectItem
                                        key={timeToLiveUnit}
                                        value={timeToLiveUnit}
                                      >
                                        {timeToLiveUnit}
                                      </SelectRoot.SelectItem>
                                    ),
                                  )}
                                </SelectRoot.SelectGroup>
                              </SelectRoot.SelectContent>
                            </SelectRoot.Select>
                            {field.state.meta.touchedErrors && (
                              <span className="text-red-400">
                                {field.state.meta.touchedErrors[0]}
                              </span>
                            )}
                          </>
                        )}
                      </form.Field>
                    </div>
                  )
                }
              />
            </SheetRoot.SheetBody>

            <SheetRoot.SheetFooter>
              <SheetRoot.SheetClose className="flex-1">
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
                >
                  Cancel
                </Button>
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
        </form.Provider>
      </SheetRoot.SheetContent>
    </SheetRoot.Sheet>
  )
}
