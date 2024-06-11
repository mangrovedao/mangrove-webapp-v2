import { Vault } from "@/app/strategies/(list)/_schemas/vaults"
import Dialog from "@/components/dialogs/dialog"
import { Button } from "@/components/ui/button"

type Props = {
  isOpen: boolean
  vault: Vault
  amount: string
  onClose: () => void
}

export default function RemoveFromVaultDialog({
  isOpen,
  vault,
  onClose,
}: Props) {
  return (
    <Dialog open={!!isOpen} onClose={onClose} type="info">
      <Dialog.Title>Are you sure you want to cancel this order? </Dialog.Title>
      <Dialog.Footer>
        <div className="flex flex-col gap-4 flex-1">
          <Button
            className="w-full"
            size="lg"
            // disabled={cancel.isPending}
            // loading={cancel.isPending}
            // onClick={() => {
            //   if (!(order && market)) return
            //   cancel.mutate({
            //     order,
            //   })
            // }}
          >
            Yes, cancel order
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
