import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useDialogStore } from "@/stores/dialog.store"
import { Button } from "@components/ui/button"

const DialogContent = () => {
  return (
    <div>
      <Input placeholder="Search pairs" />
      <Separator />
    </div>
  )
}

export default function SelectMarket() {
  const { opened, setOpened } = useDialogStore()

  const openMarketDialog = () => {
    useDialogStore.setState({
      opened: true,
      title: "Select a market",
      description: "",
      children: <DialogContent />,
    })
  }

  return (
    <div>
      <Button
        className="w-full 
                  bg-muted 
                  text-primary 
                  hover:text-foreground hover:bg-background 
                  hover:border 
                  hover:border-solid 
                  hover:border-secondary"
        onClick={() => openMarketDialog()}
      >
        ETH/USDC
      </Button>
      <Dialog />
    </div>
  )
}
