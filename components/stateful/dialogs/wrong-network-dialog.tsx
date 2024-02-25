"use client"
import { useChainModal } from "@rainbow-me/rainbowkit"
import React from "react"
import { useAccount, useConfig } from "wagmi"

import Dialog from "@/components/dialogs/alert-dialog"
import { Button } from "@/components/ui/button"
import useMangrove from "@/providers/mangrove"
import { cn } from "@/utils"

export function WrongNetworkAlertDialog() {
  const { mangroveQuery } = useMangrove()
  const { openChainModal, chainModalOpen } = useChainModal()
  const { chain } = useAccount()
  const { chains } = useConfig()
  const isNetworkSupported = chains.find((c) => c.id === chain?.id)

  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (
      !chainModalOpen &&
      (!isNetworkSupported || !!mangroveQuery.error === true)
    ) {
      setOpen(true)
    } else {
      setOpen(false)
    }
  }, [chain, isNetworkSupported, chainModalOpen, mangroveQuery.error])

  function handleChangeNetwork() {
    setOpen(false)
    openChainModal?.()
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
