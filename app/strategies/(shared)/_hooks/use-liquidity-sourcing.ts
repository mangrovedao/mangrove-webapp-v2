import { Token } from "@mangrovedao/mangrove.js"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"

import { Address } from "viem"
import { DefaultStrategyLogics } from "../type"
import { getV3PositionBalances } from "./use-v3-balances"

type Props = {
  sendFrom?: string
  receiveTo?: string
  mangroveLogics: DefaultStrategyLogics[]
  fundOwner?: string
  sendToken?: Token
  receiveToken?: Token
  nftContract?: string
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
  nftContract,
}: Props) {
  const { data: sendFromBalance } = useQuery<BalanceLogic | undefined>({
    queryKey: ["sendFromBalance", sendToken?.symbol, fundOwner, sendFrom],
    queryFn: async () => {
      if (!sendToken || !receiveToken || !fundOwner || sendFrom === "simple") {
        return undefined
      }

      const selectedLogic = mangroveLogics.find(
        (logic) => logic?.id === sendFrom,
      )
      if (!selectedLogic) return undefined

      if (selectedLogic.approvalType === "ERC721") {
        const v3Balance = await getV3PositionBalances({
          base: sendToken.address as Address,
          quote: receiveToken.address as Address,
          user: fundOwner as Address,
          positionManagerNft: nftContract as Address,
          v3Manager: selectedLogic.address as Address,
        })
        const balance = v3Balance?.[0]?.balance.base ?? "0"

        return {
          formatted: Number(balance).toFixed(sendToken?.displayedDecimals),
          balance: Number(balance),
        }
      }

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
    // staleTime: Infinity,
    enabled: !!(sendToken && fundOwner && sendFrom && sendFrom !== "simple"),
  })

  const { data: receiveToBalance } = useQuery<BalanceLogic | undefined>({
    queryKey: ["receiveToBalance", receiveTo, fundOwner, receiveToken?.symbol],
    queryFn: async () => {
      if (
        !nftContract ||
        !sendToken ||
        !receiveToken ||
        !fundOwner ||
        receiveTo === "simple"
      ) {
        return undefined
      }

      const selectedLogic = mangroveLogics.find(
        (logic) => logic?.id === receiveTo,
      )
      if (!selectedLogic) return undefined

      if (selectedLogic.approvalType === "ERC721") {
        const v3Balance = await getV3PositionBalances({
          base: sendToken.address as Address,
          quote: receiveToken.address as Address,
          user: fundOwner as Address,
          positionManagerNft: nftContract as Address,
          v3Manager: selectedLogic.address as Address,
        })
        const balance = v3Balance?.[0]?.balance.base ?? "0"

        return {
          formatted: Number(balance).toFixed(sendToken?.displayedDecimals),
          balance: Number(balance),
        }
      }

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
    // staleTime: Infinity,
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
        (logic) => logic !== undefined,
      ) as DefaultStrategyLogics[]
    },
    // staleTime: Infinity,
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
        (logic) => logic !== undefined,
      ) as DefaultStrategyLogics[]
    },
    // staleTime: Infinity,
    enabled: !!receiveToken,
  })

  return {
    sendFromLogics,
    receiveToLogics,
    sendFromBalance,
    receiveToBalance,
  }
}
