import React from "react"
import { useSwitchChain } from "wagmi"

import Dialog from "@/components/dialogs/dialog"
import { useDefaultChain } from "@/hooks/use-default-chain"
import { useChains } from "@/providers/chains"
import { cn } from "@/utils"
import { getChainObjectById } from "@/utils/chains"
import { Button } from "./ui/button"
import { XClose } from "./ui/dialog"
import { ImageWithHideOnError } from "./ui/image-with-hide-on-error"

function getIconFromChainlist(name: string) {
  let icon = name

  if (icon.includes("Arbitrum One")) {
    icon = "arbitrum"
  }

  return `https://icons.llamao.fi/icons/chains/rsz_${icon.toLowerCase().replaceAll(" ", "_")}.jpg`
}

export default function ChainSelector() {
  const { defaultChain } = useDefaultChain()

  const { switchChain } = useSwitchChain()
  const { chains, isChainDialogOpen, setIsChainDialogOpen } = useChains()
  const chain = getChainObjectById(defaultChain.id?.toString())

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
        <div className="sticky top-0 inset-x-0 bg-background">
          <div className="flex justify-between items-center px-4 py-4">
            <h1 className="text-xl font-extrabold">Switch Networks</h1>
            <Dialog.Close>
              <XClose />
            </Dialog.Close>
          </div>
        </div>
        <Dialog.Description className="space-y-1 py-2 overflow-hidden">
          {chains?.map(({ id, name }) => (
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
                  src={`/assets/chains/${id}.webp`}
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
        size="sm"
        variant="secondary"
        className="hidden md:flex items-center h-[38px] gap-1 bg-bg-tertiary hover:bg-bg-secondary text-text-primary rounded-sm px-3 py-1.5 text-xs font-medium transition-colors border-transparent"
        onClick={openDialog}
      >
        <span className="flex space-x-2">
          <ImageWithHideOnError
            src={`/assets/chains/${defaultChain.id}.webp`}
            width={16}
            height={16}
            className="h-5 rounded-sm size-5"
            key={defaultChain.id}
            alt={`${chain?.name}-logo`}
          />
          {/* <span className="text-sm whitespace-nowrap">{chain?.name}</span> */}
        </span>
        {/* <div className="pl-2"> */}
        {/* <ChevronDown className="w-5" /> */}
        {/* </div> */}
      </Button>
    </>
  )
}
