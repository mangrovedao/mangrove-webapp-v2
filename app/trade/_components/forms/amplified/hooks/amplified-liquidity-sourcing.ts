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

  const getSendFromLogics = async (token: Token) => {
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
    if (!receiveToken || !receiveTo || !fundOwner) return
    // getReceiveToLogics(receiveToken)
  }, [receiveTo, receiveToken, fundOwner])

  React.useEffect(() => {
    getPossibleLogicsForToken()
    if (!sendFrom || !sendToken || !fundOwner) return
    getSendBalance(sendToken, fundOwner)
    // getSendFromLogics(sendToken)
  }, [sendFrom, sendToken, fundOwner])

  return {
    sendFromLogics,
    receiveToLogics,
    sendFromBalance,
    useAbleTokens,
  }
}
