import { WalletIcon } from "lucide-react"
import { sourceIcons } from "../utils"

export default function SourceIcon({ sourceId }: { sourceId: string }) {
  return sourceIcons[sourceId] || <WalletIcon className="h-5 w-5" />
}
