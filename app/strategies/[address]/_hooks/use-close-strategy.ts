import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { TRADE } from "@/app/trade/_constants/loading-keys"
import { useResolveWhenBlockIsIndexed } from "@/hooks/use-resolve-when-block-is-indexed"
import { useTokenFromAddress } from "@/hooks/use-token-from-address"
import { useLoadingStore } from "@/stores/loading.store"
import { Address, BaseError, ContractFunctionExecutionError } from "viem"
import { useAccount, usePublicClient, useWalletClient } from "wagmi"
import useStrategyStatus from "../../(shared)/_hooks/use-strategy-status"
import { useStrategy } from "./use-strategy"

type Props = {
  strategyAddress?: string
}

export function useCloseStrategy({ strategyAddress }: Props) {
  const router = useRouter()
  const { address: account } = useAccount()
  const queryClient = useQueryClient()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const strategyQuery = useStrategy({
    strategyAddress: strategyAddress as string,
  })
  const { data: baseToken } = useTokenFromAddress(
    strategyQuery.data?.base as Address,
  )
  const { data: quoteToken } = useTokenFromAddress(
    strategyQuery.data?.quote as Address,
  )
  const { data: strategy } = useStrategyStatus({
    address: strategyAddress,
    base: baseToken?.symbol,
    quote: quoteToken?.symbol,
    offers: strategyQuery.data?.offers,
  })

  const resolveWhenBlockIsIndexed = useResolveWhenBlockIsIndexed()
  const [startLoading, stopLoading] = useLoadingStore((state) => [
    state.startLoading,
    state.stopLoading,
  ])

  return useMutation({
    mutationFn: async () => {
      try {
        if (!strategyAddress || !strategy) return

        const { kandelInstance, kandelState } = strategy
        if (!kandelInstance || !account || !walletClient || !publicClient)
          return
        console.log(kandelState, account)
        const { request } = await kandelInstance.simulateRetract({
          to: BigInt(kandelState?.pricePoints || 0),
          baseAmount: kandelState?.baseAmount,
          quoteAmount: kandelState?.quoteAmount,
          // both of these addresses are suppoesedly the same
          recipient: account,
          //@ts-ignore
          // from: strategyAddress,
          account: account,
        })

        const hash = await walletClient.writeContract(request)
        const receipt = await publicClient.waitForTransactionReceipt({
          hash,
        })

        toast.success("Strategy has reset with success")
        return { receipt }
      } catch (error) {
        if (error instanceof BaseError) {
          const revertError = error.walk(
            (error) => error instanceof ContractFunctionExecutionError,
          )
          console.log(revertError)
          if (revertError instanceof ContractFunctionExecutionError) {
            console.log({ ...revertError.args })
            console.log(
              revertError.cause,
              revertError.message,
              revertError.functionName,
              revertError.formattedArgs,
              revertError.details,
            )
          }
        }
      }
    },
    meta: {
      error: "Failed to close strategy",
    },
    onSuccess: async (data) => {
      if (!data) return
      const { receipt } = data
      /*
       * We use a custom callback to handle the success message once it's ready.
       * This is because the onSuccess callback from the mutation will only be triggered
       * after all the preceding logic has been executed.
       */

      try {
        queryClient.invalidateQueries({ queryKey: ["strategies"] })
      } catch (error) {
        console.error(error)
      }

      return setTimeout(() => {
        router.push("/strategies")
      }, 5000)
    },
    onError(error, variables, context) {
      console.error(error)
    },
    onSettled: () => {
      stopLoading([TRADE.TABLES.ORDERS, TRADE.TABLES.FILLS])
    },
  })
}
