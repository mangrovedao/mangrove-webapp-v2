import useMarket from "@/providers/market"
import { getErrorMessage } from "@/utils/errors"
import { BS } from "@mangrovedao/mgv/lib"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { z } from "zod"

const priceSchema = z.object({
  price: z.number(),
  id: z.optional(z.string()),
  symbol: z.optional(z.string()),
  name: z.optional(z.string()),
})

export function useDollarConversion({
  payAmount,
  receiveAmount,
  tradeSide = BS.buy,
}: any) {
  const { chain } = useAccount()
  const [prices, setPrices] = useState({ payDollar: "0", receiveDollar: "0" })
  const { currentMarket } = useMarket()

  if (!currentMarket?.base.address || !currentMarket?.quote.address)
    return { payDollar: -1, receiveDollar: -1 }

  const payTokenAddress = currentMarket.base.address
  const receiveTokenAddress = currentMarket.quote.address

  const getMarketPriceQuery = useQuery({
    queryKey: ["getMarketPrice", payTokenAddress, receiveTokenAddress],
    queryFn: async () => {
      try {
        if (
          !chain?.id ||
          !payTokenAddress ||
          !receiveTokenAddress ||
          chain?.testnet
        )
          return null

        const payDollar = await fetch(
          `https://price.mgvinfra.com/price-by-address?chain=${chain.id}&address=${payTokenAddress}`,
        )
          .then((res) => res.json())
          .then((data) => priceSchema.parse(data))

        const receiveDollar = await fetch(
          `https://price.mgvinfra.com/price-by-address?chain=${chain.id}&address=${receiveTokenAddress}`,
        )
          .then((res) => res.json())
          .then((data) => priceSchema.parse(data))

        return {
          payDollar: payDollar.price,
          receiveDollar: receiveDollar.price,
        }
      } catch (error) {
        console.error(getErrorMessage(error))
        return { payDollar: -1, receiveDollar: -1 }
      }
    },
    refetchInterval: 3_000,
    enabled: !!payTokenAddress && !!receiveTokenAddress,
  })

  useEffect(() => {
    if (getMarketPriceQuery.data) {
      const { payDollar, receiveDollar } = getMarketPriceQuery.data
      if (tradeSide === BS.sell) {
        setPrices({
          payDollar: Number(payAmount * payDollar).toFixed(2),
          receiveDollar: Number(receiveAmount * receiveDollar).toFixed(2),
        })
      } else {
        setPrices({
          payDollar: Number(receiveAmount * payDollar).toFixed(2),
          receiveDollar: Number(payAmount * receiveDollar).toFixed(2),
        })
      }
    }
  }, [payAmount, receiveAmount])

  return prices
}
