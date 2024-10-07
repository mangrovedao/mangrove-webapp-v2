import { chainsIcons } from "@/utils/chainIcons"

export default function ChainIcon({ chainId }: { chainId: number }) {
  return chainsIcons[chainId]
}
