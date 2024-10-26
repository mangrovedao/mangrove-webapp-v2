"use client"
import { CheckedState } from "@radix-ui/react-checkbox"
import React from "react"
import { isMobile } from "react-device-detect"

import Dialog from "@/components/dialogs/alert-dialog"
import MobileOverlay from "@/components/mobile-overlay"
import { Button } from "@/components/ui/button-old"
import { Checkbox } from "@/components/ui/checkbox"
import withClientOnly from "@/hocs/withClientOnly"
import useLocalStorage from "@/hooks/use-local-storage"
import { config } from "@/providers/wallet-connect"
import { cn } from "@/utils"
import { useAccount, useSignMessage } from "wagmi"

function DisclaimerDialog() {
  const { isConnected } = useAccount()
  const [isChecked, setIsChecked] = React.useState<CheckedState | undefined>(
    false,
  )

  const [hideDisclaimer, setHideDisclaimer] = useLocalStorage<boolean | null>(
    "hideDisclaimer",
    null,
  )

  const signature = useSignMessage({
    config,
  })

  async function handleAcceptTerms() {
    await signature.signMessageAsync({
      message:
        "By signing this message:\nYou confirm that you are not accessing this app from,\nor are a resident of the USA or any other restricted country.",
    })

    setHideDisclaimer(true)
  }

  if (isMobile) {
    return <MobileOverlay />
  }

  return (
    <Dialog open={isConnected && !hideDisclaimer} type="mangrove">
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
            <Checkbox
              id="terms1"
              onCheckedChange={setIsChecked}
              checked={isChecked}
            />
            <div className="grid gap-1.5 leading-none hover:opacity-80">
              <label
                htmlFor="terms1"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-cloud-300 !cursor-pointer"
              >
                By signing this messag you confirm that you are not accessing
                this app from, or are a resident of the USA or any other
                restricted country.
                <span>
                  For more information, please read our{" "}
                  <span>Terms of service</span>
                </span>
              </label>
            </div>
          </div>
          <div className={cn("flex space-x-2 justify-center")}>
            <Button
              loading={signature.isPending && !signature.error}
              size={"lg"}
              className="w-full flex-1"
              rightIcon
              onClick={handleAcceptTerms}
              disabled={!isChecked || (signature.isPending && !signature.error)}
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
