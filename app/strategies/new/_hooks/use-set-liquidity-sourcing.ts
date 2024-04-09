import { useMutation } from "@tanstack/react-query"

import useKandel from "@/app/strategies/(list)/_providers/kandel-strategies"
import useMarket from "@/providers/market"

import useMangrove from "@/providers/mangrove"
import { getTitleDescriptionErrorMessages } from "@/utils/tx-error-messages"
import { toast } from "sonner"
import { DefaultStrategyLogics } from "../../(shared)/type"

type Props = {
  kandelAddress: string
  baseLogic: DefaultStrategyLogics
  quoteLogic: DefaultStrategyLogics
}

export function useSetLiquiditySourcing() {
  const { market } = useMarket()
  const { kandelStrategies } = useKandel()
  const { mangrove } = useMangrove()

  return useMutation({
    mutationFn: async ({ kandelAddress, baseLogic, quoteLogic }: Props) => {
      try {
        if (
          !(market && kandelStrategies && mangrove && baseLogic && quoteLogic)
        )
          return

        const _baseLogic = mangrove?.getLogicByAddress(baseLogic.address)
        const _quoteLogic = mangrove?.getLogicByAddress(quoteLogic.address)

        if (!_quoteLogic || !_baseLogic)
          throw new Error("Could not fetch liquidity source")

        const kandelInstance = await kandelStrategies.instance({
          address: kandelAddress,
          market,
          type: "smart",
        })

        await kandelInstance.setLogics({
          baseLogic: _baseLogic,
          quoteLogic: _quoteLogic,
        })

        toast.success("Strategy liquidity sourcing has been set successfully.")
      } catch (error) {
        const { description } = getTitleDescriptionErrorMessages(error as Error)
        toast.error(description)
        console.error(error)
        throw new Error(description)
      }
    },
    meta: { disableGenericError: true },
  })
}
