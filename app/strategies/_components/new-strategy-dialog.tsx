"use client"
import type Mangrove from "@mangrovedao/mangrove.js"
import React from "react"

import Dialog from "@/components/dialogs/dialog"
import { TokenIcon } from "@/components/token-icon"
import { Caption } from "@/components/typography/caption"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useWhitelistedMarketsInfos } from "@/hooks/use-whitelisted-markets-infos"
import useMangrove from "@/providers/mangrove"
import { useRouter } from "next/navigation"
import { getSymbol, getValue } from "../_utils/markets"
import { Badge } from "./badge"

type Props = {
  open: boolean
  onClose: () => void
}

export function NewStrategyDialog({ open, onClose }: Props) {
  const router = useRouter()
  const { mangrove } = useMangrove()
  const marketsInfosQuery = useWhitelistedMarketsInfos(mangrove)
  const [marketInfo, setMarketInfo] = React.useState<
    Mangrove.OpenMarketInfo | undefined
  >()

  function handleMarketChange(value: string) {
    const [base, quote] = value.split(",")
    const marketInfo = marketsInfosQuery.data?.find(
      (m) => m.base.id === base && m.quote.id === quote,
    )
    setMarketInfo(marketInfo)
  }

  function handleNext() {
    if (!marketInfo) return
    router.push(`/strategies/new?market=${getValue(marketInfo)}`, {
      scroll: false,
    })
  }

  return (
    <Dialog open={!!open} onClose={onClose}>
      <Dialog.Title className="text-xl text-left">
        <Title variant={"header1"} className="space-x-3 flex items-center">
          <span>Create new strategy</span> <Badge>Step 1/2</Badge>
        </Title>
      </Dialog.Title>
      <Dialog.Description className="text-left !mt-8">
        <Caption as={"label"} className="mb-0.5">
          Select market
        </Caption>
        <Select
          value={marketInfo ? getValue(marketInfo) : undefined}
          onValueChange={handleMarketChange}
          disabled={marketsInfosQuery.isLoading}
        >
          <SelectTrigger className="">
            <SelectValue
              placeholder={!marketInfo ? "Select" : "No markets"}
              suppressHydrationWarning
            />
          </SelectTrigger>
          <SelectContent>
            {marketsInfosQuery.data?.map((m) => (
              <SelectItem
                key={`${m.base.id}/${m.quote.id}`}
                value={getValue(m)}
              >
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    <TokenIcon symbol={m.base.symbol} />
                    <TokenIcon symbol={m.quote.symbol} />
                  </div>
                  <span>{getSymbol(m)}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Dialog.Description>
      <Dialog.Footer className="flex">
        <Button
          size="lg"
          variant="secondary"
          className="w-1/3"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          size="lg"
          rightIcon
          className="w-2/3"
          disabled={!marketInfo}
          onClick={handleNext}
        >
          Next
        </Button>
      </Dialog.Footer>
    </Dialog>
  )
}
