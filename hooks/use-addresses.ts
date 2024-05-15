import {
  blastLogics,
  blastMangrove,
  blastMarkets,
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
