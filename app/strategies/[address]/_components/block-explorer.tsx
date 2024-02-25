import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import withClientOnly from "@/hocs/withClientOnly"
import { shortenAddress } from "@/utils/wallet"
import { ExternalLink } from "lucide-react"
import Link from "next/link"

type Props = {
  address: string
  blockExplorerUrl?: string
  description?: boolean
}

function BlockExplorer({ description, address, blockExplorerUrl }: Props) {
  return (
    <div className="flex items-center text-sm font-normal">
      {description ? (
        <span className="text-cloud-300">View on block explorer:</span>
      ) : undefined}

      {blockExplorerUrl ? (
        <Button
          className="flex items-center space-x-1 underline hover:opacity-90 transition-opacity"
          variant={"link"}
          asChild
        >
          <Link
            rel="noopener noreferrer"
            target="_blank"
            href={`${blockExplorerUrl}/address/${address}`}
          >
            <span>{shortenAddress(address ?? "")}</span>
            <ExternalLink className="mr-2 h-4 w-4" />
          </Link>
        </Button>
      ) : (
        <Skeleton className="w-20 h-5" />
      )}
    </div>
  )
}

export default withClientOnly(BlockExplorer)
