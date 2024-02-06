"use client"

import React from "react"

import { TokenPair } from "@/components/token-pair"
import { Button } from "@/components/ui/button"
import Status from "../(shared)/_components/status"
import BackButton from "./_components/back-button"
import BlockExplorer from "./_components/block-explorer"
import CloseDialog from "./_components/parameters/dialogs/close"
import InformationBanner from "./_components/shared/information-banner"
import Tabs from "./_components/tabs"
import useKandel from "./_providers/kandel-strategy"

export default function Page() {
  const [closeStrategy, toggleCloseStrategy] = React.useState(false)

  const {
    strategyQuery,
    strategyAddress,
    baseToken,
    quoteToken,
    blockExplorerUrl,
  } = useKandel()
  const { base, quote, address, offers } = strategyQuery.data ?? {}
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
          {showStatus ? (
            <Status
              address={address}
              base={base}
              quote={quote}
              offers={offers}
            />
          ) : undefined}
        </div>
        <Button
          onClick={() => toggleCloseStrategy(!closeStrategy)}
          size={"lg"}
          rightIcon
        >
          Close strategy
        </Button>
      </div>

      <BlockExplorer
        blockExplorerUrl={blockExplorerUrl}
        address={strategyAddress}
      />

      <Tabs />

      <CloseDialog
        isOpen={closeStrategy}
        onClose={() => toggleCloseStrategy(false)}
      />
    </div>
  )
}
