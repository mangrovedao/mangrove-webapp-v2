import { ChevronDown } from "lucide-react"
import React from "react"
import { useChainId, useSwitchChain } from "wagmi"

import Dialog from "@/components/dialogs/dialog"
import { useChains } from "@/providers/chains"
import { cn } from "@/utils"
import { getChainObjectById } from "@/utils/chains"
import { Button } from "./ui/button"
import { XClose } from "./ui/dialog"
import { ImageWithHideOnError } from "./ui/image-with-hide-on-error"

export default function ChainSelector() {
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { chains, isChainDialogOpen, setIsChainDialogOpen } = useChains()
  const chain = getChainObjectById(chainId.toString())

  // Close dialog if the chain id has changed
  React.useEffect(() => {
    setIsChainDialogOpen?.(false)
  }, [chain?.id])

  function openDialog() {
    setIsChainDialogOpen?.(true)
  }

  function closeDialog() {
    setIsChainDialogOpen?.(false)
  }

  return (
    <>
      <Dialog
        open={!!isChainDialogOpen}
        onClose={closeDialog}
        showCloseButton={false}
        className="p-0 !max-w-96 max-h-96"
      >
        <div className="flex justify-between items-center px-4 sticky top-0 bg-background py-4">
          <h1 className="text-xl font-extrabold">Switch Networks</h1>
          <Dialog.Close>
            <XClose />
          </Dialog.Close>
        </div>
        <Dialog.Description className="space-y-1 py-2 overflow-hidden">
          {chains.map(({ id, name }) => (
            <div key={id} className="px-2">
              <Button
                className={cn(
                  "text-left text-lg w-full flex items-center px-4 space-x-2",
                  {
                    "bg-green-bangladesh": chain?.id === id,
                  },
                )}
                variant={"invisible"}
                onClick={() => {
                  switchChain({
                    chainId: id,
                  })
                }}
              >
                <ImageWithHideOnError
                  src={`https://icons.llamao.fi/icons/chains/rsz_${name.toLowerCase().replaceAll(" ", "_")}.jpg`}
                  alt=""
                  className="rounded-full overflow-hidden"
                  width={28}
                  height={28}
                />
                <span>{name}</span>
              </Button>
            </div>
          ))}
        </Dialog.Description>
      </Dialog>
      <Button
        variant="invisible"
        className={"!space-x-4 lg:flex items-center hidden"}
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
