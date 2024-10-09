"use client"
import { Coins, Copy, ExternalLink, LogOut, Route, Wallet } from "lucide-react"
import Link from "next/link"
import posthog from "posthog-js"
import React from "react"
import Jazzicon, { jsNumberForAddress } from "react-jazzicon"
import { toast } from "sonner"
import { useAccount, useDisconnect } from "wagmi"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import withClientOnly from "@/hocs/withClientOnly"

import { BurgerIcon, ChevronDown } from "@/svgs"
import { cn } from "@/utils"
import { shortenAddress } from "@/utils/wallet"
import { useAccountModal, useConnectModal } from "@rainbow-me/rainbowkit"

import { useMenuStore } from "@/stores/menu.store"
import { arbitrum, baseSepolia, blast, blastSepolia } from "viem/chains"
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
        "flex w-full justify-between items-center text-sm grid-in-header min-h-[var(--bar-height)]",
        className,
      )}
      {...props}
    >
      <button
        className="ml-4 bg-button-secondary-bg hover:bg-button-secondary-bg-hover rounded-md transition-colors p-2"
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
        <Button onClick={handleConnect} disabled={isConnecting} size="sm">
          Connect wallet
        </Button>
      </>
    )
  }

  return (
    <div className="flex space-x-4 items-center h-8 py-1">
      <WrapETHDialog isOpen={wrapETH} onClose={() => setWrapETH(false)} />
      <UnWrapETHDialog isOpen={unWrapETH} onClose={() => setUnWrapETH(false)} />

      <ChainSelector />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="invisible"
            className="space-x-4 flex items-center"
            size="sm"
          >
            <span className="inline-flex items-center space-x-2">
              <span className="bg-gray-500 h-[18px] w-[18px] rounded-full relative overflow-hidden">
                {address && <Jazzicon seed={jsNumberForAddress(address)} />}
              </span>
              <span className="text-sm">{shortenAddress(address ?? "")}</span>
            </span>
            <ChevronDown className="w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 mt-1">
          <DropdownMenuLabel>Wallet: {connector?.name}</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleAccount}>
            <Wallet className="mr-2 h-4 w-4" />
            <span>Account</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Chain: {chain?.name}</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={"/bridge"}>
              <Route className="mr-2 h-4 w-4" />
              <span>Bridge assets</span>
            </Link>
          </DropdownMenuItem>
          {chain?.testnet && (
            <DropdownMenuItem asChild>
              <Link href={"/faucet"}>
                <Coins className="mr-2 h-4 w-4" />
                <span>Faucet</span>
              </Link>
            </DropdownMenuItem>
          )}

          {(chain?.id == blastSepolia.id ||
            chain?.id == blast.id ||
            chain?.id == baseSepolia.id ||
            chain?.id == arbitrum.id) && (
            <>
              <DropdownMenuItem asChild onClick={() => setWrapETH(!wrapETH)}>
                <div>
                  <Coins className="mr-2 h-4 w-4" />
                  <span>Wrap ETH</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                onClick={() => setUnWrapETH(!unWrapETH)}
              >
                <div>
                  <Coins className="mr-2 h-4 w-4" />
                  <span>Unwrap wETH</span>
                </div>
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => {
                address && navigator.clipboard.writeText(address)
                toast.success("Address copied to clipboard")
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              <span>Copy address</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link
                href={`${chain?.blockExplorers?.default.url}/address/${address}`}
                target="_blank"
                className="inline-flex"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                <span>Open in {chain?.blockExplorers?.default.name}</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuItem onClick={() => disconnect()}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Disconnect</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
})
