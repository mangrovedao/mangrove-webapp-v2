import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useChangeNetworkDialogStore } from "@/stores/change-network-dialog.store"
import { Button } from "@components/ui/button"
import { useWeb3Modal } from "@web3modal/wagmi/react"

export default function ChangeNetworkDialog() {
  const { open } = useWeb3Modal()
  const { opened, setOpened } = useChangeNetworkDialogStore()
  function handleChangeNetwork() {
    setOpened(false)
    open({
      view: "Networks",
    })
  }
  return (
    <Dialog open={opened} onOpenChange={setOpened}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Wrong network</DialogTitle>
          <DialogDescription>
            Mangrove does not support this network.
          </DialogDescription>
        </DialogHeader>
        <Button onClick={handleChangeNetwork}>Change network</Button>
      </DialogContent>
    </Dialog>
  )
}
