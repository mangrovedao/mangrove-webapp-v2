import { Token } from "@mangrovedao/mangrove.js"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"

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

export default function useLiquiditySourcing({
  sendToken,
  receiveToken,
  sendFrom,
  receiveTo,
  mangroveLogics,
  fundOwner,
}: Props) {
  const { data: sendFromBalance } = useQuery<BalanceLogic | undefined>({
    queryKey: ["sendFromBalance", sendToken?.symbol, fundOwner, sendFrom],
    queryFn: async () => {
      if (!sendToken || !fundOwner || sendFrom === "simple") {
        return undefined
      }

      const selectedLogic = mangroveLogics.find(
        (logic) => logic?.id === sendFrom,
      )
      if (!selectedLogic) return undefined

      const logicBalance = await selectedLogic.balanceOfFromLogic(
        sendToken,
        fundOwner,
      )
      if (!logicBalance) return undefined

      return {
        formatted: logicBalance
          .toNumber()
          .toFixed(sendToken?.displayedDecimals),
        balance: logicBalance.toNumber(),
      }
    },
    enabled: !!(sendToken && fundOwner && sendFrom && sendFrom !== "simple"),
  })

  const { data: receiveToBalance } = useQuery<BalanceLogic | undefined>({
    queryKey: ["receiveToBalance", receiveTo, fundOwner, receiveToken?.symbol],
    queryFn: async () => {
      if (!receiveToken || !fundOwner || receiveTo === "simple") {
        return undefined
      }

      const selectedLogic = mangroveLogics.find(
        (logic) => logic?.id === receiveTo,
      )
      if (!selectedLogic) return undefined

      let logicBalance = await selectedLogic.balanceOfFromLogic(
        receiveToken,
        fundOwner,
      )

      if (!logicBalance) logicBalance = Big(0)

      return {
        formatted: logicBalance
          .toNumber()
          .toFixed(receiveToken?.displayedDecimals),
        balance: logicBalance.toNumber(),
      }
    },
    enabled: !!(
      receiveToken &&
      fundOwner &&
      receiveTo &&
      receiveTo !== "simple"
    ),
  })

  const { data: sendFromLogics } = useQuery<DefaultStrategyLogics[]>({
    queryKey: ["sendFromLogics", sendToken?.symbol],
    queryFn: async () => {
      if (!sendToken) return []

      const usableLogics = mangroveLogics.map(async (logic) => {
        try {
          if (!logic) return undefined
          const logicToken = await logic.overlying(sendToken)
          if (logicToken) {
            return logic
          }
        } catch (error) {
          // note: if logic.overlying(token) fails it means the token is not supported by the logic
          return undefined
        }
      })

      const resolvedLogics = await Promise.all(usableLogics)
      return resolvedLogics.filter(
        (logic) => logic !== undefined && logic.approvalType === "ERC20",
      ) as DefaultStrategyLogics[]
    },
    enabled: !!sendToken,
  })

  const { data: receiveToLogics } = useQuery<DefaultStrategyLogics[]>({
    queryKey: ["receiveToLogics", receiveToken?.symbol],
    queryFn: async () => {
      if (!receiveToken) return []

      const usableLogics = mangroveLogics.map(async (logic) => {
        try {
          if (!logic) return undefined
          const logicToken = await logic.overlying(receiveToken)
          if (logicToken) {
            return logic
          }
        } catch (error) {
          // note: if logic.overlying(token) fails it means the token is not supported by the logic
          return undefined
        }
      })

      const resolvedLogics = await Promise.all(usableLogics)
      return resolvedLogics.filter(
        (logic) => logic !== undefined && logic.approvalType === "ERC20",
      ) as DefaultStrategyLogics[]
    },
    enabled: !!receiveToken,
  })

  return {
    sendFromLogics,
    receiveToLogics,
    sendFromBalance,
    receiveToBalance,
  }
}
