import { Market } from "@mangrovedao/mangrove.js"
import React from "react"

import { Skeleton } from "@/components/ui/skeleton"

type DisplayBalancesProps = {
  isLoading: boolean
  selectedMarket?: Market
  formattedWithSymbol?: string
}

export const DisplayBalances: React.FC<DisplayBalancesProps> = ({
  isLoading,
  selectedMarket,
  formattedWithSymbol,
}) => {
  if (!selectedMarket || isLoading) {
    return <Skeleton className="h-full w-full" />
  }

  return formattedWithSymbol
}
