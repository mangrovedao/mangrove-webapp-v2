import { TokenIcon } from "@/components/token-icon"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog-new"
import { Input } from "@/components/ui/input"
import { ODOS_API_IMAGE_URL } from "@/hooks/odos/constants"
import { Token } from "@mangrovedao/mgv"
import { CopyCheck, CopyIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { formatUnits } from "viem"

export function TokenSelectorDialog({
  tokens,
  onSelect,
  open = false,
  onOpenChange,
  type,
  balances,
}: {
  open?: boolean
  tokens: Token[]
  onSelect: (token: Token, type: "pay" | "receive" | null) => void
  onOpenChange: (type: "pay" | "receive" | null) => void
  type: "pay" | "receive" | null
  balances: { balance: bigint; address: string }[]
}) {
  const [search, setSearch] = useState<string>("")
  const [copiedAddress, setCopiedAddress] = useState<string>("")

  console.log('search', search)
  useEffect(() => {
    if (copiedAddress) {
      setTimeout(() => {
        setCopiedAddress("")
      }, 2500)
    }
  }, [copiedAddress])

  const filteredTokens = useMemo(() => {
    if (!search) return tokens
    return tokens.filter((token) => {
      return (
        token.symbol.toLowerCase().includes(search.toLowerCase()) ||
        token.address.toLowerCase().includes(search.toLowerCase())
      )
    })
  }, [tokens, search])

  return (
    <Dialog open={open} onOpenChange={() => onOpenChange(null)}>
      <DialogContent>
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
          type="text"
          value={search}
          /* @ts-ignore */
          onInput={(e) => setSearch(e.target.value)}
        />
        <div className="flex flex-col overflow-y-auto min-h-[400px] max-h-[400px]">
          {filteredTokens.map((token) => {
            const balance = balances.find(
              (b) => b.address === token.address,
            )?.balance
            return (
              <div
                key={token.address}
                onClick={() => onSelect(token, type)}
                className="w-full text-white px-4 cursor-pointer transition-all py-4 flex items-center justify-between text-sm hover:bg-[#ffffff20]"
              >
                <div className="flex items-center gap-2 ">
                  <div className="relative">
                    <TokenIcon
                      symbol={token.symbol}
                      imgClasses="rounded-sm w-7"
                      customSrc={ODOS_API_IMAGE_URL(token.symbol)}
                      useFallback={true}
                    />
                  </div>
                  <span className="text-md mt-1">{token.symbol}</span>
                </div>
                <div className="text-white text-right">
                  <div className="opacity-80">
                    {balance && Number(formatUnits(balance as bigint, token.decimals))?.toFixed(4)}
                  </div>
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
