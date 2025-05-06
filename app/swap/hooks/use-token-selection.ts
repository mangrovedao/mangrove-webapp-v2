import { type Token } from "@mangrovedao/mgv"
import { useQueryState } from "nuqs"
import React from "react"

import { useOpenMarkets } from "@/hooks/use-open-markets"
import { useTokenBalance } from "@/hooks/use-token-balance"
import { useTokenByAddress } from "@/hooks/use-token-by-address"
import {
  deduplicateTokens,
  getAllMangroveMarketTokens,
  getMangroveTradeableTokens,
  getMarketFromTokens,
  getTradableTokens,
} from "@/utils/tokens"

export function useTokenSelection(odosTokens: Token[]) {
  const openMarkets = useOpenMarkets()
  const { openMarkets: markets } = openMarkets

  const [payTknAddress, setPayTknAddress] = useQueryState("payTkn", {
    defaultValue: markets[0]?.base?.address,
  })
  const [receiveTknAddress, setReceiveTknAddress] = useQueryState(
    "receiveTkn",
    {
      defaultValue: markets[0]?.quote?.address,
    },
  )

  const [payTokenDialogOpen, setPayTokenDialogOpen] = React.useState(false)
  const [receiveTokenDialogOpen, setReceiveTokenDialogOpen] =
    React.useState(false)

  const payToken = useTokenByAddress(payTknAddress)
  const receiveToken = useTokenByAddress(receiveTknAddress)
  const payTokenBalance = useTokenBalance(payToken)
  const receiveTokenBalance = useTokenBalance(receiveToken)
  const currentMarket = getMarketFromTokens(markets, payToken, receiveToken)

  const allTokens = deduplicateTokens([
    ...getAllMangroveMarketTokens(markets),
    ...odosTokens,
  ])

  const tradableTokens = deduplicateTokens(
    getTradableTokens({
      mangroveMarkets: markets,
      odosTokens,
      token: payToken,
    }),
  )

  const mangroveTradeableTokensForPayToken = React.useMemo(() => {
    if (!payToken) return []
    return getMangroveTradeableTokens(markets, payToken).map((t) => t.address)
  }, [markets, payToken])

  function onPayTokenSelected(token: Token) {
    const newTradableTokens = getTradableTokens({
      mangroveMarkets: markets,
      odosTokens,
      token,
    })

    setPayTknAddress(token.address)
    setPayTokenDialogOpen(false)

    if (newTradableTokens.length === 1 && newTradableTokens[0]) {
      setReceiveTknAddress(newTradableTokens[0].address)
      return
    }
    setReceiveTknAddress("")
  }

  function onReceiveTokenSelected(token: Token) {
    setReceiveTknAddress(token.address)
    setReceiveTokenDialogOpen(false)
  }

  function reverseTokens() {
    setPayTknAddress(receiveTknAddress)
    setReceiveTknAddress(payTknAddress)
  }

  return {
    payToken,
    receiveToken,
    payTknAddress,
    receiveTknAddress,
    payTokenBalance,
    receiveTokenBalance,
    currentMarket,
    allTokens,
    tradableTokens,
    mangroveTradeableTokensForPayToken,
    payTokenDialogOpen,
    setPayTokenDialogOpen,
    receiveTokenDialogOpen,
    setReceiveTokenDialogOpen,
    onPayTokenSelected,
    onReceiveTokenSelected,
    reverseTokens,
    markets,
  }
}
