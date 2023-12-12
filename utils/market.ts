import type { Market } from "@mangrovedao/mangrove.js"

export function baToBs(ba: Market.BA): Market.BS {
  return ba === "asks" ? "buy" : "sell"
}

export function bsToBa(bs: Market.BS): Market.BA {
  return bs === "buy" ? "asks" : "bids"
}
