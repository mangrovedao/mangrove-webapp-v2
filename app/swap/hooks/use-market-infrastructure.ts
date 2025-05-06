import { publicMarketActions } from "@mangrovedao/mgv"
import React from "react"
import { useAccount, useWalletClient } from "wagmi"

import { useSpenderAddress } from "@/app/trade/_components/forms/hooks/use-spender-address"
import { useRegistry } from "@/hooks/ghostbook/hooks/use-registry"
import { usePools } from "@/hooks/new_ghostbook/pool"
import { useMangroveAddresses } from "@/hooks/use-addresses"
import { useNetworkClient } from "@/hooks/use-network-client"

export function useMarketInfrastructure({
  currentMarket,
}: {
  currentMarket: any
}) {
  const { address, chain } = useAccount()
  const { data: walletClient } = useWalletClient()
  const { mangroveChain } = useRegistry()
  const publicClient = useNetworkClient()
  const addresses = useMangroveAddresses()

  const { data: pools } = usePools({ swapMarket: currentMarket })
  const pool =
    pools && pools.length > 0
      ? pools.sort((a, b) =>
          Number(BigInt(b.liquidity) - BigInt(a.liquidity)),
        )[0]
      : null

  const { data: mgvSpender } = useSpenderAddress("market")
  const spender =
    chain?.testnet || !pool ? mgvSpender : mangroveChain?.ghostbook

  // Log the spender address for debugging
  React.useEffect(() => {
    if (spender) {
      console.log("Using spender address:", spender)
      if (chain?.testnet || !pool) {
        console.log("Source: mgvSpender (test network or no pool)")
      } else {
        console.log("Source: mangroveChain.ghostbook")
      }
    }
  }, [spender, chain?.testnet, pool, mgvSpender, mangroveChain?.ghostbook])

  const marketClient =
    addresses && currentMarket
      ? publicClient?.extend(publicMarketActions(addresses, currentMarket))
      : undefined

  return {
    address,
    chain,
    walletClient,
    publicClient,
    addresses,
    spender,
    pool,
    marketClient,
  }
}
