import useMangrove from "@/providers/mangrove"
import useMarket from "@/providers/market"
import { Token } from "@mangrovedao/mangrove.js"
import { SimpleAaveLogic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/SimpleAaveLogic"
import { SimpleLogic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/SimpleLogic"
import React from "react"
import { toast } from "sonner"

type Props = {
  sendFrom: string
  logics: (SimpleAaveLogic | SimpleLogic | undefined)[]
  fundOwner?: string
  sendToken?: Token
}

type BalanceLogic = {
  formatted: string
  balance: number
}

export default function liquiditySourcing({
  sendToken,
  sendFrom,
  logics,
  fundOwner,
}: Props) {
  const { market } = useMarket()
  const { mangrove } = useMangrove()
  const [balanceLogic, setBalanceLogic] = React.useState<BalanceLogic>()

  const getMinVolume = async () => {
    if (!market || !mangrove || !sendToken) return

    const ba = market.base.id === sendToken.id ? "bids" : "asks"

    const offerGasreq = 300_000
    const semibok = market.getSemibook("asks")
    const minVolume = semibok.getMinimumVolume(offerGasreq)

    // const minVolume = await mangrove.readerContract.minVolume(
    //   market.getOLKey(ba),
    //   offerGasreq,
    // )

    console.log(
      "MinVolume",
      Number(minVolume).toFixed(sendToken.displayedDecimals),
      ba,
    )
  }

  const getLogicBalance = async (token: Token, fundOwner: string) => {
    try {
      if (!sendFrom) return

      const selectedLogic = logics
        .filter((logic) => logic != undefined)
        .find((logic) => logic?.id === sendFrom)

      if (!selectedLogic) return

      const logicToken = await selectedLogic.overlying(token)

      if (selectedLogic.id === "simple") {
        const simpleBalance = await logicToken.balanceOf(fundOwner)

        setBalanceLogic({
          formatted: simpleBalance.toFixed(token.decimals),
          balance: simpleBalance.toNumber(),
        })
      } else {
        const logicBalance = await selectedLogic.logic.balanceLogic(
          logicToken.address,
          fundOwner,
        )

        setBalanceLogic({
          formatted: logicBalance
            .toNumber()
            .toFixed(logicToken.displayedDecimals),
          balance: logicBalance.toNumber(),
        })
      }
    } catch (error) {
      console.error(error)
      toast.error("Could not fetch token balance.")
    }
  }

  React.useEffect(() => {
    if (!sendToken || !fundOwner) return
    getLogicBalance(sendToken, fundOwner)
    getMinVolume()
  }, [sendFrom, sendToken, fundOwner])

  return {
    balanceLogic,
  }
}
