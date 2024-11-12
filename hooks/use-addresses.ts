import {
  arbitrumMangrove,
  arbitrumMarkets,
  arbitrumTokens,
  baseSepoliaLogics,
  baseSepoliaMangrove,
  baseSepoliaMarkets,
  baseSepoliaTokens,
  blastLogics,
  blastMangrove,
  blastMarkets,
  blastTokens,
} from "@mangrovedao/mgv/addresses"
import { arbitrum, baseSepolia, blast } from "viem/chains"
import { useAccount } from "wagmi"

export const aaveKandelSeeder = "0x55B12De431C6e355b56b79472a3632faec58FB5a"

export function useMangroveAddresses() {
  const { chainId } = useAccount()
  switch (chainId) {
    case blast.id:
      return blastMangrove
    case arbitrum.id:
      return arbitrumMangrove
    case baseSepolia.id:
      return baseSepoliaMangrove
    default:
      return arbitrumMangrove
  }
}

export function useAaveKandelRouter() {
  const { chainId } = useAccount()
  switch (chainId) {
    case blast.id:
      return "" // no aave on blast
    case arbitrum.id:
      return "0xb3be00f615239b8553D725dC9F418e27a874d4dC"
    case baseSepolia.id:
      return "0x2f05f5586D2A72CE5F0BE37DdD38B053aB616D60"
    default:
      return undefined
  }
}

export function useAaveKandelSeeder() {
  const { chainId } = useAccount()
  switch (chainId) {
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
  const { chainId } = useAccount()
  switch (chainId) {
    case blast.id:
      return "0x4bb7567303c8bde27a4b490b3e5f1593c891b03d"
    case arbitrum.id:
      return "0x89139bed90b1bfb5501f27be6d6f9901ae35745d"
    case baseSepolia.id:
      return "0x1a839030107167452d69d8f1a673004b2a1b8a3a"
    default:
      return undefined
  }
}

export function useMarkets() {
  const { chainId } = useAccount()
  switch (chainId) {
    case blast.id:
      return blastMarkets
    case arbitrum.id:
      return arbitrumMarkets
    case baseSepolia.id:
      return baseSepoliaMarkets
    default:
      return arbitrumMarkets
  }
}

export function useLogics() {
  const { chainId } = useAccount()
  switch (chainId) {
    case blast.id:
      return blastLogics
    case arbitrum.id:
      return []
    case baseSepolia.id:
      return baseSepoliaLogics
    default:
      return []
  }
}

export function useTokens() {
  const { chainId } = useAccount()
  switch (chainId) {
    case blast.id:
      return blastTokens
    case arbitrum.id:
      return arbitrumTokens
    case baseSepolia.id:
      return baseSepoliaTokens
    default:
      return arbitrumTokens
  }
}
