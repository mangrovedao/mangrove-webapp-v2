import { Vault } from "@/app/earn/(shared)/types"
import Dialog from "@/components/dialogs/dialog-new"
import { TokenIcon } from "@/components/token-icon-new"
import { Caption } from "@/components/typography/caption"
import { Button } from "@/components/ui/button"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { parseAbi, parseUnits } from "viem"
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { Line } from "../../page"

type Props = {
  infos: {
    baseWithdraw: string
    quoteWithdraw: string
    withdrawAmount: string
  }
  amount: string
  isOpen: boolean
  vault: Vault
  onClose: () => void
}

const burnABI = parseAbi([
  "function burn(uint256 shares, uint256 minAmountBaseOut, uint256 minAmountQuoteOut) external returns (uint256 amountBaseOut, uint256 amountQuoteOut)",
])

export default function RemoveFromVaultDialog({
  isOpen,
  vault,
  amount,
  infos,
  onClose,
}: Props) {
  const { data: hash, isPending, writeContract } = useWriteContract()
  const queryClient = useQueryClient()
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  useEffect(() => {
    if (isConfirmed) {
      queryClient.refetchQueries({
        queryKey: ["vault"],
      })
      onClose()
    }
  }, [isConfirmed, onClose, queryClient])

  return (
    <Dialog open={!!isOpen} onClose={onClose}>
      <Dialog.Title className="flex end-1">Review Withdraw </Dialog.Title>
      <Dialog.Footer>
        <div className="flex flex-col gap-4 flex-1">
          <div>
            <Line
              title={
                <div className="flex gap-2 items-center">
                  <TokenIcon
                    symbol={vault?.market.base.symbol}
                    className="h-8 w-8"
                  />
                  <Caption className="text-text-secondary text-lg">
                    {vault?.market.base.symbol}
                  </Caption>
                </div>
              }
              value={Number(infos.baseWithdraw).toLocaleString(undefined, {
                maximumFractionDigits: vault?.market.base.displayDecimals || 4,
              })}
            />
            <Line
              title={
                <div className="flex gap-2 items-center">
                  <TokenIcon
                    symbol={vault?.market.quote.symbol}
                    className="h-8 w-8"
                  />
                  <Caption className="text-text-secondary text-lg">
                    {vault?.market.quote.symbol}
                  </Caption>
                </div>
              }
              value={Number(infos.quoteWithdraw).toLocaleString(undefined, {
                maximumFractionDigits: vault?.market.quote.displayDecimals || 4,
              })}
            />
            <Line
              title={
                <div className="flex gap-2 items-center">
                  <TokenIcon symbol={vault?.symbol} className="h-8 w-8" />
                  <Caption className="text-text-secondary text-lg">
                    {vault?.symbol}
                  </Caption>
                </div>
              }
              value={Number(infos.withdrawAmount).toLocaleString(undefined, {
                maximumFractionDigits: 4,
              })}
            />
          </div>

          <Button
            className="w-full"
            size="lg"
            disabled={isPending || isConfirming}
            loading={isPending || isConfirming}
            onClick={() => {
              if (!vault) return
              writeContract({
                address: vault.address,
                abi: burnABI,
                functionName: "burn",
                args: [parseUnits(amount, vault.decimals), 0n, 0n],
              })
            }}
          >
            Confirm
          </Button>
          <Dialog.Close>
            <Button variant={"secondary"} className="w-full" size="lg">
              Cancel
            </Button>
          </Dialog.Close>
        </div>
      </Dialog.Footer>
    </Dialog>
  )
}
