import { Token } from "@mangrovedao/mgv"
import React from "react"
import { DefaultTradeLogics } from "../../types"

type Props = {
  sendFrom?: string
  logics: DefaultTradeLogics[]
  fundOwner?: string
  sendToken?: Token
  availableTokens?: Token[]
}

type BalanceLogic = {
  formatted: string
  balance: number
}

export default function amplifiedLiquiditySourcing({
  sendToken,
  sendFrom,
  logics,
  fundOwner,
  availableTokens,
}: Props) {
  const [sendFromBalance, setSendFromBalance] = React.useState<
    BalanceLogic | undefined
  >()

  const [useAbleTokens, setUseAbleTokens] = React.useState<
    (Token | undefined)[]
  >([])

  const getPossibleLogicsForToken = async () => {
    if (!availableTokens) return
    const tokenToTest = availableTokens.map(async (token) => {
      if (sendFrom !== "simple") {
        try {
          // const selectedLogic = logics.find((logic) => logic?.id === sendFrom)
          // await selectedLogic?.overlying(token)
          return token
        } catch (error) {
          return
        }
      } else {
        return token
      }
    })

    const usableTokens = await Promise.all(tokenToTest)
    setUseAbleTokens(usableTokens)
  }

  const getSendBalance = async (token: Token, fundOwner: string) => {
    try {
      if (sendFrom === "simple") {
        setSendFromBalance(undefined)
        return
      }

      const selectedLogic = logics.find((logic) => logic?.id === sendFrom)

      if (!selectedLogic) return

      // const logicBalance = await selectedLogic.balanceOfFromLogic(
      //   token,
      //   fundOwner,
      // )

      setSendFromBalance({
        formatted: "",
        balance: 0,
      })
    } catch (error) {
      return
    }
  }

  React.useEffect(() => {
    getPossibleLogicsForToken()
    if (!sendFrom || !sendToken || !fundOwner) return
    getSendBalance(sendToken, fundOwner)
  }, [sendFrom, sendToken, fundOwner])

  return {
    sendFromBalance,
    useAbleTokens,
  }
}
