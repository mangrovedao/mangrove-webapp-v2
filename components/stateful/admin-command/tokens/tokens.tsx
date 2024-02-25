"use client"
import { useAccount } from "wagmi"

import { TokenIcon } from "@/components/token-icon"
import { CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { useWhitelistedMarketsInfos } from "@/hooks/use-whitelisted-markets-infos"
import useMangrove from "@/providers/mangrove"
import { toast } from "sonner"
import { ActionButton } from "../action-button"
import { Footer } from "../footer"

export function Tokens({ onBack }: { onBack: () => void }) {
  const { mangrove } = useMangrove()
  const { chain } = useAccount()
  const blockExplorerUrl = chain?.blockExplorers?.default.url
  const tokensQuery = useWhitelistedMarketsInfos(mangrove, {
    select: (whitelistedMarkets) => {
      const tokens = whitelistedMarkets.flatMap(
        ({ base, quote, tickSpacing, asksConfig, bidsConfig }) => [
          {
            id: base.id,
            symbol: base.symbol,
            address: base.address?.toLowerCase(),
            tickSpacing,
            asksConfig,
            bidsConfig,
          },
          {
            id: quote.id,
            symbol: quote.symbol,
            address: quote.address?.toLowerCase(),
            tickSpacing,
            asksConfig,
            bidsConfig,
          },
        ],
      )

      const uniqueTokens = Array.from(
        new Set(tokens.map((token) => token.id)),
      ).map((id) => tokens.find((token) => token.id === id))

      return uniqueTokens
    },
  })

  function copyToClipboard() {
    navigator.clipboard.writeText(JSON.stringify(tokensQuery.data)).then(
      () => {
        toast.success("Copied to clipboard")
      },
      () => {
        toast.error("Failed to copy text")
      },
    )
  }

  return (
    <>
      <CommandList>
        <CommandGroup>
          {tokensQuery.data?.map((token) => {
            const url = `${blockExplorerUrl}/address/${token?.address}`
            return (
              <CommandItem
                key={token?.id}
                className="space-x-1 text-xs"
                onSelect={() => {
                  window.open(url, "_blank")
                }}
              >
                <div rel="noreferrer" className="flex space-x-2 items-center">
                  <TokenIcon symbol={token?.symbol} className="h-6 w-6" />
                  <span>
                    <div className="font-bold">{token?.id}</div>
                    <div>{token?.symbol}</div>
                  </span>
                </div>
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
      <Footer>
        <ActionButton keys={["⌘", "j"]} onClick={copyToClipboard}>
          Copy json
        </ActionButton>
        <ActionButton keys={["⌘", "←"]} onClick={onBack}>
          Back
        </ActionButton>
      </Footer>
    </>
  )
}
