import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog-new"
import { Input } from "@/components/ui/input"
import { CopyCheck, CopyIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { TokenMetadata } from "../utils/tokens"

export function TokenSelectorDialog({
  tokens,
  onSelect,
  open = false,
  onOpenChange,
  type,
  search,
  onSearchChange,
}: {
  open?: boolean
  tokens: TokenMetadata[]
  onSelect: (token: TokenMetadata, type: "pay" | "receive" | null) => void
  onOpenChange: (type: "pay" | "receive" | null) => void
  type: "pay" | "receive" | null
  search?: string
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const [copiedAddress, setCopiedAddress] = useState<string>("")

  useEffect(() => {
    if (copiedAddress) {
      setTimeout(() => {
        setCopiedAddress("")
      }, 2500)
    }
  }, [copiedAddress])

  const filteredTokens = useMemo(() => {
    if (!search) return tokens
    const lowerSearch = search.toLowerCase()

    return tokens.filter((token) => {
      return (
        token.symbol.toLowerCase().includes(lowerSearch) ||
        token.address.toLowerCase().includes(lowerSearch)
      )
    })
  }, [tokens, search])

  return (
    <Dialog open={open} onOpenChange={() => onOpenChange(null)}>
      <DialogContent forceMount>
        <DialogHeader className="border-none">
          <DialogTitle className="border-none font-normal">
            <div>Select a token to {type === "pay" ? "Buy" : "Sell"}</div>
            <div className="text-white opacity-80 text-sm pt-4">
              Select a token from our default list or find one by address or
              symbol using the search bar
            </div>
          </DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Search by symbol or address"
          className="m-3 w-[90%] mr-5 h-10 placeholder:text-xs"
          value={search}
          type="text"
          onChange={onSearchChange}
        />
        <div className="flex flex-col overflow-y-auto min-h-[400px] max-h-[400px]">
          {filteredTokens.map((token) => {
            return (
              <div
                key={token.address}
                onClick={() => onSelect(token, type)}
                className="w-full text-white px-4 cursor-pointer transition-all py-4 flex items-center justify-between text-sm hover:bg-[#ffffff20]"
              >
                <div className="flex items-center gap-2 ">
                  <div className="relative">
                    <img src={token.icon} className="rounded-sm w-7" />
                  </div>
                  <span className="text-md mt-1">{token.symbol}</span>
                </div>
                <div className="text-white text-right">
                  <div className="opacity-70 text-xs flex items-center gap-1">
                    {`${token.address.slice(0, 4)}...${token.address.slice(-3)}`}{" "}
                    {copiedAddress === token.address ? (
                      <CopyCheck size={10} />
                    ) : (
                      <CopyIcon
                        className="cursor-pointer"
                        onClick={() => {
                          navigator.clipboard.writeText(token.address)
                          setCopiedAddress(token.address)
                        }}
                        size={10}
                      />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
