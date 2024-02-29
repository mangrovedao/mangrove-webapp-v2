import { Token } from "@mangrovedao/mangrove.js"
import { OrbitLogic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/OrbitLogic"
import { SimpleAaveLogic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/SimpleAaveLogic"
import { SimpleLogic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/SimpleLogic"
import React from "react"

type Props = {
  sendFrom: string
  receiveTo: string
  logics: (SimpleLogic | SimpleAaveLogic | OrbitLogic | undefined)[]
  fundOwner?: string
  sendToken?: Token
  receiveToken?: Token
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
}: Props) {
  const [sendFromBalance, setSendFromBalance] = React.useState<
    BalanceLogic | undefined
  >()
  const [receiveToBalance, setReceiveToBalance] = React.useState<
    BalanceLogic | undefined
  >()

  const [sendFromLogics, setSendFromLogics] =
    React.useState<(SimpleLogic | SimpleAaveLogic | OrbitLogic | undefined)[]>()

  const [receiveToLogics, setReceiveToLogics] =
    React.useState<(SimpleLogic | SimpleAaveLogic | OrbitLogic | undefined)[]>()

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

  const getReceiveBalance = async (token: Token, fundOwner: string) => {
    try {
      if (receiveTo === "simple") {
        setReceiveToBalance(undefined)
        return
      }
      const selectedLogic = logics.find((logic) => logic?.id === receiveTo) as
        | SimpleAaveLogic
        | OrbitLogic

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
