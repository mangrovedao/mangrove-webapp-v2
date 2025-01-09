"use client"
import React from "react"
import { useAccount, useSignMessage } from "wagmi"

import Dialog from "@/components/dialogs/dialog"
import { Button } from "@/components/ui/button"
import withClientOnly from "@/hocs/withClientOnly"
import { config } from "@/providers/wallet-connect"
import { useDisclaimerDialog } from "@/stores/disclaimer-dialog.store"
import { cn } from "@/utils"

function DisclaimerDialog() {
  const { isConnected, address } = useAccount()
  const { isOpen, closeDisclaimer, hideDisclaimer, setHideDisclaimer } =
    useDisclaimerDialog()

  const signature = useSignMessage({
    config,
  })

  React.useEffect(() => {
    if (isConnected && address && hideDisclaimer[address] === undefined) {
      setHideDisclaimer(address, false)
    }
  }, [isConnected, address])

  async function handleAcceptTerms() {
    try {
      await signature.signMessageAsync({
        message:
          "Welcome to the Mangrove dApp!\nThe use of this app is subject to the terms of use\nhttps://mangrove.exchange/terms-of-use\n\nBy signing this message:\nYou confirm that you are not accessing this app from\nor are a resident of the USA or any other restricted\ncountry.",
      })

      if (address) {
        setHideDisclaimer(address, true)
      }
      closeDisclaimer()
    } catch (error) {
      console.error(error)
    }
  }

  if (!isConnected) {
    return null
  }

  return (
    <Dialog
      open={isOpen && !hideDisclaimer[address ?? ""]}
      type="mangrove"
      onClose={closeDisclaimer}
    >
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
      <Dialog.Footer>
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
              Accept terms
            </Button>
          </div>
        </div>
      </Dialog.Footer>
    </Dialog>
  )
}

export default withClientOnly(DisclaimerDialog)
