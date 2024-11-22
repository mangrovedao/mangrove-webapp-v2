import { Caption } from "@/components/typography/caption"
import { ImageWithHideOnError } from "@/components/ui/image-with-hide-on-error"
import { Skeleton } from "@/components/ui/skeleton"
import { ReactNode } from "react"
import { arbitrum } from "viem/chains"

export function getIconFromChainlist(name: string) {
  let icon = name

  if (icon.includes("Arbitrum One")) {
    icon = "arbitrum"
  }

  return `https://icons.llamao.fi/icons/chains/rsz_${icon.toLowerCase().replaceAll(" ", "_")}.jpg`
}

export function getChainImage(chainId?: number, chainName?: string) {
  const id = chainId || arbitrum.id
  const name = chainName || arbitrum.name

  return (
    <ImageWithHideOnError
      src={`/assets/chains/${id}.webp`}
      width={16}
      height={16}
      className="h-4 rounded-sm size-4"
      key={id}
      alt={`${name}-logo`}
    />
  )
}

export const Line = ({
  title,
  value,
}: {
  title: ReactNode
  value: ReactNode
}) => {
  return (
    <div className="flex justify-between mt-2 items-center">
      <Caption className="text-gray text-xs"> {title}</Caption>
      {value ? (
        <Caption className="text-gray !text-sm">{value}</Caption>
      ) : (
        <Skeleton className="h-4 w-full" />
      )}
    </div>
  )
}

export const LineRewards = ({
  title,
  value,
}: {
  title: ReactNode
  value: ReactNode
}) => {
  return (
    <div className="flex justify-between items-center flex-wrap">
      <Caption className="text-text-secondary !text-sm"> {title}</Caption>
      <Caption className="text-text-primary !text-sm">{value}</Caption>
    </div>
  )
}
