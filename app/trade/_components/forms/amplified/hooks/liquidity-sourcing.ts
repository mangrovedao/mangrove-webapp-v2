import { Token } from "@mangrovedao/mangrove.js"
import { SimpleAaveLogic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/SimpleAaveLogic"
import { SimpleLogic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/SimpleLogic"
import React from "react"
import { toast } from "sonner"

type Props = {
  sendFrom: string
  logics: (SimpleAaveLogic | SimpleLogic)[]
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
  const [balanceLogic, setBalanceLogic] = React.useState<BalanceLogic>()

  const getLogicBalance = async (token: Token, fundOwner: string) => {
    try {
      if (!sendFrom) return

      const selectedLogic = logics
        .filter((logic) => logic != undefined)
        .find((logic) => logic.id === sendFrom)

      if (!selectedLogic) return

      const logicToken = await selectedLogic.overlying(token)

      if (selectedLogic.id === "simple") {
        const simpleBalance = await token.balanceOf(fundOwner)
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
          formatted: logicBalance.toNumber().toFixed(logicToken.decimals),
          balance: logicBalance.toNumber(),
        })
      }
    } catch (error) {
      console.error(error)
      toast.error("Liquidity source not available for this market.")
    }
  }

  React.useEffect(() => {
    if (!sendToken || !fundOwner) return
    getLogicBalance(sendToken, fundOwner)
  }, [sendFrom, sendToken, fundOwner])

  return {
    balanceLogic,
  }
}
