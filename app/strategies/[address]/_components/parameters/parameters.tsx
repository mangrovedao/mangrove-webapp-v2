import { Info } from "lucide-react"
import React from "react"

import { Caption } from "@/components/typography/caption"
import { Text } from "@/components/typography/text"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table/data-table"
import PriceRangeInfos from "../shared/price-range-infos"
import { Deposit } from "./dialogs/deposit"
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
  const [deposit, toggleDeposit] = React.useReducer((isOpen) => !isOpen, false)

  const table = useInventoryTable({
    data: [
      { amount: "0.00000", asset: "WETH" },
      { amount: "0.0000", asset: "USDC" },
    ],
  })

  return (
    <div>
      <div className="flex justify-between">
        <div className="flex gap-2 items-center">
          <Title>Unallocated inventory</Title>
          <Info className="h-4 w-4 hover:text-green-caribbean" />
        </div>
        <div className="flex gap-2">
          <Button onClick={toggleDeposit}>Deposit</Button>
          <Button variant={"secondary"}>Publish</Button>
          <Button variant={"secondary"}>Withdraw</Button>
        </div>
      </div>
      <DataTable table={table} isLoading={false} isError={false} />

      <Deposit open={deposit} onClose={toggleDeposit} />
    </div>
  )
}

const PublishInventory = () => {
  const table = useInventoryTable({
    data: [
      { amount: "0.00000", asset: "WETH" },
      { amount: "0.0000", asset: "USDC" },
    ],
  })

  return (
    <div>
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
      <DataTable table={table} isLoading={false} isError={false} />
    </div>
  )
}

const Bounty = () => {
  const table = useInventoryTable({
    data: [{ amount: "0.0000", asset: "USDC" }],
  })

  return (
    <div>
      <div className="flex justify-between">
        <div className="flex gap-2 items-center">
          <Title>Bounty</Title>
          <Info className="h-4 w-4 hover:text-green-caribbean" />
        </div>
        <div className="flex gap-2">
          <Button>Add Bounty</Button>
        </div>
      </div>
      <DataTable table={table} isLoading={false} isError={false} />
    </div>
  )
}

export default function Parameters() {
  return (
    <div className="space-y-4">
      <PriceRangeInfos />
      <InfoBar />
      <div className="pt-10 space-y-4">
        <UnallocatedInventory />
        <PublishInventory />
        <Bounty />
      </div>
      {/* TODO: All informations regarding inventory / dialogs to Retract / Withdraw etc... */}
    </div>
  )
}
