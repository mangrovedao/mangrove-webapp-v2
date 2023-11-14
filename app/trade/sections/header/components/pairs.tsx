import MarketSelector from "@/components/stateful/market-selector"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useDialogStore } from "@/stores/dialog.store"

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

  return <MarketSelector />

  // return (
  //   <div>
  //     <Button
  //       className="w-full
  //                 bg-muted
  //                 text-primary
  //                 hover:text-foreground hover:bg-background
  //                 hover:border
  //                 hover:border-solid
  //                 hover:border-secondary"
  //       onClick={() => openMarketDialog()}
  //     >
  //       <div className="flex -space-x-2">
  //         <TokenIcon symbol="ETH" />
  //         <TokenIcon symbol="USDC" />
  //       </div>
  //       ETH/USDC
  //     </Button>
  //     <Dialog />
  //   </div>
  // )
}
