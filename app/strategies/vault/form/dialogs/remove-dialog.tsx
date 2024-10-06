import type { Vault } from "@/app/strategies/(list)/_schemas/vaults"
import Dialog from "@/components/dialogs/dialog"
import { Button } from "@/components/ui/button-old"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { parseAbi } from "viem"
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi"

type Props = {
  isOpen: boolean
  vault: Vault
  amount: bigint
  onClose: () => void
}

const burnABI = parseAbi([
  "function burn(uint256 burnAmount,uint256[2] calldata minAmountsOut) external returns (uint256 amount0, uint256 amount1)",
])

export default function RemoveFromVaultDialog({
  isOpen,
  vault,
  amount,
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
    <Dialog open={!!isOpen} onClose={onClose} type="info">
      <Dialog.Title>Are you sure you want to remove liquidity ? </Dialog.Title>
      <Dialog.Footer>
        <div className="flex flex-col gap-4 flex-1">
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
                args: [amount, [0n, 0n]],
              })
            }}
          >
            Yes, remove liquidity
          </Button>
          <Dialog.Close>
            <Button variant={"secondary"} className="w-full" size="lg">
              No, cancel
            </Button>
          </Dialog.Close>
        </div>
      </Dialog.Footer>
    </Dialog>
  )
}
