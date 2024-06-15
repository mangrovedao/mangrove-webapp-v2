import { useBook } from "@/hooks/use-book"
import useMarket from "@/providers/market.new"
import { RawKandelParams, validateKandelParams } from "@mangrovedao/mgv"
import { useQuery } from "@tanstack/react-query"

export function useValidateKandel(
  kandelParams: Omit<
    RawKandelParams,
    | "asksLocalConfig"
    | "bidsLocalConfig"
    | "midPrice"
    | "market"
    | "marketConfig"
  >,
  isMissingField: boolean,
) {
  const { currentMarket } = useMarket()
  const { book } = useBook()

  return useQuery({
    queryKey: [
      "kandel-validation",
      Number(kandelParams.baseAmount),
      Number(kandelParams.quoteAmount),
      kandelParams.maxPrice,
      kandelParams.minPrice,
      Number(kandelParams.stepSize),
      Number(kandelParams.pricePoints),
      book?.midPrice,
    ],
    queryFn: async () => {
      try {
        if (!book || !currentMarket)
          throw new Error("Could not validate kandel, missing params")

        console.log(kandelParams)

        const {
          params,
          rawParams,
          minBaseAmount,
          minQuoteAmount,
          minProvision,
          distribution,
          isValid,
        } = validateKandelParams({
          gasreq: kandelParams.gasreq,
          factor: kandelParams.factor,
          asksLocalConfig: book.asksConfig,
          bidsLocalConfig: book.bidsConfig,
          minPrice: Number(kandelParams.minPrice),
          maxPrice: Number(kandelParams.maxPrice),
          midPrice: book.midPrice,
          marketConfig: book.marketConfig,
          market: currentMarket,
          baseAmount: kandelParams.baseAmount,
          quoteAmount: kandelParams.quoteAmount,
          stepSize: kandelParams.stepSize,
          pricePoints: kandelParams.pricePoints,
        })

        // @ts-ignore
        // BigInt.prototype.toJSON = function () {
        //   return this.toString()
        // }

        // console.log(
        //   "response",
        //   JSON.stringify({
        //     params,
        //     rawParams,
        //     minBaseAmount,
        //     minQuoteAmount,
        //     minProvision,
        //     distribution,
        //     isValid,
        //   }),
        // )

        // console.log(
        //   "sent params",
        //   JSON.stringify({
        //     gasreq: kandelParams.gasreq,
        //     factor: kandelParams.factor,
        //     asksLocalConfig: book.asksConfig,
        //     bidsLocalConfig: book.bidsConfig,
        //     minPrice: Number(kandelParams.minPrice),
        //     maxPrice: Number(kandelParams.maxPrice),
        //     midPrice: book.midPrice,
        //     marketConfig: book.marketConfig,
        //     market: currentMarket,
        //     baseAmount: kandelParams.baseAmount,
        //     quoteAmount: kandelParams.quoteAmount,
        //     stepSize: kandelParams.stepSize,
        //     pricePoints: kandelParams.pricePoints,
        //   }),
        // )

        return {
          params,
          rawParams,
          minBaseAmount,
          minQuoteAmount,
          minProvision,
          distribution,
          isValid,
        }
      } catch (e) {
        console.error(e)
        return null
      }
    },
    enabled: !!book?.midPrice,
    meta: {
      error: "Unable to retrieve kandel estimation",
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}
