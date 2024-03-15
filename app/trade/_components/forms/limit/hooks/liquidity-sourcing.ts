import { Token } from "@mangrovedao/mangrove.js"
import React from "react"
import { DefaultLogics } from "../../types"

type Props = {
  sendFrom: string
  receiveTo: string
  logics: DefaultLogics[]
  fundOwner?: string
  sendToken?: Token
  receiveToken?: Token
}

type BalanceLogic = {
  formatted: string
  balance: number
}

// export function useAbleToken(
//   logic: DefaultLogics,
//   token: Token,
// ) {
//   return useQuery({
//     queryKey: ["availableLogic"],
//     queryFn: async () => {
//       return await logic?.overlying(token)
//     },

//     enabled: !!(logic && token),
//   })
// }

export default function liquiditySourcing({
  sendToken,
  receiveToken,
  sendFrom,
  receiveTo,
  logics,
  fundOwner,
}: Props) {
  const [sendFromBalance, setSendFromBalance] = React.useState<
    BalanceLogic | undefined
  >()
  const [receiveToBalance, setReceiveToBalance] = React.useState<
    BalanceLogic | undefined
  >()

  const [sendFromLogics, setSendFromLogics] = React.useState<DefaultLogics[]>()

  const [receiveToLogics, setReceiveToLogics] =
    React.useState<DefaultLogics[]>()

  const getSendFromLogics = async (token: Token) => {
    const usableLogics = logics.map(async (logic) => {
      try {
        if (!logic) return
        const logicToken = await logic.overlying(token)
        // const isUsable = useAbleToken(logic, token).data
        if (logicToken) {
          return logic
        }
      } catch (error) {
        // if the logic is not available for the token, we catch the error and return
        return
      }
    })
    const resolvedLogics = await Promise.all(usableLogics)
    setSendFromLogics(resolvedLogics)
  }

  const getReceiveToLogics = async (token: Token) => {
    const usableLogics = logics.map(async (logic) => {
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
    setReceiveToLogics(resolvedLogics)
  }

  const getSendBalance = async (token: Token, fundOwner: string) => {
    try {
      if (sendFrom === "simple") {
        setSendFromBalance(undefined)
        return
      }

      const selectedLogic = logics.find((logic) => logic?.id === sendFrom)

      if (!selectedLogic) return

      const logicBalance = await selectedLogic.balanceOfFromLogic(
        token,
        fundOwner,
      )

      setSendFromBalance({
        formatted: logicBalance
          .toNumber()
          .toFixed(sendToken?.displayedDecimals),
        balance: logicBalance.toNumber(),
      })
    } catch (error) {
      return
    }
  }

  const getReceiveBalance = async (token: Token, fundOwner: string) => {
    try {
      if (receiveTo === "simple") {
        setReceiveToBalance(undefined)
        return
      }
      const selectedLogic = logics.find((logic) => logic?.id === receiveTo)

      if (!selectedLogic) return

      const logicBalance = await selectedLogic.balanceOfFromLogic(
        token,
        fundOwner,
      )

      setReceiveToBalance({
        formatted: logicBalance
          .toNumber()
          .toFixed(receiveToken?.displayedDecimals),
        balance: logicBalance.toNumber(),
      })
    } catch (error) {
      return
    }
  }

  React.useEffect(() => {
    if (!receiveToken || !receiveTo || !fundOwner) return
    getReceiveBalance(receiveToken, fundOwner)
    getReceiveToLogics(receiveToken)
  }, [receiveTo, receiveToken, fundOwner])

  React.useEffect(() => {
    if (!sendFrom || !sendToken || !fundOwner) return
    getSendBalance(sendToken, fundOwner)
    getSendFromLogics(sendToken)
  }, [sendFrom, sendToken, fundOwner])

  return {
    sendFromLogics,
    receiveToLogics,
    sendFromBalance,
    receiveToBalance,
  }
}
