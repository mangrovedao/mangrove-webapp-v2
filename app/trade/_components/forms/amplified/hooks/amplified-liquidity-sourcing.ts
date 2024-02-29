import { Token } from "@mangrovedao/mangrove.js"
import { OrbitLogic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/OrbitLogic"
import { SimpleAaveLogic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/SimpleAaveLogic"
import { SimpleLogic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/SimpleLogic"
import React from "react"

type Props = {
  sendFrom: string
  receiveTo: string[]
  logics: (SimpleLogic | SimpleAaveLogic | OrbitLogic | undefined)[]
  fundOwner?: string
  sendToken?: Token
  receiveToken?: Token
  availableTokens: Token[]
}

type BalanceLogic = {
  formatted: string
  balance: number
}

export default function liquiditySourcing({
  sendToken,
  receiveToken,
  sendFrom,
  receiveTo,
  logics,
  fundOwner,
  availableTokens,
}: Props) {
  const [sendFromBalance, setSendFromBalance] = React.useState<
    BalanceLogic | undefined
  >()

  const [sendFromLogics, setSendFromLogics] =
    React.useState<(SimpleLogic | SimpleAaveLogic | OrbitLogic | undefined)[]>()

  const [receiveToLogics, setReceiveToLogics] =
    React.useState<(SimpleLogic | SimpleAaveLogic | OrbitLogic | undefined)[]>()

  const [useAbleTokens, setUseAbleTokens] = React.useState<
    (Token | undefined)[]
  >([])

  const getPossibleLogicsForToken = async () => {
    const tokenToTest = availableTokens.map(async (token) => {
      if (sendFrom !== "simple") {
        try {
          const selectedLogic = logics.find((logic) => logic?.id === sendFrom)
          await selectedLogic?.overlying(token)
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

      const selectedLogic = logics.find((logic) => logic?.id === sendFrom) as
        | SimpleAaveLogic
        | OrbitLogic

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

  React.useEffect(() => {
    getPossibleLogicsForToken()
    if (!sendFrom || !sendToken || !fundOwner) return
    getSendBalance(sendToken, fundOwner)
  }, [sendFrom, sendToken, fundOwner])

  return {
    sendFromLogics,
    receiveToLogics,
    sendFromBalance,
    useAbleTokens,
  }
}
