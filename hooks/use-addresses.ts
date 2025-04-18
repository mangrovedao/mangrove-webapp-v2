import { MarketParams, Token } from "@mangrovedao/mgv"
import {
  arbitrumMangrove,
  arbitrumMarkets,
  arbitrumTokens,
  baseMangrove,
  baseMarkets,
  baseSepoliaLogics,
  baseTokens,
  blastLogics,
  blastMangrove,
  blastTokens,
} from "@mangrovedao/mgv/addresses"
import { MangroveActionsDefaultParams } from "@mangrovedao/mgv/types"
import { arbitrum, base, baseSepolia, blast, megaethTestnet } from "viem/chains"
import { useDefaultChain } from "./use-default-chain"

export const aaveKandelSeeder = "0x55B12De431C6e355b56b79472a3632faec58FB5a"

const megaEthTestnetMangrove = {
  mgv: "0x32360BB61fcb9cDCDD44eD44328b848061c0b9D7",
  mgvOrder: "0x981Bd234dA6778a6d0132364AfB30f517a9F5aa8",
  mgvReader: "0xB5C0a4249ee477860D47aD688386F2427F0F072a",
  smartRouter: "0x5edE1DD8029e59a0eF80CEB0474B3E8322490220",
  routerProxyFactory: "0x9DB89FB4B356D480139792Fa2146A408f8944E3a",
} as const satisfies MangroveActionsDefaultParams

const megaEthTestnetWETH = {
  address: "0xeFf2212a720aD2a7660251a07cA3fF8512e3Ed6E",
  symbol: "WETH",
  decimals: 18,
  displayDecimals: 5,
  priceDisplayDecimals: 6,
  mgvTestToken: true,
} as const satisfies Token

const megaEthTestnetUSDC = {
  address: "0x33816848eD5002aC1a3B71bf40A4FEB0B3dC6828",
  symbol: "USDC",
  decimals: 6,
  displayDecimals: 2,
  priceDisplayDecimals: 4,
  mgvTestToken: true,
} as const satisfies Token

export const megaEthTestnetWETHUSDC = {
  base: megaEthTestnetWETH,
  quote: megaEthTestnetUSDC,
  tickSpacing: 1n,
} as const satisfies MarketParams

export const megaEthTestnetMarkets = [
  megaEthTestnetWETHUSDC,
] as const satisfies MarketParams[]

export function useMangroveAddresses() {
  const { defaultChain } = useDefaultChain()

  switch (defaultChain.id) {
    case blast.id:
      return blastMangrove
    case arbitrum.id:
      return arbitrumMangrove
    case base.id:
      return baseMangrove
    case megaethTestnet.id:
      return megaEthTestnetMangrove
    default:
      return arbitrumMangrove
  }
}

export function useAaveKandelRouter() {
  const { defaultChain } = useDefaultChain()

  switch (defaultChain.id) {
    case blast.id:
      return "" // no aave on blast
    case arbitrum.id:
      return "0xb3be00f615239b8553D725dC9F418e27a874d4dC"
    case base.id:
      return ""
    case megaethTestnet.id:
      return ""
    default:
      return undefined
  }
}

export function useAaveKandelSeeder() {
  const { defaultChain } = useDefaultChain()

  switch (defaultChain.id) {
    case arbitrum.id:
      return "0x55B12De431C6e355b56b79472a3632faec58FB5a"
    case base.id:
      return ""
    case megaethTestnet.id:
      return ""
    default:
      return undefined
  }
}

export function useKandelSeeder() {
  const { defaultChain } = useDefaultChain()

  switch (defaultChain.id) {
    case arbitrum.id:
      return "0x89139bed90b1bfb5501f27be6d6f9901ae35745d"
    case base.id:
      return ""
    case megaethTestnet.id:
      return ""
    default:
      return undefined
  }
}

export function useMarkets() {
  const { defaultChain } = useDefaultChain()

  switch (defaultChain.id) {
    case arbitrum.id:
      return arbitrumMarkets
    case base.id:
      return baseMarkets
    case megaethTestnet.id:
      return megaEthTestnetMarkets
    default:
      return baseMarkets
  }
}

export function useLogics() {
  const { defaultChain } = useDefaultChain()

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
  const { defaultChain } = useDefaultChain()

  switch (defaultChain.id) {
    case blast.id:
      return blastTokens
    case arbitrum.id:
      return arbitrumTokens
    case base.id:
      return baseTokens
    case megaethTestnet.id:
      return [megaEthTestnetWETH, megaEthTestnetUSDC]
    default:
      return baseTokens
  }
}

export function useCashnesses() {
  const { defaultChain } = useDefaultChain()

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
        EURC: 0.5e6,
        WETH: 1000,
        cbBTC: 2000,
        cbETH: 500,
        wstETH: 600,
      }
    case megaethTestnet.id:
      return {
        USDC: 1e6,
        WETH: 1000,
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
  const { defaultChain } = useDefaultChain()

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
