"use client"
import { CheckedState } from "@radix-ui/react-checkbox"
import React from "react"

import Dialog from "@/components/dialogs/alert-dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import withClientOnly from "@/hocs/withClientOnly"
import useLocalStorage from "@/hooks/use-local-storage"
import { cn } from "@/utils"

function DisclaimerDialog() {
  const [isChecked, setIsChecked] = React.useState<CheckedState | undefined>(
    false,
  )
  const [hideDisclaimer, setHideDisclaimer] = useLocalStorage<boolean | null>(
    "hideDisclaimer",
    null,
  )

  function handleAcceptTerms() {
    setHideDisclaimer(true)
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
                By checking this box, I verify that I'm not part of USA or any
                sanctioned country.
              </label>
            </div>
          </div>
          <div className={cn("flex space-x-2 justify-center")}>
            <Button
              size={"lg"}
              className="w-full flex-1"
              rightIcon
              onClick={handleAcceptTerms}
              disabled={!isChecked}
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
