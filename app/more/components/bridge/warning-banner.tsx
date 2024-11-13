"use client"
import { blast } from "viem/chains"
import { useAccount, useSwitchChain } from "wagmi"

import { Caption } from "@/components/typography/caption"
import { Button } from "@/components/ui/button-old"
import { Info } from "@/svgs"
import { cn } from "@/utils"

export default function WarningBanner() {
  const { switchChain } = useSwitchChain()
  const { chainId } = useAccount()

  if (chainId === blast.id) {
    return null
  }

  return (
    <aside
      className={cn(
        "flex justify-center space-x-4 align-middle rounded-lg px-3 py-2 bg-mango-300 mt-8",
      )}
    >
      <div className="flex align-middle items-center space-x-2">
        <div
          className={cn(
            "h-8 aspect-square rounded-lg flex items-center justify-center text-red-100 p-1",
            {
              "bg-mango-300": true,
            },
          )}
        >
          <Info className={"text-mango-100"} />
        </div>
        <div>
          <Caption className="text-base!">
            You'll need to switch back to a supported network if you want to
            browse the rest of the web app :{" "}
            <Button
              className="text-md"
              variant={"link"}
              onClick={() =>
                switchChain({
                  chainId: blast.id,
                })
              }
            >
              Click here to switch to Blast
            </Button>{" "}
          </Caption>
        </div>
      </div>
    </aside>
  )
}
