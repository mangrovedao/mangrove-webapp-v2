import {
  arbitrumMangrove,
  arbitrumMarkets,
  arbitrumTokens,
  baseMangrove,
  baseMarkets,
  baseSepoliaLogics,
  baseSepoliaMangrove,
  baseSepoliaMarkets,
  baseSepoliaTokens,
  baseTokens,
  blastLogics,
  blastMangrove,
  blastMarkets,
  blastTokens,
} from "@mangrovedao/mgv/addresses"
import { arbitrum, base, baseSepolia, blast } from "viem/chains"
import { useDefaultChain } from "./use-default-chain"

export const aaveKandelSeeder = "0x55B12De431C6e355b56b79472a3632faec58FB5a"

export function useMangroveAddresses() {
  const defaultChain = useDefaultChain()

  switch (defaultChain.id) {
    case blast.id:
      return blastMangrove
    case arbitrum.id:
      return arbitrumMangrove
    case base.id:
      return baseMangrove
    case baseSepolia.id:
      return baseSepoliaMangrove
    default:
      return arbitrumMangrove
  }
}

export function useAaveKandelRouter() {
  const defaultChain = useDefaultChain()

  switch (defaultChain.id) {
    case blast.id:
      return "" // no aave on blast
    case arbitrum.id:
      return "0xb3be00f615239b8553D725dC9F418e27a874d4dC"
    case base.id:
      return ""
    case baseSepolia.id:
      return "0x2f05f5586D2A72CE5F0BE37DdD38B053aB616D60"
    default:
      return undefined
  }
}

export function useAaveKandelSeeder() {
  const defaultChain = useDefaultChain()

  switch (defaultChain.id) {
    case blast.id:
      return "" // no aave on blast
    case arbitrum.id:
      return "0x55B12De431C6e355b56b79472a3632faec58FB5a"
    case baseSepolia.id:
      return "0xCb62cD0Ea7aD46d5B630C1068C7bED2cBd2b7E23"
    default:
      return undefined
  }
}

export function useKandelSeeder() {
  const defaultChain = useDefaultChain()

  switch (defaultChain.id) {
    case blast.id:
      return "0x4bb7567303c8bde27a4b490b3e5f1593c891b03d"
    case arbitrum.id:
      return "0x89139bed90b1bfb5501f27be6d6f9901ae35745d"
    case base.id:
      return ""
    case baseSepolia.id:
      return "0x1a839030107167452d69d8f1a673004b2a1b8a3a"
    default:
      return undefined
  }
}

export function useMarkets() {
  const defaultChain = useDefaultChain()

  switch (defaultChain.id) {
    case blast.id:
      return blastMarkets
    case arbitrum.id:
      return arbitrumMarkets
    case base.id:
      return baseMarkets
    case baseSepolia.id:
      return baseSepoliaMarkets
    default:
      return arbitrumMarkets
  }
}

export function useLogics() {
  const defaultChain = useDefaultChain()

  switch (defaultChain.id) {
    case blast.id:
      return blastLogics
    case arbitrum.id:
      return []
    case base.id:
      return []
    case baseSepolia.id:
      return baseSepoliaLogics
    default:
      return []
  }
}

export function useTokens() {
  const defaultChain = useDefaultChain()

  switch (defaultChain.id) {
    case blast.id:
      return blastTokens
    case arbitrum.id:
      return arbitrumTokens
    case base.id:
      return baseTokens
    case baseSepolia.id:
      return baseSepoliaTokens
    default:
      return arbitrumTokens
  }
}

export function useCashnesses() {
  const defaultChain = useDefaultChain()

  switch (defaultChain.id) {
    case arbitrum.id:
      return {
        WETH: 1000,
        WBTC: 2000,
        USDC: 1e6,
        USDT: 2e6,
      }
    case base.id:
      return {
        USDC: 1e6,
        EUR: 0.5e6,
        WETH: 1000,
        cbBTC: 2000,
        cbETH: 500,
        wstETH: 600,
      }
    default:
      return {
        WETH: 1000,
        WBTC: 2000,
        USDC: 1e6,
        USDT: 2e6,
      }
  }
}

export function useSymbolOverrides() {
  const defaultChain = useDefaultChain()

  switch (defaultChain.id) {
    case arbitrum.id:
      return {
        "USD₮0": "USDT",
      }
    case base.id:
      return {}
    default:
      return {}
  }
}
