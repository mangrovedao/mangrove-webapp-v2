import { GeometricKandelDistribution } from "@mangrovedao/mangrove.js"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import useKandel from "@/app/strategies/(list)/_providers/kandel-strategies"

import useMangrove from "@/providers/mangrove"
import useMarket from "@/providers/market.new"
import { getTitleDescriptionErrorMessages } from "@/utils/tx-error-messages"
import { Address } from "viem"
import { useAccount } from "wagmi"
import useKandelInstance from "../../(shared)/_hooks/use-kandel-instance"
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

export function useLaunchKandelStrategy(kandelAddress: string) {
  const { address } = useAccount()

  const { currentMarket: market } = useMarket()
  const { mangrove } = useMangrove()

  const { kandelStrategies } = useKandel()
  const router = useRouter()

  const kandelClient = useKandelInstance({
    address: kandelAddress,
    base: market?.base.address,
    quote: market?.quote.address,
  })

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
        if (
          !(
            market &&
            kandelStrategies &&
            distribution &&
            mangrove &&
            kandelClient
          )
        )
          return

        const { request } = await kandelClient.simulatePopulate({
          baseQuoteTickIndex0: BigInt(distribution.baseQuoteTickIndex0),
          baseQuoteTickOffset: BigInt(distribution.baseQuoteTickOffset),
          firstAskIndex: BigInt(distribution.firstAskIndex),
          bidGives: BigInt(distribution?.bidGives?.toString() || 0n),
          askGives: BigInt(distribution.askGives?.toString() || 0n),
          baseAmount: BigInt(baseDeposit),
          quoteAmount: BigInt(quoteDeposit),
          stepSize: BigInt(stepSize),
          pricePoints: BigInt(numberOfOffers),
          gasreq: 222n,
          account: address as Address,
        })

        // const _baseLogic = mangrove?.getLogicByAddress(baseLogic.address)
        // const _quoteLogic = mangrove?.getLogicByAddress(quoteLogic.address)

        // if (!_quoteLogic || !_baseLogic) return

        // const kandelInstance = await kandelStrategies.instance({
        //   address: kandelAddress,
        //   market,
        //   type: "smart",
        // })

        // await kandelInstance.setLogics({
        //   baseLogic: mangrove?.logics.simple,
        //   quoteLogic: mangrove?.logics.simple,
        // })

        // const populateTxs = await kandelInstance.populateGeometricDistribution({
        //   distribution,
        //   // depositBaseAmount: baseDeposit,
        //   // depositQuoteAmount: quoteDeposit,
        //   funds: bountyDeposit,
        //   parameters: {
        //     pricePoints: Number(numberOfOffers) + 1,
        //     stepSize: Number(stepSize),
        //   },
        // })

        // await Promise.all(populateTxs.map((x) => x.wait()))
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
