import Mangrove from "@mangrovedao/mangrove.js"
import React from "react"

import { TokenIcon } from "@/components/token-icon"
import { Text } from "@/components/typography/text"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import * as SheetRoot from "@/components/ui/sheet"
import { useTokenFromAddress } from "@/hooks/use-token-from-address"
import useMangrove from "@/providers/mangrove"
import { cn } from "@/utils"
import { formatDateWithoutHours, formatHoursOnly } from "@/utils/date"
import { Address, formatEther } from "viem"
import { TimeInForce } from "../../../forms/limit/enums"
import { AmplifiedOrder } from "../schema"
import { Form } from "../types"

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
  const { marketsInfoQuery, mangrove } = useMangrove()

  if (!orderInfos || !openMarkets) return null
  const [formData, setFormData] = React.useState<Form>()
  const order = orderInfos.order
  const mode = orderInfos.mode
  const { creationDate, owner, offers } = order
  const sendToken = useTokenFromAddress(
    offers[0]?.market.outbound_tkn as Address,
  ).data

  const tokens = offers.map((offer) => {
    return useTokenFromAddress(offer.market.inbound_tkn as Address).data
  })

  const limitPrice = Number(
    offers.find((offer) => Number(offer.price) > 0)?.price,
  ).toFixed(sendToken?.displayedDecimals)

  const notSupportedMarketCount = offers.filter(
    (offer) => !offer.isMarketFound,
  ).length

  console.log(offers)
  // const {
  //   handleSubmit,
  //   form,
  //   setToggleEdit,
  //   toggleEdit,
  //   displayDecimals,
  //   false,
  //   formattedPrice,
  //   sendTokenBalance,
  // } = useEditAmplifiedOrder({
  //   order,
  //   onSubmit: (formData) => setFormData(formData),
  // })
  // const { progress, progressInPercent, volume, filled, amount } =
  //   getAmplifiedOrderProgress(order, market)

  // React.useEffect(() => {
  //   if (mode === "edit") setToggleEdit(true)
  // }, [])

  return (
    <SheetRoot.Sheet open={!!order} onOpenChange={onClose}>
      <SheetRoot.SheetContent>
        <SheetRoot.SheetHeader>
          <SheetRoot.SheetTitle>Order Details</SheetRoot.SheetTitle>
        </SheetRoot.SheetHeader>
        {/* <form.Provider> */}
        {formData ? (
          <div>TODO EDIT</div>
        ) : (
          // <EditAmplifiedOrderSheet
          //   order={order}
          //   form={formData}
          //   onClose={onClose}
          //   displayDecimals={displayDecimals}
          // />
          // <form
          //   onSubmit={handleSubmit}
          //   autoComplete="off"
          //   className="flex flex-col flex-1"
          // >
          <>
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
                  <Badge title={false ? "Closed" : "Open"} isExpired={false} />
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
                      {formatHoursOnly(new Date(Number(`${creationDate}000`)))}
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
                item={<Text>{`${0}VOLUME SYMBOL`}</Text>}
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

              {offers.map((offer, index) => {
                const sendToken = useTokenFromAddress(
                  offer.market.inbound_tkn as Address,
                ).data

                const receiveToken = useTokenFromAddress(
                  offer.market.outbound_tkn as Address,
                ).data

                console.log(formatEther(BigInt(offer.gives)))

                const limitPrice = `${Number(offer.price).toFixed(
                  sendToken?.displayedDecimals,
                )} ${sendToken?.symbol}`

                const receiveAmount = `${formatEther(BigInt(offer.gives))} ${receiveToken?.symbol}`

                return (
                  <div>
                    <div className="flex space-x-2 mb-4">
                      <TokenIcon symbol={sendToken?.symbol} />
                      <Text>{sendToken?.symbol}</Text>
                    </div>
                    <SheetLine title="Limit price" item={limitPrice} />
                    <SheetLine
                      title={`Receive to wallet`}
                      item={receiveAmount}
                    />
                  </div>
                )
              })}
            </SheetRoot.SheetBody>

            <SheetRoot.SheetFooter>
              <SheetRoot.SheetClose className="flex-1">
                <Button className="w-full" variant="primary" size="lg">
                  Close
                </Button>
                {/* <form.Subscribe selector={(state) => [state.isSubmitting]}>
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
                  </form.Subscribe> */}
              </SheetRoot.SheetClose>

              {/* {!toggleEdit ? (
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
                )} */}
            </SheetRoot.SheetFooter>
            {/* </form> */}
          </>
        )}
        {/* </form.Provider> */}
      </SheetRoot.SheetContent>
    </SheetRoot.Sheet>
  )
}
