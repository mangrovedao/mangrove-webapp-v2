import { Token } from "@mangrovedao/mangrove.js"
import React from "react"
import { DefaultStrategyLogics } from "../type"

type Props = {
  sendFrom?: string
  receiveTo?: string
  mangroveLogics: DefaultStrategyLogics[]
  fundOwner?: string
  sendToken?: Token
  receiveToken?: Token
}

type BalanceLogic = {
  formatted: string
  balance: number
}

// export function useAbleToken(logic: DefaultStrategyLogics, token: Token) {
//   return useQuery({
//     queryKey: ["availableLogic"],
//     queryFn: async () => {
//       return await logic?.overlying(token)
//     },

//     enabled: !!(logic && token),
//   }).data
// }

export default function useLiquiditySourcing({
  sendToken,
  receiveToken,
  sendFrom,
  receiveTo,
  mangroveLogics,
  fundOwner,
}: Props) {
  const [sendFromBalance, setSendFromBalance] = React.useState<
    BalanceLogic | undefined
  >()
  const [receiveToBalance, setReceiveToBalance] = React.useState<
    BalanceLogic | undefined
  >()
  const [sendFromLogics, setSendFromLogics] =
    React.useState<DefaultStrategyLogics[]>()
  const [receiveToLogics, setReceiveToLogics] =
    React.useState<DefaultStrategyLogics[]>()

  const getLogics = async (
    token: Token,
    setLogics: (logics: DefaultStrategyLogics[]) => void,
  ) => {
    const usableLogics = mangroveLogics.map(async (logic) => {
      try {
        if (!logic) return
        const logicToken = await logic.overlying(token)
        if (logicToken) {
          return logic
        }
      } catch (error) {
        // if the logic is not available for the token, we catch the error and return
        return
      }
    })
    const resolvedLogics = await Promise.all(usableLogics)
    setLogics(resolvedLogics)
  }

  const getBalance = async (
    token: Token,
    fundOwner: string,
    setBalance: (logics: BalanceLogic | undefined) => void,
    logicId?: string,
  ) => {
    try {
      if (logicId === "simple") {
        setBalance(undefined)
        return
      }

      const selectedLogic = mangroveLogics.find(
        (logic) => logic?.id === logicId,
      )
      if (!selectedLogic) return
      const logicBalance = await selectedLogic.balanceOfFromLogic(
        token,
        fundOwner,
      )

      setBalance({
        formatted: logicBalance.toNumber().toFixed(token?.displayedDecimals),
        balance: logicBalance.toNumber(),
      })
    } catch (error) {
      setBalance(undefined)
      return
    }
  }

  React.useEffect(() => {
    if (!sendToken || !receiveToken) return
    getLogics(receiveToken, setReceiveToLogics)
    getLogics(sendToken, setSendFromLogics)
  }, [sendToken, receiveToken, fundOwner])

  React.useEffect(() => {
    if (!sendToken || !fundOwner) return
    getBalance(sendToken, fundOwner, setSendFromBalance, sendFrom)
  }, [sendFrom, sendToken, fundOwner])

  React.useEffect(() => {
    if (!receiveToken || !fundOwner) return
    getBalance(receiveToken, fundOwner, setReceiveToBalance, receiveTo)
  }, [receiveTo, receiveToken, fundOwner])

  return {
    sendFromLogics,
    receiveToLogics,
    sendFromBalance,
    receiveToBalance,
  }
}
