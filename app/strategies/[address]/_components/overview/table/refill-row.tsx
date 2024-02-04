import { Token } from "@mangrovedao/mangrove.js"
import { Row } from "@tanstack/react-table"
import Big from "big.js"
import { Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TableCell } from "@/components/ui/table"
import { cn } from "@/utils"
import { useRefillRequirements } from "../../../_hooks/use-refill-requirements"
import useKandel from "../../../_providers/kandel-strategy"
import { MergedOffer } from "../../../_utils/inventory"

export default function RefillRow({ row }: { row: Row<MergedOffer> }) {
  const { strategyStatusQuery } = useKandel()
  const { data } = useRefillRequirements({
    offer: row.original,
  })
  const { base, quote } = strategyStatusQuery.data?.market ?? {}

  return (
    <tr className="relative hidden md:table-row">
      {/* little trick to take the entire table space and create our custom row */}
      {row.getVisibleCells().map((cell, i) => (
        <TableCell key={`${cell.id}-${i}`}>&nbsp;</TableCell>
      ))}
      <div className="border border-mango-300 rounded-lg absolute inset-0 flex items-center p-2 space-x-4">
        <div className="inset-0 flex items-center space-x-4 flex-1">
          <div
            className={cn(
              "h-full aspect-square bg-mango-300 rounded-lg flex items-center justify-center text-red-100 p-1",
            )}
          >
            <Info className={"text-mango-100"} />
          </div>
          {/* TODO: unmock values for amount / volume and Min quote */}
          {/* <LabelValueItem label="Amount" value={Big(0)} token={quote} /> */}
          <LabelValueItem
            label="Minimum Volume"
            value={data?.minimumVolume}
            token={row.original.offerType === "asks" ? base : quote}
          />
          {/* <LabelValueItem label="Min quote" value={Big(0)} token={quote} /> */}
        </div>
        {/* TODO: implement re-fill */}
        <Button size={"sm"} className="px-5">
          Re-fill
        </Button>
      </div>
    </tr>
  )
}

function LabelValueItem({
  label,
  value,
  token,
}: {
  label: string
  value?: Big
  token?: Token
}) {
  return (
    <div className="flex items-center text-sm">
      <span className="text-cloud-300">{label}:</span>
      {value && token ? (
        <span className="ml-1 text-white">
          {value.toFixed(token.displayedDecimals)} {token?.symbol}
        </span>
      ) : (
        <Skeleton className="w-10 h-4" />
      )}
    </div>
  )
}
