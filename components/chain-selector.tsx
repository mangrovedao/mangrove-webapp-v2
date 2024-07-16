import { ChevronDown } from "lucide-react"
import React from "react"
import { useChainId, useSwitchChain } from "wagmi"

import Dialog from "@/components/dialogs/dialog"
import { useChains } from "@/providers/chains"
import { Button } from "./ui/button"
import { ImageWithHideOnError } from "./ui/image-with-hide-on-error"

export default function ChainSelector() {
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { chains } = useChains()
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const chain = chains.find((c) => c.id === chainId)

  // Close dialog if the chain id has changed
  React.useEffect(() => {
    setIsDialogOpen(false)
  }, [chain?.id])

  function openDialog() {
    setIsDialogOpen(true)
  }

  function closeDialog() {
    setIsDialogOpen(false)
  }

  return (
    <>
      <Dialog open={isDialogOpen} onClose={closeDialog}>
        <Dialog.Description>
          {chains.map(({ id, name }) => (
            <div key={id}>
              <Button
                variant={"link"}
                onClick={() =>
                  switchChain({
                    chainId: id,
                  })
                }
              >
                {name}
              </Button>
            </div>
          ))}
        </Dialog.Description>
      </Dialog>
      <Button
        variant="invisible"
        className="!space-x-4 lg:flex items-center hidden"
        size="sm"
        onClick={openDialog}
      >
        <span className="flex space-x-2">
          <ImageWithHideOnError
            src={`/assets/chains/${chainId}.webp`}
            width={16}
            height={16}
            className="h-4 rounded-sm"
            key={chainId}
            alt={`${chain?.name}-logo`}
          />
          <span className="text-sm whitespace-nowrap">{chain?.name}</span>
        </span>
        <div className="pl-2">
          <ChevronDown className="w-3" />
        </div>
      </Button>
    </>
  )
}
