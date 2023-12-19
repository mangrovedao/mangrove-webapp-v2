"use client"
import { useChainModal } from "@rainbow-me/rainbowkit"
import React from "react"
import { useNetwork } from "wagmi"

import Dialog from "@/components/dialogs/alert-dialog"
import { Button } from "@/components/ui/button"
import useMangrove from "@/providers/mangrove"
import { cn } from "@/utils"

export function WrongNetworkAlertDialog() {
  const { mangroveQuery } = useMangrove()
  const { openChainModal, chainModalOpen } = useChainModal()
  const { chain } = useNetwork()
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (
      !chainModalOpen &&
      (chain?.unsupported === true || !!mangroveQuery.error === true)
    ) {
      setOpen(true)
    } else {
      setOpen(false)
    }
  }, [chain?.unsupported, chainModalOpen, mangroveQuery.error])

  function handleChangeNetwork() {
    setOpen(false)
    openChainModal?.()
  }

  const title = chain?.unsupported
    ? "Unsupported network"
    : "Error connecting to Mangrove"
  const description = chain?.unsupported ? (
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
            "w-full": chain?.unsupported,
          })}
        >
          {!chain?.unsupported && (
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
