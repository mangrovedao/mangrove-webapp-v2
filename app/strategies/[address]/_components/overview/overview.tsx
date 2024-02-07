import PriceRangeInfos from "../shared/price-range-infos"
import OffersTable from "./table/offers-table"

export default function Overview() {
  return (
    <div>
      <PriceRangeInfos />
      <div className="py-10">
        <OffersTable />
      </div>
    </div>
  )
}
