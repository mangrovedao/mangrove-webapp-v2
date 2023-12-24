import Jazzicon, { jsNumberForAddress } from "react-jazzicon"
import { useAccount } from "wagmi"

import { Caption } from "@/components/typography/caption"
import { Title } from "@/components/typography/title"
import { Skeleton } from "@/components/ui/skeleton"

export function LiquiditySource({ value = "wallet" }: { value?: "wallet" }) {
  const { address } = useAccount()
  return (
    <div className="flex items-end space-x-2">
      <span className="m-1 flex items-end">
        {address ? (
          <Jazzicon seed={jsNumberForAddress(address)} />
        ) : (
          <Skeleton className="w-6 aspect-square rounded-full" />
        )}
      </span>
      <span className="flex flex-col space-y-2">
        <Caption
          variant={"caption1"}
          className="text-cloud-300 flex items-center"
        >
          Liquidity source
        </Caption>
        <Title variant={"title1"} className="capitalize">
          {value}
        </Title>
      </span>
    </div>
  )
}
