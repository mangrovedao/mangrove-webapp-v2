import { Token } from "@mangrovedao/mgv"
import { BS } from "@mangrovedao/mgv/lib"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { Address, parseUnits } from "viem"

import { useRegistry } from "@/hooks/ghostbook/hooks/use-registry"
import { checkAllowance } from "@/hooks/ghostbook/lib/allowance"
import { useSelectedPool } from "@/hooks/new_ghostbook/use-selected-pool"
import { useMarketClient } from "@/hooks/use-market"

type Props = {
  bs: BS
  user?: Address
  sendAmount?: string
  sendToken?: Token | null
}

export const useMarketSteps = ({ bs, user, sendAmount, sendToken }: Props) => {
  const marketClient = useMarketClient()
  const { mangroveChain } = useRegistry()
  const { selectedPool: pool } = useSelectedPool()

  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [
      "marketOrderSteps",
      bs,
      user,
      marketClient?.name,
      sendAmount,
      sendToken?.address?.toString(),
      pool?.pool,
      marketClient?.chain?.id,
    ],
    queryFn: async () => {
      try {
        // Check for required parameters
        if (!marketClient?.key || !user || !sendAmount || !sendToken) {
          throw new Error("Missing required parameters")
        }

        if (marketClient?.chain?.testnet || !pool) {
          // Base chain - get market order steps
          try {
            const steps = await marketClient.getMarketOrderSteps({
              bs,
              user,
              sendAmount: parseUnits(sendAmount, sendToken.decimals),
            })

            return steps
          } catch (stepsError) {
            console.error("Error getting market order steps:", stepsError)
            toast.error("Error fetching market order steps")
            return null
          }
        }

        try {
          // Check and increase allowance for Ghostbook to spend user's tokens
          const allowance = await checkAllowance(
            marketClient,
            user,
            mangroveChain?.ghostbook as Address,
            sendToken.address,
          )

          if (allowance < parseUnits(sendAmount, sendToken.decimals)) {
            return [
              {
                done: false,
                step: `Approve ${sendToken?.symbol}`,
              },
            ]
          }

          return [
            {
              done: true,
              step: `Approve ${sendToken?.symbol}`,
            },
          ]
        } catch (allowanceError) {
          console.error("Error checking allowance:", allowanceError)
          toast.error("Error checking token allowance")
        }
      } catch (error) {
        console.error("Unexpected error in useMarketSteps:", error)
        toast.error("Error while fetching market order steps")
        return null
      }
    },
    enabled:
      !!marketClient?.name && !!user && !!sendAmount && !!sendToken?.address,
    retry: 1, // Limit retries to avoid spamming the user with error messages
  })
}
