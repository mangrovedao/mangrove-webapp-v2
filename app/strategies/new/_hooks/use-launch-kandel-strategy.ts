import { GeometricKandelDistribution } from "@mangrovedao/mangrove.js"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import useKandel from "@/app/strategies/(list)/_providers/kandel-strategies"

import useMangrove from "@/providers/mangrove"
import useMarket from "@/providers/market"
import { getTitleDescriptionErrorMessages } from "@/utils/tx-error-messages"
import { DefaultStrategyLogics } from "../../(shared)/type"
import { NewStratStore } from "../_stores/new-strat.store"

type FormValues = Pick<
  NewStratStore,
  | "baseDeposit"
  | "quoteDeposit"
  | "numberOfOffers"
  | "stepSize"
  | "bountyDeposit"
> & {
  distribution: GeometricKandelDistribution | undefined
  kandelAddress: string
  baseLogic: DefaultStrategyLogics
  quoteLogic: DefaultStrategyLogics
}

export function useLaunchKandelStrategy() {
  const { market } = useMarket()
  const { mangrove } = useMangrove()

  const { kandelStrategies } = useKandel()
  const router = useRouter()

  return useMutation({
    mutationFn: async ({
      baseDeposit,
      quoteDeposit,
      distribution,
      bountyDeposit,
      stepSize,
      numberOfOffers,
      kandelAddress,
      baseLogic,
      quoteLogic,
    }: FormValues) => {
      try {
        if (!(market && kandelStrategies && distribution && mangrove)) return

        // const _baseLogic = mangrove?.getLogicByAddress(baseLogic.address)
        // const _quoteLogic = mangrove?.getLogicByAddress(quoteLogic.address)

        // if (!_quoteLogic || !_baseLogic) return

        const kandelInstance = await kandelStrategies.instance({
          address: kandelAddress,
          market,
          type: "smart",
        })

        await kandelInstance.setLogics({
          baseLogic: mangrove?.logics.simple,
          quoteLogic: mangrove?.logics.simple,
        })

        const populateTxs = await kandelInstance.populateGeometricDistribution({
          distribution,
          // depositBaseAmount: baseDeposit,
          // depositQuoteAmount: quoteDeposit,
          funds: bountyDeposit,
          parameters: {
            pricePoints: Number(numberOfOffers) + 1,
            stepSize: Number(stepSize),
          },
        })

        await Promise.all(populateTxs.map((x) => x.wait()))
        toast.success("Kandel strategy successfully launched")
        router.push("/strategies")
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
