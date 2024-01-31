import OffersTable from "./table/offers-table"
import PriceRangeInfos from "../shared/price-range-infos"

export default function Overview() {
  return (
    <div>
      <PriceRangeInfos />
      <OffersTable />
    </div>
  )
}
