import { marketOrderSimulation, type Token } from "@mangrovedao/mgv"
import { BS } from "@mangrovedao/mgv/lib"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { Address, formatUnits, parseUnits, zeroAddress } from "viem"
import { useAccount } from "wagmi"

import { useRegistry } from "@/hooks/ghostbook/hooks/use-registry"
import { checkAllowance } from "@/hooks/ghostbook/lib/allowance"
import { useMergedBooks } from "@/hooks/new_ghostbook/book"
import { usePool } from "@/hooks/new_ghostbook/pool"
import { useOdos } from "@/hooks/odos/use-odos"
import { useBook } from "@/hooks/use-book"
import { useNetworkClient } from "@/hooks/use-network-client"
import useMarket from "@/providers/market"
import { getErrorMessage } from "@/utils/errors"
import { priceSchema, SwapSimulationResult } from "../utils/swap-types"

// Hook to simulate the swap and get quotes
export function useSwapSimulation({
  payToken,
  receiveToken,
  payValue,
  marketClient,
  isMangrove = true,
  slippage,
}: {
  payToken?: Token
  receiveToken?: Token
  payValue: string
  marketClient?: any
  isMangrove?: boolean
  slippage: string
}) {
  const { address, chainId } = useAccount()
  const { mergedBooks: book } = useMergedBooks()
  const { book: oldBook } = useBook()
  const { currentMarket } = useMarket()
  const { mangroveChain } = useRegistry()
  const { pool } = usePool()
  const { getQuote, hasToApproveOdos } = useOdos()

  return useQuery({
    queryKey: [
      "marketOrderSimulation",
      payToken?.address,
      receiveToken?.address,
      currentMarket?.base.address,
      currentMarket?.quote.address,
      slippage,
      payValue,
      payValue,
      marketClient?.key,
      address,
    ],
    queryFn: async (): Promise<SwapSimulationResult | null> => {
      if (!(payToken && receiveToken)) return null

      if (!payValue || Number(payValue) <= 0) return null

      const payAmount = parseUnits(payValue, payToken.decimals)

      // Mangrove
      if (marketClient && isMangrove) {
        if (!book) return null

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

        // Determine if user is buying or selling the base token based on pay/receive tokens
        const isBuyingBase =
          currentMarket?.base.address.toLowerCase() ===
          receiveToken.address.toLowerCase()
        const isSendingBase =
          currentMarket?.base.address.toLowerCase() ===
          payToken.address.toLowerCase()

        const isBasePay = currentMarket?.base.address === payToken?.address

        const params = isBasePay
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
          // Base chain - get market order steps
          try {
            const [approvalStep] = await marketClient.getMarketOrderSteps({
              bs: isBuyingBase ? BS.buy : BS.sell,
              user: address,
              sendAmount: payAmount,
            })

            approveStep = approvalStep
          } catch (stepsError) {
            console.error("Error getting market order steps:", stepsError)
            toast.error("Error fetching market order steps")
            return null
          }
        } else {
          try {
            // Check and increase allowance for Ghostbook to spend user's tokens
            const allowance = await checkAllowance(
              marketClient,
              address || zeroAddress,
              mangroveChain?.ghostbook as Address,
              payToken.address,
            )

            if (allowance < payAmount) {
              approveStep = {
                done: false,
                step: `Approve ${payToken?.symbol}`,
              }
            } else {
              approveStep = {
                done: true,
                step: `Approve ${payToken?.symbol}`,
              }
            }
          } catch (allowanceError) {
            console.error("Error checking allowance:", allowanceError)
            toast.error("Error checking token allowance")
            return null
          }
        }

        return {
          simulation,
          approvalStep: approveStep,
          receiveValue: formatUnits(
            isSendingBase ? simulation.quoteAmount : simulation.baseAmount,
            receiveToken?.decimals ?? 18,
          ),
        }
      }

      // Odos
      if (!isMangrove) {
        try {
          const simulation = await getQuote({
            chainId,
            inputTokens: [
              { tokenAddress: payToken?.address, amount: payAmount.toString() },
            ],
            outputTokens: [
              { tokenAddress: receiveToken?.address, proportion: 1 },
            ],
            userAddr: address || zeroAddress,
            slippageLimitPercent: Number(slippage),
          })

          const hasToApprove = await hasToApproveOdos({
            address: payToken?.address,
            amount: simulation.baseAmount,
          })

          return {
            simulation,
            approvalStep: { done: !hasToApprove },
            receiveValue: formatUnits(
              simulation.quoteAmount,
              receiveToken?.decimals ?? 18,
            ),
          }
        } catch (error) {
          console.error("Odos quote error:", error)
          return null
        }
      }

      return null
    },
    refetchInterval: 7_000,
    enabled:
      !!payToken &&
      !!receiveToken &&
      !!payValue &&
      Number(payValue) > 0 &&
      (!marketClient || !!book),
  })
}

// Hook to fetch token prices in USD
export function useTokenPrices(
  payTknAddress?: string,
  receiveTknAddress?: string,
) {
  const { chainId } = useAccount()
  const publicClient = useNetworkClient()

  return useQuery({
    queryKey: ["getMarketPrice", payTknAddress, receiveTknAddress],
    queryFn: async () => {
      try {
        if (publicClient.chain?.testnet) return null

        if (!chainId || !payTknAddress || !receiveTknAddress) return null

        const payDollar = await fetch(
          `https://price.mgvinfra.com/price-by-address?chain=${chainId}&address=${payTknAddress}`,
        )
          .then((res) => res.json())
          .then((data) => priceSchema.parse(data))

        const receiveDollar = await fetch(
          `https://price.mgvinfra.com/price-by-address?chain=${chainId}&address=${receiveTknAddress}`,
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
    enabled: !!payTknAddress && !!receiveTknAddress,
  })
}
