import { RawKandelParams, validateKandelParams } from "@mangrovedao/mgv"
import { useQuery } from "@tanstack/react-query"
import { useKandelBook } from "./use-kandel-book"
import useKandelMarket from "./use-kandel-market"

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
  const currentMarket = useKandelMarket()
  const { book } = useKandelBook()

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
          deposit: true,
        })

        // @ts-ignore
        BigInt.prototype.toJSON = function () {
          return this.toString()
        }

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
