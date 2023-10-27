import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useDialogStore } from "@/stores/dialog.store"
import { Button } from "@components/ui/button"
import { ChevronDown } from "lucide-react"

const DialogContent = () => {
  return (
    <div>
      <Input placeholder="Search pairs" />
      <Separator />s
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
        className="w-full justify-between bg-[#020817] text-primary hover:text-secondary hover:bg-primary"
        onClick={openMarketDialog}
      >
        BASE/QUOTE <ChevronDown />
      </Button>
      <Dialog />
    </div>
  )
}
