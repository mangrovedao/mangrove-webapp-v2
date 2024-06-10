import {
  blastLogics,
  blastMangrove,
  blastMarkets,
  blastSmartKandel,
  blastTokens,
} from "@mangrovedao/mgv/addresses"
import { blast } from "viem/chains"
import { useChainId } from "wagmi"

export function useMangroveAddresses() {
  const chain = useChainId()
  switch (chain) {
    case blast.id:
      return blastMangrove
    default:
      return undefined
  }
}

export function useSmartKandel() {
  const chain = useChainId()
  switch (chain) {
    case blast.id:
      return blastSmartKandel
    default:
      return undefined
  }
}

export function useMarkets() {
  const chain = useChainId()
  switch (chain) {
    case blast.id:
      return blastMarkets
    default:
      return []
  }
}

export function useLogics() {
  const chain = useChainId()
  switch (chain) {
    case blast.id:
      return blastLogics
    default:
      return []
  }
}

export function useTokens() {
  const chain = useChainId()
  switch (chain) {
    case blast.id:
      return blastTokens
    default:
      return []
  }
}
