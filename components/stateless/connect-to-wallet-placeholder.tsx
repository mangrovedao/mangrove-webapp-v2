import { Skeleton } from "../ui/skeleton"

export function ConnectToWalletPlaceholder() {
  return (
    <Skeleton className="w-full h-full flex justify-center items-center">
      Connect wallet to see orderbook
    </Skeleton>
  )
}
