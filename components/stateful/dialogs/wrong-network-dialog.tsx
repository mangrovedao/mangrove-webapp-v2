"use client"
import React from "react"
import { useAccount } from "wagmi"

import Dialog from "@/components/dialogs/alert-dialog"
import { Button } from "@/components/ui/button-old"
import { useChains } from "@/providers/chains"
import { cn } from "@/utils"

export function WrongNetworkAlertDialog() {
  const { chain, isConnected, isConnecting } = useAccount()
  const { chains, isChainDialogOpen, setIsChainDialogOpen } = useChains()
  const isNetworkSupported = !!chains?.find((c) => c.id === chain?.id)

  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (
      !isChainDialogOpen &&
      isConnected &&
      !isNetworkSupported &&
      !!chains?.length
    ) {
      setOpen(true)
    } else {
      setOpen(false)
    }
  }, [chain, chains, isNetworkSupported, isChainDialogOpen, isConnecting])

  function handleChangeNetwork() {
    setOpen(false)
    setIsChainDialogOpen?.(true)
  }

  const title = !isNetworkSupported
    ? "Unsupported network"
    : "Error connecting to Mangrove"
  const description = !isNetworkSupported ? (
    "Mangrove does not support this network yet."
  ) : (
    <div>
      Page failed to load. <br />
      Please refresh page or change network.
    </div>
  )

  return (
    <Dialog open={open} type="error">
      <Dialog.Title>{title}</Dialog.Title>
      <Dialog.Description>{description}</Dialog.Description>
      <Dialog.Footer className="!justify-center">
        <div
          className={cn("flex space-x-2 justify-center", {
            "w-full": !isNetworkSupported,
          })}
        >
          {isNetworkSupported && (
            <Button
              size={"lg"}
              variant={"tertiary"}
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
          )}
          <Button
            size={"lg"}
            className="w-full flex-1"
            rightIcon
            onClick={handleChangeNetwork}
          >
            Change network
          </Button>
        </div>
      </Dialog.Footer>
    </Dialog>
  )
}
