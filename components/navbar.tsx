"use client"
import posthog from "posthog-js"
import React from "react"
import Jazzicon, { jsNumberForAddress } from "react-jazzicon"
import { useAccount, useDisconnect } from "wagmi"

import { Button } from "@/components/ui/button"
import withClientOnly from "@/hocs/withClientOnly"

import { BurgerIcon } from "@/svgs"
import { cn } from "@/utils"
import { shortenAddress } from "@/utils/wallet"
import { useAccountModal, useConnectModal } from "@rainbow-me/rainbowkit"

import { useMenuStore } from "@/stores/menu.store"
import ChainSelector from "./chain-selector"
import UnWrapETHDialog from "./stateful/dialogs/unwrap-dialog"
import WrapETHDialog from "./stateful/dialogs/wrap-dialog"

type Props = React.ComponentProps<"nav"> & {
  innerClasses?: string
}

export function Navbar({ className, innerClasses, ...props }: Props) {
  const { toggle } = useMenuStore()

  return (
    <nav
      className={cn(
        "flex w-full justify-between items-center text-sm grid-in-header py-1 my-5",
        className,
      )}
      {...props}
    >
      <button
        className="ml-4 bg-button-secondary-bg hover:bg-button-secondary-bg-hover rounded-md transition-colors p-2 md:hidden"
        onClick={toggle}
      >
        <BurgerIcon />
      </button>
      <div
        className={cn(
          "flex w-full justify-end items-center px-4",
          innerClasses,
        )}
      >
        <RightPart />
      </div>
    </nav>
  )
}

const RightPart = withClientOnly(() => {
  const { openConnectModal } = useConnectModal()
  const { openAccountModal } = useAccountModal()
  const { isConnected, connector, address, isConnecting } = useAccount()
  const { chain } = useAccount()
  const { disconnect } = useDisconnect()

  function handleConnect() {
    posthog.capture("connect-wallet:click")
    openConnectModal?.()
  }

  function handleAccount() {
    openAccountModal?.()
  }

  const [wrapETH, setWrapETH] = React.useState(false)
  const [unWrapETH, setUnWrapETH] = React.useState(false)

  React.useEffect(() => {
    if (address && !chain?.id) {
      disconnect()
    }
  }, [chain?.id])

  if (!isConnected) {
    return (
      <>
        <Button
          onClick={handleConnect}
          disabled={isConnecting}
          size="sm"
          className="mt-2"
        >
          Connect wallet
        </Button>
      </>
    )
  }

  return (
    <div className="flex space-x-4 items-center h-8">
      <WrapETHDialog isOpen={wrapETH} onClose={() => setWrapETH(false)} />
      <UnWrapETHDialog isOpen={unWrapETH} onClose={() => setUnWrapETH(false)} />

      <ChainSelector />

      <Button
        variant="secondary"
        className="space-x-2 flex items-center border-transparent"
        onClick={handleAccount}
      >
        <span className="inline-flex items-center space-x-2">
          <span className="bg-gray-500 h-[18px] w-[18px] rounded-full relative overflow-hidden">
            {address && <Jazzicon seed={jsNumberForAddress(address)} />}
          </span>
          <span className="text-sm">{shortenAddress(address ?? "")}</span>
        </span>
      </Button>
    </div>
  )
})
