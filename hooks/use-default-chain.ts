"use client"
import React from "react"
import { base, Chain } from "viem/chains"
import { useAccount } from "wagmi"

/**
 * Hook that returns the connected user's chain ID or base.id as fallback
 * @returns The chain ID of the connected user or base.id if not connected
 */
export function useDefaultChain() {
  const [defaultChain, setDefaultChain] = React.useState<Chain>(base)
  const { isConnected, chain } = useAccount()

  return {
    defaultChain: isConnected && chain ? chain : defaultChain,
    setDefaultChain,
  }
}
