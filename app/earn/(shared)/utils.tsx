import { ImageWithHideOnError } from "@/components/ui/image-with-hide-on-error"

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
