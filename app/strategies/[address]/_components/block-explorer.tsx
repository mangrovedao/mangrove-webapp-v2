import { Button } from "@/components/ui/button-old"
import { Skeleton } from "@/components/ui/skeleton"
import withClientOnly from "@/hocs/withClientOnly"
import { shortenAddress } from "@/utils/wallet"
import { Copy, ExternalLink } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

type Props = {
  address: string
  blockExplorerUrl?: string
  description?: boolean
  copy?: boolean
  type?: "address" | "tx"
}

function BlockExplorer({
  description,
  address,
  blockExplorerUrl,
  copy,
  type = "tx",
}: Props) {
  return (
    <div className="flex items-center text-sm font-normal justify-between">
      {description ? (
        <span className="text-cloud-300">View on block explorer:</span>
      ) : undefined}

      {blockExplorerUrl ? (
        <div className="flex -space-x-4">
          <Button
            className="flex items-center space-x-1 underline hover:opacity-90 transition-opacity"
            variant={"link"}
            asChild
          >
            <Link
              rel="noopener noreferrer"
              target="_blank"
              href={`${blockExplorerUrl}/${type}/${address}`}
            >
              <span>{shortenAddress(address ?? "")}</span>
              {!copy && <ExternalLink className="mr-2 h-4 w-4" />}
            </Link>
          </Button>
          {copy && (
            <Button
              className="flex items-center space-x-1 underline"
              variant={"link"}
              onClick={() => {
                address && navigator.clipboard.writeText(address)
                toast.success("Address copied to clipboard")
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <Skeleton className="w-20 h-5" />
      )}
    </div>
  )
}

export default withClientOnly(BlockExplorer)
