export function getIconFromChainlist(name: string) {
  let icon = name

  if (icon.includes("Arbitrum One")) {
    icon = "arbitrum"
  }

  return `https://icons.llamao.fi/icons/chains/rsz_${icon.toLowerCase().replaceAll(" ", "_")}.jpg`
}
