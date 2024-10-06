"use client"

import React from "react"

import { TokenPair } from "@/components/token-pair"
import { Button } from "@/components/ui/button-old"
import { useRouter } from "next/navigation"
import Status from "../(shared)/_components/status"
import useStrategyStatus from "../(shared)/_hooks/use-strategy-status"
import BackButton from "./_components/back-button"
import BlockExplorer from "./_components/block-explorer"
import CloseStrategyDialog from "./_components/parameters/dialogs/close"
import InformationBanner from "./_components/shared/information-banner"
import Tabs from "./_components/tabs"
import useKandel from "./_providers/kandel-strategy"

export default function Page() {
  const [closeStrategy, toggleCloseStrategy] = React.useState(false)
  const { push } = useRouter()

  const {
    strategyStatusQuery,
    strategyQuery,
    strategyAddress,
    baseToken,
    quoteToken,
    blockExplorerUrl,
  } = useKandel()

  const { base, quote, address, offers } = strategyQuery.data ?? {}
  const { data } = useStrategyStatus({
    address,
    base,
    quote,
    offers,
  })

  const showStatus = base && quote && address && offers
  return (
    <div className="max-w-5xl mx-auto px-4 xl:px-0">
      <BackButton href={"/strategies"}>Back to Strategies</BackButton>

      <InformationBanner />

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4 mb-4 mt-8">
          <TokenPair
            baseToken={baseToken}
            quoteToken={quoteToken}
            tokenClasses="h-7 w-7"
          />
          {showStatus ? <Status status={data?.status} /> : undefined}
        </div>
        <div className="flex justify-between space-x-2">
          <Button
            onClick={() => toggleCloseStrategy(!closeStrategy)}
            size={"lg"}
            disabled={!data?.status || data?.status === "closed"}
          >
            Close strategy
          </Button>
          <Button
            size={"lg"}
            disabled={!data?.status}
            rightIcon
            onClick={() =>
              push(
                `/strategies/${strategyAddress}/edit?market=${baseToken?.address},${quoteToken?.address},1`,
              )
            }
          >
            {data?.status === "closed" ? "Re-open" : "Edit Parameters"}
          </Button>
        </div>
      </div>

      <BlockExplorer
        blockExplorerUrl={blockExplorerUrl}
        address={strategyAddress}
        type="address"
      />

      <Tabs />

      <CloseStrategyDialog
        strategyAddress={strategyAddress}
        isOpen={closeStrategy}
        onClose={() => toggleCloseStrategy(false)}
      />
    </div>
  )
}
