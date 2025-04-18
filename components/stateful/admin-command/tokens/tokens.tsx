"use client"
import { useAccount } from "wagmi"

import { TokenIcon } from "@/components/token-icon"
import { CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { useOpenMarkets } from "@/hooks/use-open-markets"
import { toast } from "sonner"
import { ActionButton } from "../action-button"
import { Footer } from "../footer"

export function Tokens({ onBack }: { onBack: () => void }) {
  const { chain } = useAccount()
  const blockExplorerUrl = chain?.blockExplorers?.default.url
  const { tokens } = useOpenMarkets()

  function copyToClipboard() {
    navigator.clipboard.writeText(JSON.stringify(tokens)).then(
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
          {tokens.map((token) => {
            const url = `${blockExplorerUrl}/address/${token?.address}`
            return (
              <CommandItem
                key={token?.address}
                className="space-x-1 text-xs"
                onSelect={() => {
                  window.open(url, "_blank")
                }}
              >
                <div rel="noreferrer" className="flex space-x-2 items-center">
                  <TokenIcon symbol={token?.symbol} className="h-6 w-6" />
                  <span>
                    <div className="font-bold">{token?.address}</div>
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
