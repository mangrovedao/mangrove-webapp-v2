import { Vault } from "@/app/earn/(shared)/types"
import Dialog from "@/components/dialogs/dialog-new"
import { Caption } from "@/components/typography/caption"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { toast } from "sonner"
import { parseAbi, parseUnits } from "viem"
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { DialogAmountLine } from "./utils"

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
      toast.success(`Assets successfully withdrawn`)
      queryClient.refetchQueries({
        queryKey: ["vault"],
      })
      queryClient.refetchQueries({
        queryKey: ["user-vaults"],
      })
      onClose()
    }
  }, [isConfirmed, onClose, queryClient])

  return (
    <Dialog open={!!isOpen} onClose={onClose} showCloseButton={false}>
      <Dialog.Title className="flex end">Review Withdraw </Dialog.Title>
      <Dialog.Description className="p-3 space-y-2">
        <Caption className="flex justify-start">You will receive</Caption>
        <DialogAmountLine
          amount={Number(infos.baseWithdraw).toLocaleString(undefined, {
            maximumFractionDigits: vault?.market.base.displayDecimals || 4,
          })}
          estimationAmount={(
            Number(infos.baseWithdraw) * vault.baseDollarPrice
          ).toLocaleString(undefined, {
            maximumFractionDigits: vault?.market.base.displayDecimals || 4,
          })}
          symbol={vault?.market.base.symbol}
        />
        <DialogAmountLine
          amount={Number(infos.quoteWithdraw).toLocaleString(undefined, {
            maximumFractionDigits: vault?.market.quote.displayDecimals || 4,
          })}
          estimationAmount={(
            Number(infos.quoteWithdraw) * vault.quoteDollarPrice
          ).toLocaleString(undefined, {
            maximumFractionDigits: vault?.market.quote.displayDecimals || 4,
          })}
          symbol={vault?.market.quote.symbol}
        />

        <Separator className="my-4" />

        <Caption className="flex justify-start">You will withdraw</Caption>

        <DialogAmountLine
          amount={Number(infos.withdrawAmount).toLocaleString(undefined, {
            maximumFractionDigits: 4,
          })}
          estimationAmount={(
            Number(infos.baseWithdraw) * vault.baseDollarPrice +
            Number(infos.quoteWithdraw) * vault.quoteDollarPrice
          ).toLocaleString(undefined, {
            maximumFractionDigits: vault?.market.quote.displayDecimals || 4,
          })}
          symbol={vault?.symbol}
        />
      </Dialog.Description>
      <Dialog.Footer>
        <div className="flex w-full gap-4">
          <Dialog.Close className="w-full">
            <Button
              variant={"secondary"}
              size="md"
              className="w-full"
              disabled={isPending || isConfirming}
            >
              Cancel
            </Button>
          </Dialog.Close>
          <Button
            size="md"
            className="w-full"
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
        </div>
      </Dialog.Footer>
    </Dialog>
  )
}
