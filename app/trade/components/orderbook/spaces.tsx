import { type Market } from "@mangrovedao/mangrove.js"

// calculate how many spaces to add in order to align the spread decimals with values in the first column
export function getNumberOfSpacesToAdd(
  asks: Market.Offer[],
  bids: Market.Offer[],
  value: Big,
) {
  const worseAsk = asks[asks.length - 1]
  const worseBid = bids[bids.length - 1]
  const higherValue = worseAsk?.price?.gt(worseBid?.price ?? 0)
    ? worseAsk.price
    : worseBid?.price
  return Math.abs(
    value.toFixed(0).length - (higherValue?.toFixed(0)?.length ?? 0),
  )
}

export function Spaces({
  numberOfSpacesToAdd,
}: {
  numberOfSpacesToAdd: number
}) {
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: new Array(numberOfSpacesToAdd).fill("&nbsp;").join(""),
      }}
    />
  )
}
