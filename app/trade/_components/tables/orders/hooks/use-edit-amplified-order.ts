/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client"

import useMarket from "@/providers/market"
import { AmplifiedOrder } from "../schema"
import { Form } from "../types"

type Props = {
  order: AmplifiedOrder
  onSubmit: (data: Form) => void
}

export function useEditAmplifiedOrder({ order, onSubmit }: Props) {
  const { market } = useMarket()
  // const {
  //   initialGives,
  //   initialWants,
  //   price: currentPrice,
  //   isBid,
  //   expiryDate,
  // } = order

  // const baseDecimals = market?.base.displayedDecimals
  // const quoteDecimals = market?.quote.displayedDecimals

  // const displayDecimals = isBid ? baseDecimals : quoteDecimals

  // const volume = Big(initialGives).toFixed(displayDecimals)

  // const form = useForm({
  //   validator: zodValidator,
  //   defaultValues: {
  //     limitPrice: Number(currentPrice).toFixed(quoteDecimals),
  //     send: volume,
  //     timeToLive: "1",
  //     timeToLiveUnit: TimeToLiveUnit.DAY,
  //     isBid: isBid,
  //   },
  //   onSubmit: (values) => onSubmit(values),
  // })

  // const tradeAction = isBid ? TradeAction.BUY : TradeAction.SELL
  // const { sendTokenBalance } = useTradeInfos("limit", tradeAction)
  // const [toggleEdit, setToggleEdit] = React.useState(false)

  // const formattedPrice = `${Number(currentPrice).toFixed(
  //   quoteDecimals,
  // )} ${market?.quote?.symbol}`

  // const isOrderExpired = expiryDate && hasExpired(expiryDate)

  // function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  //   e.preventDefault()
  //   e.stopPropagation()
  //   void form.handleSubmit()
  // }

  // React.useEffect(() => {
  //   form?.reset()
  // }, [toggleEdit, form])

  return {
    // handleSubmit,
    // form,
    // setToggleEdit,
    // toggleEdit,
    // isOrderExpired,
    // formattedPrice,
    // sendTokenBalance,
    // displayDecimals: {
    //   volume: isBid ? quoteDecimals : baseDecimals,
    //   price: quoteDecimals,
    // },
  }
}
