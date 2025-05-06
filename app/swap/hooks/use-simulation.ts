import {
  marketOrderSimulation,
  type MarketOrderSimulationParams,
} from "@mangrovedao/mgv"
import { BS } from "@mangrovedao/mgv/lib"
import { useQuery } from "@tanstack/react-query"
import { Address, formatUnits, parseUnits } from "viem"
import { useAccount, useBalance } from "wagmi"

import { checkAllowance } from "@/hooks/ghostbook/lib/allowance"
import { useMergedBooks } from "@/hooks/new_ghostbook/book"
import { useBook } from "@/hooks/use-book"
import { getErrorMessage } from "@/utils/errors"
import { type Token } from "@mangrovedao/mgv"
import { z } from "zod"

const priceSchema = z.object({
  price: z.number(),
  id: z.optional(z.string()),
  symbol: z.optional(z.string()),
  name: z.optional(z.string()),
})

export function useSimulation({
  payToken,
  receiveToken,
  marketClient,
  currentMarket,
  fields,
  slippage,
  pool,
  spender,
}: {
  payToken?: Token
  receiveToken?: Token
  marketClient: any
  currentMarket: any
  fields: { payValue: string; receiveValue: string }
  slippage: string
  pool: any
  spender: Address | undefined
}) {
  const { address, isConnected, chainId, chain } = useAccount()
  const { book: oldBook } = useBook()
  const { mergedBooks: book } = useMergedBooks({ contextMarket: currentMarket })
  const { data: ethBalance } = useBalance({
    address,
  })

  const simulateQuery = useQuery({
    queryKey: [
      "marketOrderSimulation",
      payToken?.address,
      receiveToken?.address,
      currentMarket?.base.address,
      currentMarket?.quote.address,
      slippage,
      fields.payValue,
      marketClient?.key,
      address,
    ],
    queryFn: async () => {
      if (!(payToken && receiveToken && isConnected)) return null

      const payAmount = parseUnits(fields.payValue, payToken.decimals)

      // Mangrove
      if (marketClient) {
        if (!(book && address)) return null

        // Convert EnhancedOffer arrays to the format expected by marketOrderSimulation
        const simulationBook = {
          ...book,
          asksConfig: oldBook?.asksConfig,
          bidsConfig: oldBook?.bidsConfig,
          marketConfig: oldBook?.marketConfig,
          midPrice: oldBook?.midPrice,
          spread: oldBook?.spread,
          spreadPercent: oldBook?.spreadPercent,
        }

        console.log({ simulationBook })

        const isBasePay = currentMarket?.base.address === payToken?.address
        console.log({ isBasePay })
        const params: MarketOrderSimulationParams = isBasePay
          ? {
              base: payAmount,
              bs: BS.sell,
              book: simulationBook as any,
            }
          : {
              quote: payAmount,
              bs: BS.buy,
              book: simulationBook as any,
            }

        const simulation = marketOrderSimulation(params)

        let approveStep = null
        if (marketClient?.chain?.testnet || !pool) {
          try {
            const [approvalStep] = await marketClient.getMarketOrderSteps({
              bs: isBasePay ? BS.sell : BS.buy,
              user: address,
              sendAmount: payAmount,
            })

            approveStep = approvalStep
          } catch (stepsError) {
            console.error("Error getting market order steps:", stepsError)
            return null
          }
        }

        try {
          // Check and increase allowance for Ghostbook to spend user's tokens
          const allowance = await checkAllowance(
            marketClient,
            address,
            spender as Address,
            payToken.address,
          )

          if (allowance < payAmount) {
            approveStep = {
              params: {
                token: payToken,
                spender: spender as Address,
              },
              done: false,
              step: `Approve ${payToken?.symbol}`,
            }
          } else {
            approveStep = {
              params: {
                token: payToken,
                spender: spender as Address,
              },
              done: true,
              step: `Approve ${payToken?.symbol}`,
            }
          }
        } catch (allowanceError) {
          console.error("Error checking allowance:", allowanceError)
          // In case of error, default to requiring approval to be safe
          approveStep = {
            params: {
              token: payToken,
              spender: spender as Address,
            },
            done: false,
            step: `Approve ${payToken?.symbol}`,
          }
        }

        console.log({
          simulationQuote: formatUnits(
            simulation.quoteAmount,
            currentMarket?.quote.decimals ?? 18,
          ),
          simulationBase: formatUnits(
            simulation.baseAmount,
            currentMarket?.base.decimals ?? 18,
          ),
          approveStep,
          maxTickEncountered: simulation.maxTickEncountered,
        })

        return {
          simulation,
          maxTickEncountered: simulation.maxTickEncountered,
          approvalStep: approveStep,
          receiveValue: formatUnits(
            isBasePay ? simulation.quoteAmount : simulation.baseAmount,
            receiveToken?.decimals ?? 18,
          ),
        }
      }

      return null
    },
    refetchInterval: 7_000,
    enabled:
      !!payToken &&
      !!receiveToken &&
      !!fields.payValue &&
      Number(fields.payValue) > 0 &&
      (!marketClient || (!!book && !!address)),
  })

  const getMarketPriceQuery = useQuery({
    queryKey: ["getMarketPrice", payToken?.address, receiveToken?.address],
    queryFn: async () => {
      try {
        if (!chainId || !payToken?.address || !receiveToken?.address)
          return null

        const payDollar = await fetch(
          `https://price.mgvinfra.com/price-by-address?chain=${chainId}&address=${payToken.address}`,
        )
          .then((res) => res.json())
          .then((data) => priceSchema.parse(data))

        const receiveDollar = await fetch(
          `https://price.mgvinfra.com/price-by-address?chain=${chainId}&address=${receiveToken.address}`,
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
    enabled: !!payToken && !!receiveToken,
  })

  return {
    simulateQuery,
    getMarketPriceQuery,
    hasToApprove: simulateQuery.data?.approvalStep?.done === false,
    isFieldLoading: fields.payValue !== "" && simulateQuery.isPending,
  }
}
