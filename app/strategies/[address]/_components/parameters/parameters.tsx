"use client"

import { Info } from "lucide-react"
import React from "react"

import { Caption } from "@/components/typography/caption"
import { Text } from "@/components/typography/text"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table/data-table"
import PriceRangeInfos from "../shared/price-range-infos"
import { Bounty } from "./dialogs/bounty"
import { Deposit } from "./dialogs/deposit"
import { Publish } from "./dialogs/publish"
import { UnPublish } from "./dialogs/unpublish"
import { Withdraw } from "./dialogs/withdraw"
import { useInventoryTable } from "./table/use-inventory-table"

const InfoBar = () => {
  return (
    <div className="flex justify-between bg-blend-darken rounded-lg">
      <div>
        <Caption className="text-muted-foreground"> Ratio</Caption>
        <Text variant={"text2"}> 1.29432</Text>
      </div>

      {/* <Separator orientation="vertical" /> */}

      <div>
        <Caption className="text-muted-foreground">No. of price points</Caption>
        <Text variant={"text2"}> 4</Text>
      </div>

      {/* <Separator orientation="vertical" /> */}

      <div>
        <Caption className="text-muted-foreground"> Step size</Caption>
        <Text variant={"text2"}> 1</Text>
      </div>

      {/* <Separator orientation="vertical" /> */}

      <div>
        <Caption className="text-muted-foreground"> Min price</Caption>
        <Text variant={"text2"}> 1500.00 USDC</Text>
      </div>

      {/* <Separator orientation="vertical" /> */}

      <div>
        <Caption className="text-muted-foreground"> Max price</Caption>
        <Text variant={"text2"}> 2100.00 USDC</Text>
      </div>
    </div>
  )
}

const UnallocatedInventory = () => {
  const [deposit, toggleDeposit] = React.useState(false)
  const [publish, togglePublish] = React.useState(false)
  const [withdraw, toggleWithdraw] = React.useState(false)

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
      {/* <DataTable table={table} isLoading={false} isError={false} /> */}

      {/* Dialogs */}

      <Deposit open={deposit} onClose={() => toggleDeposit(false)} />
      <Publish open={publish} onClose={() => togglePublish(false)} />
      <Withdraw open={withdraw} onClose={() => toggleWithdraw(false)} />
    </div>
  )
}

const PublishInventory = () => {
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
          <Button>Un-publish</Button>
          <Button variant={"secondary"}>Close Strategy</Button>
        </div>
      </div>

      {/* Table */}
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
      <DataTable table={table} isLoading={false} isError={false} />

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
      <div className="pt-10 space-y-4">
        <UnallocatedInventory />
        <PublishInventory />
        <BountyInventory />
      </div>
    </div>
  )
}
