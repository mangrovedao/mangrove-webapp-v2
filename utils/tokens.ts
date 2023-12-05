import icons from "@/generated/icons.json"

const IMG_BASE_PATH = "/cryptocurrency-icons/svg/color"

type IconType = Record<
  string,
  {
    name: string
    color: string
    symbol: string
  }
>

export function getTokenInfos(symbol: string) {
  const token = (icons as IconType)[symbol]
  if (!token) {
    return icons.GENERIC
  }
  return token
}

export function getSvgUrl(symbol: string) {
  const token = getTokenInfos(symbol)
  return `${IMG_BASE_PATH}/${token.symbol.toLocaleLowerCase()}.svg`
}
