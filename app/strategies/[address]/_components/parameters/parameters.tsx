"use client"

import { Info } from "lucide-react"
import React from "react"

import { Caption } from "@/components/typography/caption"
import { Text } from "@/components/typography/text"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import PriceRangeInfos from "../shared/price-range-infos"
import { Bounty } from "./dialogs/bounty"
import { Deposit } from "./dialogs/deposit"
import { Publish } from "./dialogs/publish"
import { UnPublish } from "./dialogs/unpublish"
import { Withdraw } from "./dialogs/withdraw"
import { useParameters } from "./hook/use-parameters"
import { useInventoryTable } from "./table/use-inventory-table"

const InfoBar = () => {
  const { currentParameter, quote } = useParameters()

  return (
    <div className="flex justify-between bg-blend-darken rounded-lg">
      <div>
        <Caption className="text-muted-foreground"> Ratio</Caption>
        <Text variant={"text2"}> - </Text>
      </div>

      {/* <Separator orientation="vertical" /> */}

      <div>
        <Caption className="text-muted-foreground">No. of price points</Caption>
        <Text variant={"text2"}> {currentParameter?.length}</Text>
      </div>

      {/* <Separator orientation="vertical" /> */}

      <div>
        <Caption className="text-muted-foreground"> Step size</Caption>
        <Text variant={"text2"}> {currentParameter?.stepSize}</Text>
      </div>

      {/* <Separator orientation="vertical" /> */}

      <div>
        <Caption className="text-muted-foreground"> Min price</Caption>
        <Text variant={"text2"}>
          {currentParameter?.minPrice?.toFixed(quote?.decimals)} {quote?.symbol}
        </Text>
      </div>

      {/* <Separator orientation="vertical" /> */}

      <div>
        <Caption className="text-muted-foreground"> Max price</Caption>
        <Text variant={"text2"}>
          {" "}
          {currentParameter?.minPrice?.toFixed(quote?.decimals)} {quote?.symbol}
        </Text>
      </div>
    </div>
  )
}

const UnallocatedInventory = () => {
  const { unallocatedBase, unallocatedQuote, quote, base } = useParameters()
  const [deposit, toggleDeposit] = React.useState(false)
  const [publish, togglePublish] = React.useState(false)
  const [withdraw, toggleWithdraw] = React.useState(false)

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between">
        <div className="flex gap-2 items-center">
          <Title>Unallocated inventory</Title>
          <Info className="h-4 w-4 hover:text-green-caribbean" />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => toggleDeposit(!deposit)}>Deposit</Button>
          <Button onClick={() => togglePublish(!publish)} variant={"secondary"}>
            Publish
          </Button>
          <Button
            onClick={() => toggleWithdraw(!withdraw)}
            variant={"secondary"}
          >
            Withdraw
          </Button>
        </div>
      </div>

      {/* Table */}
      <table className="w-full flex flex-col gap-2 mt-5">
        <thead>
          <tr className="flex justify-between">
            <Caption className="text-muted-foreground">Asset</Caption>
            <Caption className="text-muted-foreground">Amount</Caption>
          </tr>
        </thead>
        <Separator />
        <tbody className="w-full flex flex-col gap-4">
          <tr className="flex justify-between ">
            <Text>{base?.symbol}</Text>
            <Text> - {base?.symbol}</Text>
          </tr>
          <Separator />
          <tr className="flex justify-between">
            <Text>{quote?.symbol}</Text>
            <Text>- {quote?.symbol}</Text>
          </tr>
        </tbody>
        <Separator />
      </table>

      {/* Dialogs */}
      <Deposit open={deposit} onClose={() => toggleDeposit(false)} />
      <Publish open={publish} onClose={() => togglePublish(false)} />
      <Withdraw open={withdraw} onClose={() => toggleWithdraw(false)} />
    </div>
  )
}

const PublishInventory = () => {
  const { quote, base } = useParameters()

  const [unPublish, toggleUnpublish] = React.useState(false)
  const [close, toggleClose] = React.useState(false)

  const table = useInventoryTable({
    data: [
      { amount: "0.00000", asset: "WETH" },
      { amount: "0.0000", asset: "USDC" },
    ],
  })

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between">
        <div className="flex gap-2 items-center">
          <Title>Publish inventory</Title>
          <Info className="h-4 w-4 hover:text-green-caribbean" />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => toggleUnpublish(!unPublish)}>
            Un-publish
          </Button>
          <Button variant={"secondary"}>Close Strategy</Button>
        </div>
      </div>

      {/* Table */}
      <table className="w-full flex flex-col gap-2 mt-5">
        <thead>
          <tr className="flex justify-between">
            <Caption className="text-muted-foreground">Asset</Caption>
            <Caption className="text-muted-foreground">Amount</Caption>
          </tr>
        </thead>
        <Separator />
        <tbody className="w-full flex flex-col gap-4">
          <tr className="flex justify-between ">
            <Text>{base?.symbol}</Text>
            <Text> - {base?.symbol}</Text>
          </tr>
          <Separator />
          <tr className="flex justify-between">
            <Text>{quote?.symbol}</Text>
            <Text>- {quote?.symbol}</Text>
          </tr>
        </tbody>
        <Separator />
      </table>
      {/* <DataTable table={table} isLoading={false} isError={false} /> */}

      {/* Dialogs */}
      <UnPublish open={unPublish} onClose={() => toggleUnpublish(false)} />
    </div>
  )
}

const BountyInventory = () => {
  const [bounty, toggleBounty] = React.useState(false)

  const table = useInventoryTable({
    data: [{ amount: "0.0000", asset: "USDC" }],
  })

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between">
        <div className="flex gap-2 items-center">
          <Title>Bounty</Title>
          <Info className="h-4 w-4 hover:text-green-caribbean" />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => toggleBounty(!bounty)}>Add Bounty</Button>
        </div>
      </div>

      {/* Table */}
      <table className="w-full flex flex-col gap-2 mt-5">
        <thead>
          <tr className="flex justify-between">
            <Caption className="text-muted-foreground">Asset</Caption>
            <Caption className="text-muted-foreground">Amount</Caption>
          </tr>
        </thead>
        <Separator />
        <tbody className="w-full flex flex-col gap-4">
          <tr className="flex justify-between ">
            <Text>MATIC</Text>
            <Text>- MATIC</Text>
          </tr>
        </tbody>
        <Separator />
      </table>
      {/* <DataTable table={table} isLoading={false} isError={false} /> */}

      {/* Dialogs */}
      <Bounty open={bounty} onClose={() => toggleBounty(false)} />
    </div>
  )
}

export default function Parameters() {
  return (
    <div className="space-y-4">
      {/* Price range */}
      <PriceRangeInfos />

      {/* Info */}
      <InfoBar />

      {/* Tables */}
      <div className="pb-5 pt-10 space-y-4">
        <UnallocatedInventory />
        <PublishInventory />
        <BountyInventory />
      </div>
    </div>
  )
}
