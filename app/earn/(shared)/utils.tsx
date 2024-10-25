import { Caption } from "@/components/typography/caption"
import { ImageWithHideOnError } from "@/components/ui/image-with-hide-on-error"
import { ReactNode } from "react"

export function getIconFromChainlist(name: string) {
  let icon = name

  if (icon.includes("Arbitrum One")) {
    icon = "arbitrum"
  }

  return `https://icons.llamao.fi/icons/chains/rsz_${icon.toLowerCase().replaceAll(" ", "_")}.jpg`
}

export function getChainImage(chainId?: number, chainName?: string) {
  return (
    <ImageWithHideOnError
      src={`/assets/chains/${chainId}.webp`}
      width={16}
      height={16}
      className="h-4 rounded-sm size-4"
      key={chainId}
      alt={`${chainName}-logo`}
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
      <Caption className="text-gray text-xs">{value}</Caption>
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
    <div className="flex justify-between items-center">
      <Caption className="text-text-secondary text-xs"> {title}</Caption>
      <Caption className="text-text-primary text-xs">{value}</Caption>
    </div>
  )
}
