import { mangroveActions } from "@mangrovedao/mgv"
import { useQuery } from "@tanstack/react-query"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { Address, isAddressEqual } from "viem"
import { useMangroveAddresses } from "../use-addresses"
import { useDefaultChain } from "../use-default-chain"
import { useNetworkClient } from "../use-network-client"

export function useMarkets() {
  const { defaultChain } = useDefaultChain()
  const client = useNetworkClient()
  const mangrove = useMangroveAddresses()

  return useQuery({
    queryKey: ["markets", defaultChain.id, mangrove?.mgv, client.key],
    queryFn: async () => {
      if (!mangrove || !client) return []
      return client.extend(mangroveActions(mangrove)).getOpenMarkets({
        cashnesses: {
          WETH: 1000,
          WBTC: 2000,
          USDC: 1e6,
          USDT: 2e6,
          EURC: 0.5e6,
          cbBTC: 2000,
          cbETH: 500,
          wstETH: 600,
        },
        symbolOverrides: {
          "USD₮0": "USDT",
        },
      })
    },
    gcTime: 1000 * 60 * 60 * 24,
    initialData: [],
  })
}

export function useMarket() {
  const markets = useMarkets()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Read initial values from URL or use defaults
  const getInitialValue = (param: string, defaultValue: any) => {
    const urlValue = searchParams.get(param)
    return urlValue || defaultValue
  }

  // State for market parameters
  const [marketParams, setMarketParamsState] = useState<{
    base: Address | null
    quote: Address | null
    tickSpacing: bigint | null
  }>({
    base:
      (getInitialValue("base", markets.data?.[0]?.base.address) as Address) ||
      null,
    quote:
      (getInitialValue("quote", markets.data?.[0]?.quote.address) as Address) ||
      null,
    tickSpacing: getInitialValue("tickSpacing", markets.data?.[0]?.tickSpacing)
      ? BigInt(getInitialValue("tickSpacing", markets.data?.[0]?.tickSpacing))
      : null,
  })

  // Update URL when state changes
  useEffect(() => {
    if (!marketParams.base || !marketParams.quote || !marketParams.tickSpacing)
      return

    const params = new URLSearchParams(searchParams.toString())
    params.set("base", marketParams.base)
    params.set("quote", marketParams.quote)
    params.set("tickSpacing", marketParams.tickSpacing.toString())

    router.push("?" + params.toString(), { scroll: false })
  }, [marketParams, router, searchParams])

  // Wrapper for setting market params and updating URL
  const setMarketParams = (newParams: Partial<typeof marketParams>) => {
    setMarketParamsState((prev) => ({
      ...prev,
      ...newParams,
    }))
  }

  const market = useMemo(() => {
    if (!markets.data) return null
    const market = markets.data.find((market) => {
      return (
        marketParams.base &&
        isAddressEqual(market.base.address, marketParams.base) &&
        marketParams.quote &&
        isAddressEqual(market.quote.address, marketParams.quote) &&
        marketParams.tickSpacing &&
        market.tickSpacing === marketParams.tickSpacing
      )
    })
    if (!market) return null
    return market
  }, [markets.data, marketParams])

  return {
    market,
    setMarketParams,
  }
}
