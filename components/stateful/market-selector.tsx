import type { Market } from "@mangrovedao/mangrove.js"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import useMangrove from "@/providers/mangrove"
import { useMarket } from "@/stores/market.store"

function getValue(market: Market) {
  return `${market.base.address}/${market.quote.address}`
}

function getName(market: Market) {
  return `${market.base.name}/${market.quote.name}`
}

export default function MarketSelector() {
  const { markets } = useMangrove()
  const { selectedMarket, setMarket } = useMarket()

  return (
    <Select
      defaultValue={selectedMarket}
      value={selectedMarket}
      onValueChange={setMarket}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        {markets?.map((market) => (
          <SelectItem
            key={`${market.base.address}/${market.quote.address}`}
            value={getName(market)}
          >
            {getName(market)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
