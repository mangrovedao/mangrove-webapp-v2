import { chainsIcons } from "@/utils/chainsIcons"

export default function ChainIcon({ chainId }: { chainId: number }) {
  return chainsIcons[chainId]
}
