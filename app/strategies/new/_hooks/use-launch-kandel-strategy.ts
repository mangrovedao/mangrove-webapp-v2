import { GeometricKandelDistribution } from "@mangrovedao/mangrove.js"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import useKandel from "@/app/strategies/(list)/_providers/kandel-strategies"
import { DefaultLogics } from "@/app/trade/_components/forms/types"
import useMangrove from "@/providers/mangrove"
import useMarket from "@/providers/market"
import { getTitleDescriptionErrorMessages } from "@/utils/tx-error-messages"
import { NewStratStore } from "../_stores/new-strat.store"

type FormValues = Pick<
  NewStratStore,
  "baseDeposit" | "quoteDeposit" | "pricePoints" | "stepSize" | "bountyDeposit"
> & {
  distribution: GeometricKandelDistribution | undefined
  kandelAddress: string
  baseLogic: DefaultLogics
  quoteLogic: DefaultLogics
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
      pricePoints,
      kandelAddress,
      baseLogic,
      quoteLogic,
    }: FormValues) => {
      try {
        if (!(market && kandelStrategies && distribution)) return

        // const _baseLogic = mangrove?.getLogicByAddress(baseLogic.address)
        // const _quoteLogic = mangrove?.getLogicByAddress(quoteLogic.address)

        // if (!_quoteLogic || !_baseLogic) return

        const kandelInstance = await kandelStrategies.instance({
          address: kandelAddress,
          market,
          type: "smart",
        })

        // console.log("setting logic...")

        // await kandelInstance.setLogics({
        //   baseLogic: _baseLogic,
        //   quoteLogic: _quoteLogic,
        // })

        const populateTxs = await kandelInstance.populateGeometricDistribution({
          distribution,
          // depositBaseAmount: baseDeposit,
          // depositQuoteAmount: quoteDeposit,
          funds: bountyDeposit,
          parameters: {
            pricePoints: Number(pricePoints),
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
