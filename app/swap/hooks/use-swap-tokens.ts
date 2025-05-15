import { type Token } from "@mangrovedao/mgv"
import { useQueryState } from "nuqs"
import React from "react"

import { useOpenMarkets } from "@/hooks/use-open-markets"
import { useTokenBalance } from "@/hooks/use-token-balance"
import { useTokenByAddress } from "@/hooks/use-token-by-address"
import { useMarketOverride } from "@/providers/market"
import {
  deduplicateTokens,
  getAllMangroveMarketTokens,
  getMangroveTradeableTokens,
  getMarketFromTokens,
  getTradableTokens,
} from "@/utils/tokens"

export function useSwapTokens(odosTokens: Token[] = []) {
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

  const { setOverrideMarket } = useMarketOverride()

  const payToken = useTokenByAddress(payTknAddress)
  const receiveToken = useTokenByAddress(receiveTknAddress)

  const payTokenBalance = useTokenBalance(payToken)
  const receiveTokenBalance = useTokenBalance(receiveToken)

  const swapMarket = getMarketFromTokens(markets, payToken, receiveToken)

  React.useEffect(() => {
    if (swapMarket) {
      setOverrideMarket(swapMarket)
    }

    return () => {
      setOverrideMarket(undefined)
    }
  }, [swapMarket, setOverrideMarket])

  const allTokens = deduplicateTokens([
    ...getAllMangroveMarketTokens(markets),
    ...odosTokens,
  ])

  const tradableTokens = deduplicateTokens(
    getTradableTokens({
      markets,
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
      markets,
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
    // Tokens
    payToken,
    receiveToken,
    allTokens,
    tradableTokens,
    markets,
    swapMarket,
    mangroveTradeableTokensForPayToken,

    // Balances
    payTokenBalance,
    receiveTokenBalance,

    // State setters
    setPayTknAddress,
    setReceiveTknAddress,

    // Token selection UI
    payTokenDialogOpen,
    setPayTokenDialogOpen,
    receiveTokenDialogOpen,
    setReceiveTokenDialogOpen,

    // Actions
    onPayTokenSelected,
    onReceiveTokenSelected,
    reverseTokens,
  }
}
