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
  const [availableLogics, setAvailableLogics] =
    React.useState<(SimpleAaveLogic | SimpleLogic | undefined)[]>()

  const getPossibleLogics = async (token: Token) => {
    const usableLogics = logics.map(async (logic) => {
      if (!logic) return
      //@ts-ignore
      const canUseLogic = await logic.canUseLogicFor(token)
      if (canUseLogic) {
        return logic
      }
    })

    const resolvedLogics = await Promise.all(usableLogics)
    setAvailableLogics(resolvedLogics)
  }

  const getLogicBalance = async (token: Token, fundOwner: string) => {
    try {
      if (sendFrom === "simple") return

      const selectedLogic = logics.find(
        (logic) => logic.id === sendFrom,
      ) as SimpleAaveLogic
      //@ts-ignore
      const logicToken = await selectedLogic.overlying(token)
      const logicBalance = await selectedLogic.logic.balanceLogic(
        logicToken.address,
        fundOwner,
      )

      setBalanceLogic({
        formatted: logicBalance.toNumber().toFixed(4),
        balance: logicBalance.toNumber(),
      })
    } catch (error) {
      toast.error("Liquidity source not available for this market.")
    }
  }

  React.useEffect(() => {
    if (!sendToken || !fundOwner) return
    getLogicBalance(sendToken, fundOwner)
    getPossibleLogics(sendToken)
  }, [sendFrom, sendToken, fundOwner])

  return {
    availableLogics,
    balanceLogic,
  }
}
