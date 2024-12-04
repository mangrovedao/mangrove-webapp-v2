"use client"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import React from "react"
import { isMobile } from "react-device-detect"

import Dialog from "@/components/dialogs/alert-dialog-new"
import MobileOverlay from "@/components/mobile-overlay"
import { Button } from "@/components/ui/button"
import withClientOnly from "@/hocs/withClientOnly"
import useLocalStorage from "@/hooks/use-local-storage"
import { config } from "@/providers/wallet-connect"
import { cn } from "@/utils"
import { useAccount, useSignMessage } from "wagmi"

function DisclaimerDialog() {
  const { isConnected, address } = useAccount()

  const { openConnectModal } = useConnectModal()

  const [hideDisclaimer, setHideDisclaimer] = useLocalStorage<boolean | null>(
    `hideDisclaimer_${address}`,
    null,
  )
  const [hasSignedDisclaimer, setHasSignedDisclamer] = useLocalStorage<
    boolean | null
  >(`hasSignedDisclaimer_${address}`, null)

  const signature = useSignMessage({
    config,
  })

  const buttonLabel = isConnected ? "Accept terms" : "Connect to Wallet"

  React.useEffect(() => {
    if (isConnected && !hasSignedDisclaimer) {
      setHideDisclaimer(false)
    }
  }, [isConnected, hasSignedDisclaimer])

  React.useEffect(() => {
    if (address) {
      const storedHasSignedDisclaimer = localStorage.getItem(
        `hasSignedDisclaimer_${address}`,
      )
      if (storedHasSignedDisclaimer !== "true") {
        setHideDisclaimer(false)
      } else {
        setHideDisclaimer(true)
      }
    }
  }, [address])

  async function handleAcceptTerms() {
    try {
      if (!isConnected) {
        setHideDisclaimer(true)
        openConnectModal?.()
        return
      }

      await signature.signMessageAsync({
        message:
          "Welcome to the Mangrove dApp!\nThe use of this app is subject to the terms of use\nhttps://mangrove.exchange/terms-of-use\n\nBy signing this message:\nYou confirm that you are not accessing this app from\nor are a resident of the USA or any other restricted\ncountry.",
      })

      setHasSignedDisclamer(true)
      setHideDisclaimer(true)
    } catch (error) {
      console.error(error)
    }
  }

  if (isMobile) {
    return <MobileOverlay />
  }

  return (
    <Dialog open={!hideDisclaimer} type="mangrove">
      <Dialog.Title>Welcome to the Mangrove dApp!</Dialog.Title>
      <Dialog.Description>
        <div>
          The use of this app is subject to the following{" "}
          <a
            href="https://mangrove.exchange/terms-of-use"
            target="_blank"
            rel="noreferrer"
            className={"text-green-caribbean no-underline hover:underline"}
          >
            Terms of Use.
          </a>
        </div>
      </Dialog.Description>
      <Dialog.Footer className="!justify-center">
        <div className="flex flex-col space-y-4">
          <div className="items-top flex space-x-2">
            <div className="grid gap-1.5 leading-none hover:opacity-80">
              <label
                htmlFor="terms1"
                className="text-sm font-medium leading-none text-text-secondary "
              >
                By signing this message you confirm that you are not accessing
                this app from or are a resident of the USA or any other
                restricted country.
                <span>
                  {" "}
                  For more information, please read our{" "}
                  <a
                    href="https://mangrove.exchange/terms-of-use"
                    target="_blank"
                    rel="noreferrer"
                    className={
                      "text-green-caribbean no-underline hover:underline"
                    }
                  >
                    Terms of Use.
                  </a>
                </span>
              </label>
            </div>
          </div>
          <div className={cn("flex space-x-2 justify-center")}>
            <Button
              loading={signature.isPending}
              size={"lg"}
              className="w-full flex-1"
              onClick={handleAcceptTerms}
              disabled={signature.isPending && !signature.error}
            >
              {buttonLabel}
            </Button>
          </div>
        </div>
      </Dialog.Footer>
    </Dialog>
  )
}

export default withClientOnly(DisclaimerDialog)
