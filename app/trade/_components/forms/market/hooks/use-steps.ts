import { Token } from "@mangrovedao/mgv"
import { BS } from "@mangrovedao/mgv/lib"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { Address, parseUnits } from "viem"

import { useRegistry } from "@/hooks/ghostbook/hooks/use-registry"
import { checkAllowance } from "@/hooks/ghostbook/lib/allowance"
import { useMarketClient } from "@/hooks/use-market"
import { useAccount } from "wagmi"

type Props = {
  bs: BS
  user?: Address
  sendAmount?: string
  sendToken?: Token | null
}

export const useMarketSteps = ({ bs, user, sendAmount, sendToken }: Props) => {
  const marketClient = useMarketClient()
  const { chain } = useAccount()
  const { mangroveChain } = useRegistry()

  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [
      "marketOrderSteps",
      bs,
      user,
      marketClient?.name,
      sendAmount,
      sendToken?.address?.toString(),
      mangroveChain?.ghostbook,
    ],
    queryFn: async () => {
      try {
        // Check for required parameters
        if (!marketClient?.key) {
          console.warn("Market client key is missing")
          return null
        }

        if (!user) {
          console.warn("User address is missing")
          return null
        }

        if (!sendAmount || sendAmount === "0" || sendAmount === "") {
          console.warn("Send amount is missing or zero")
          return null
        }

        if (!sendToken) {
          console.warn("Send token is missing")
          return null
        }

        if (!mangroveChain) {
          console.warn("Mangrove chain is missing")
          return null
        }

        // Base case - handle non-Base chain
        if (chain?.id !== 84532) {
          try {
            // Check and increase allowance for Ghostbook to spend user's tokens
            const allowance = await checkAllowance(
              marketClient,
              user,
              mangroveChain.ghostbook as Address,
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
            return null
          }
        }

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
      } catch (error) {
        console.error("Unexpected error in useMarketSteps:", error)
        toast.error("Error while fetching market order steps")
        return null
      }
    },
    enabled:
      !!marketClient?.name &&
      !!user &&
      !!sendAmount &&
      !!sendToken?.address &&
      !!mangroveChain?.ghostbook,
    retry: 1, // Limit retries to avoid spamming the user with error messages
  })
}
