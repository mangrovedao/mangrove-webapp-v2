import { Token } from "@mangrovedao/mgv"
import { Address } from "viem"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog-new"
import { Button } from "@/components/ui/button"
import { TokenIcon } from "@/components/token-icon"
import { ODOS_API_IMAGE_URL } from "@/hooks/odos/constants"
import { useState } from "react"
import { Input } from "@/components/ui/input"

export function TokenSelectorDialog({
  tokens,
  onSelect,
  open = false,
  onOpenChange,
  type,
  mangroveTradeableTokens,
}: {
  open?: boolean
  tokens: Token[]
  onSelect: (token: Token) => void
  onOpenChange: (open: boolean) => void
  type: "buy" | "sell"
  mangroveTradeableTokens: Address[]
}) {
  const [search, setSearch] = useState("")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select a token to {type}</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Search"
          className="m-3 w-[90%] mr-5 h-10"
          type="text"
          value={search}
          // @ts-ignore
          onInput={(e) => setSearch(e.target.value)}
        />
        <div className="flex flex-col space-y-2 justify-start p-3 pt-1 overflow-y-auto max-h-[400px]">
          {tokens
            .filter(
              (token) =>
                token.symbol.toLowerCase().includes(search.toLowerCase()) ||
                token.address.toLowerCase().includes(search.toLowerCase()),
            )
            .sort((a, b) => {
              const aIsTradeableOnMangrove = mangroveTradeableTokens.includes(
                a.address,
              )
              const bIsTradeableOnMangrove = mangroveTradeableTokens.includes(
                b.address,
              )
              if (aIsTradeableOnMangrove && !bIsTradeableOnMangrove) return -1
              if (!aIsTradeableOnMangrove && bIsTradeableOnMangrove) return 1
              return a.symbol.localeCompare(b.symbol)
            })
            .map((token) => (
              <div key={token.address}>
                <Button
                  onClick={() => onSelect(token)}
                  className="w-full bg-bg-blush-pearl hover:bg-bg-subtle-hover hover:!text-white text-black-rich px-2 py-1 border rounded-sm text-sm flex items-center space-x-2"
                >
                  <div className="relative">
                    <TokenIcon
                      symbol={token.symbol}
                      imgClasses="rounded-sm w-7"
                      customSrc={ODOS_API_IMAGE_URL(token.symbol)}
                      useFallback={true}
                    />
                  </div>
                  <span className="font-semibold text-lg">{token.symbol}</span>
                </Button>
              </div>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
