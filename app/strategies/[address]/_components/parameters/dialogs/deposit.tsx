"use client"
import type Mangrove from "@mangrovedao/mangrove.js"
import React from "react"

import Dialog from "@/components/dialogs/dialog"
import { EnhancedNumericInput } from "@/components/token-input"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import { useWhitelistedMarketsInfos } from "@/hooks/use-whitelisted-markets-infos"
import useMangrove from "@/providers/mangrove"
import { useRouter } from "next/navigation"

type Props = {
  open: boolean
  onClose: () => void
}

export function Deposit({ open, onClose }: Props) {
  const router = useRouter()
  const { mangrove } = useMangrove()
  const marketsInfosQuery = useWhitelistedMarketsInfos(mangrove)
  const [marketInfo, setMarketInfo] = React.useState<
    Mangrove.OpenMarketInfo | undefined
  >()

  return (
    <Dialog open={!!open} onClose={onClose} showCloseButton={true}>
      <Dialog.Title className="text-xl text-left" close>
        <Title
          as={"div"}
          variant={"header1"}
          className="space-x-3 flex items-center"
        >
          Deposit
        </Title>
      </Dialog.Title>
      <Dialog.Description className="text-left !mt-8">
        <div className="grid gap-4">
          <EnhancedNumericInput label={"WETH amount"} showBalance />
          <EnhancedNumericInput label={"USDC amount"} showBalance />
        </div>
      </Dialog.Description>
      <Dialog.Footer className="flex">
        <Button
          size="lg"
          rightIcon
          className="w-2/3"
          disabled={!marketInfo}
          onClick={() => undefined}
        >
          Proceed
        </Button>
      </Dialog.Footer>
    </Dialog>
  )
}
