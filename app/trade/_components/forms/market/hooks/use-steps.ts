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
      sendToken?.address.toString(),
      mangroveChain?.ghostbook,
    ],
    queryFn: async () => {
      try {
        if (
          !marketClient?.key ||
          !user ||
          !sendAmount ||
          !sendToken ||
          !mangroveChain
        )
          throw new Error("Market order steps missing params")

        if (chain?.id !== 84532) {
          // Check and increase allowance for Ghostbook to spend user's tokens
          const allowance = await checkAllowance(
            marketClient,
            user,
            mangroveChain.ghostbook as Address,
            sendToken.address,
          )

          console.log({ allowance })
          if (allowance < parseUnits(sendAmount, sendToken.decimals)) {
            console.log("Allowance not approved")
            return [
              {
                done: false,
                step: `Approve ${sendToken?.symbol}`,
              },
            ]
          }
          console.log("Allowance approved")

          return [
            {
              done: true,
              step: `Approve ${sendToken?.symbol}`,
            },
          ]
        }

        const steps = await marketClient.getMarketOrderSteps({
          bs,
          user,
          sendAmount: parseUnits(sendAmount, sendToken.decimals),
        })

        return steps
      } catch (error) {
        console.error(error)
        toast.error("Error while fetching market order steps")
        return null
      }
    },
    enabled: !!marketClient?.name,
  })
}
