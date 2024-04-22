import { useMutation } from "@tanstack/react-query"

import useKandel from "@/app/strategies/(list)/_providers/kandel-strategies"
import useMarket from "@/providers/market"

import useMangrove from "@/providers/mangrove"
import { getTitleDescriptionErrorMessages } from "@/utils/tx-error-messages"
import { AbstractRoutingLogic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/AbstractRoutingLogic"
import { BaseUniV3Logic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/UniV3/BaseUniV3Logic"
import { toast } from "sonner"
import { DefaultStrategyLogics } from "../../(shared)/type"

type Props = {
  kandelAddress: string
  nftPosition?: string
  baseLogic: DefaultStrategyLogics
  quoteLogic: DefaultStrategyLogics
}

export function useSetLiquiditySourcing() {
  const { market } = useMarket()
  const { kandelStrategies } = useKandel()
  const { mangrove } = useMangrove()

  return useMutation({
    mutationFn: async ({
      nftPosition,
      kandelAddress,
      baseLogic,
      quoteLogic,
    }: Props) => {
      try {
        if (
          !(market && kandelStrategies && mangrove && baseLogic && quoteLogic)
        )
          return

        // note: SDK types needs to match AbstractRoutingLogic and BaseUniV3Logics
        const _baseLogic = mangrove?.getLogicByAddress(baseLogic.address) as
          | AbstractRoutingLogic
          | BaseUniV3Logic<"monoswap">
          | BaseUniV3Logic<"monoswap">
        const _quoteLogic = mangrove?.getLogicByAddress(quoteLogic.address) as
          | AbstractRoutingLogic
          | BaseUniV3Logic<"monoswap">
          | BaseUniV3Logic<"thruster">

        console.log(baseLogic)
        if (!_quoteLogic || !_baseLogic)
          throw new Error("Could not fetch liquidity source")

        const kandelInstance = await kandelStrategies.instance({
          address: kandelAddress,
          market,
          type: "smart",
        })

        await kandelInstance.setLogics({
          // note: SDK types needs to match AbstractRoutingLogic and BaseUniV3Logics
          baseLogic: _baseLogic as AbstractRoutingLogic,
          quoteLogic: _quoteLogic as AbstractRoutingLogic,
        })

        if (_baseLogic.approvalType === "ERC721") {
          if (!nftPosition) throw new Error("No position selected.")
          await _baseLogic.setPositionToUse(Number(nftPosition))
        }

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
