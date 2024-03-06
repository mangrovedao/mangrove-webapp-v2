import Mangrove, { Token } from "@mangrovedao/mangrove.js"
import React from "react"

import { TokenIcon } from "@/components/token-icon"
import { EnhancedNumericInput } from "@/components/token-input"
import { Text } from "@/components/typography/text"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import * as SheetRoot from "@/components/ui/sheet"
import { useTokenFromAddress } from "@/hooks/use-token-from-address"
import { cn } from "@/utils"
import { formatDateWithoutHours, formatHoursOnly } from "@/utils/date"
import { Address } from "viem"
import { sendValidator } from "../../../forms/amplified/validators"
import { TimeInForce } from "../../../forms/limit/enums"
import { useEditAmplifiedOrder } from "../hooks/use-edit-amplified-order"
import { AmplifiedOrder } from "../schema"
import { AmplifiedForm } from "../types"
import EditAmplifiedOrderSteps from "./edit-amplified-order-steps"

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
    <span className="bg-green-caribbean rounded-full h-[6px] w-[6px]" />
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
  const { creationDate, owner, offers } = order

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
          {formData ? (
            <EditAmplifiedOrderSteps
              order={order}
              form={{ ...formData, sendToken: sendToken as Token }}
              onClose={onClose}
            />
          ) : (
            <form
              onSubmit={handleSubmit}
              autoComplete="off"
              className="flex flex-col flex-1"
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
                      title={false ? "Closed" : "Open"}
                      isExpired={false}
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
                        onChange={sendValidator(Number(sendTokenBalance ?? 0))}
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
                            token={sendToken?.symbol}
                            showBalance
                            disabled={!sendToken || sendTokenBalance === "0"}
                          />
                        )}
                      </form.Field>
                    )
                  }
                />

                <SheetLine
                  title="Time in force"
                  item={<Text>{TimeInForce.GOOD_TIL_TIME}</Text>}
                  secondaryItem={
                    false ? (
                      <Text className="text-muted-foreground">
                        {/* <Timer expiry={expiryDate} /> */}
                      </Text>
                    ) : (
                      <>timer</>
                    )
                  }
                />

                {assets.map((asset, index) => {
                  return (
                    <div key={`asset-${index}`}>
                      <div className="flex space-x-2 mb-4">
                        <TokenIcon symbol={asset.token?.symbol} />
                        <Text>{asset.token?.symbol} </Text>
                      </div>
                      <SheetLine title="Limit price" item={asset.limitPrice} />
                      <SheetLine
                        title={`Receive to wallet`}
                        item={asset.receiveAmount}
                      />
                    </div>
                  )
                })}

                {/* {!toggleEdit ? (
                  assets.map((asset, index) => {
                    return (
                      <div key={`asset-${index}`}>
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
                      </div>
                    )
                  })
                ) : (
                  <form.Field name="assets">
                    {(field) =>
                      field.state.value &&
                      field.state.value.length > 0 &&
                      field.state.value.map((asset, index) => {
                        return (
                          <div
                            key={`edit-asset-${index}`}
                            className="space-y-2"
                          >
                            <div className="flex space-x-2 mb-4">
                              <TokenIcon symbol={asset.token?.symbol} />
                              <Text>{asset.token?.symbol}</Text>
                            </div>

                            <SheetLine
                              title="Limit price"
                              item={
                                <EnhancedNumericInput
                                  className="h-10"
                                  inputClassName="h-10"
                                  name={field.name}
                                  value={asset.limitPrice}
                                  placeholder={asset.limitPrice}
                                  onBlur={field.handleBlur}
                                  onChange={(e) => {
                                    field.handleChange([
                                      ...field.state.value.slice(0, index),
                                      {
                                        ...asset,
                                        limitPrice: e.target.value,
                                      },
                                      ...field.state.value.slice(index + 1),
                                    ])
                                  }}
                                  error={field.state.meta.touchedErrors}
                                  token={sendToken?.symbol}
                                  disabled={!openMarkets}
                                />
                              }
                            />

                            <SheetLine
                              title="Receive to wallet"
                              item={
                                <EnhancedNumericInput
                                  className="h-10"
                                  inputClassName="h-10"
                                  name={field.name}
                                  value={asset.receiveAmount}
                                  placeholder={asset.receiveAmount}
                                  onBlur={field.handleBlur}
                                  onChange={(e) => {
                                    field.handleChange([
                                      ...field.state.value.slice(0, index),
                                      {
                                        ...asset,
                                        receiveAmount: e.target.value,
                                      },
                                      ...field.state.value.slice(index + 1),
                                    ])
                                  }}
                                  error={field.state.meta.touchedErrors}
                                  token={asset.token?.symbol}
                                  disabled={!openMarkets}
                                />
                              }
                            />
                          </div>
                        )
                      })
                    }
                  </form.Field>
                )} */}
              </SheetRoot.SheetBody>

              <SheetRoot.SheetFooter>
                <SheetRoot.SheetClose className="flex-1">
                  <form.Subscribe selector={(state) => [state.isSubmitting]}>
                    {([isSubmitting]) => {
                      return (
                        <Button
                          className="w-full"
                          variant="primary"
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
                          Close
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
        </form.Provider>
      </SheetRoot.SheetContent>
    </SheetRoot.Sheet>
  )
}
