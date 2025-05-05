"use client"
import { Button } from "@/components/ui/button"
import { useDefaultChain } from "@/hooks/use-default-chain"
import { useChains } from "@/providers/chains"
import { useMenuStore } from "@/stores/menu.store"
import { BurgerIcon, HelpIcon, Valhalla } from "@/svgs"
import { cn } from "@/utils"
import { shortenAddress } from "@/utils/wallet"
import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogTrigger,
} from "@radix-ui/react-dialog"
import { ScrollArea } from "@radix-ui/react-scroll-area"
import { useAccountModal, useConnectModal } from "@rainbow-me/rainbowkit"
import { WalletIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import Jazzicon, { jsNumberForAddress } from "react-jazzicon"
import { useAccount } from "wagmi"
import ChainSelector from "./chain-selector"
import { DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog-new"
import { ImageWithHideOnError } from "./ui/image-with-hide-on-error"
import { Spinner } from "./ui/spinner"

const MENUS = [
  {
    href: "/swap",
    text: "Swap",
  },
  {
    href: "/trade",
    text: "Trade",
  },
]

// Create separate component for the network selection modal
function NetworkSelectionModal() {
  const { defaultChain, setDefaultChain } = useDefaultChain()
  const { chains, setIsChainDialogOpen } = useChains()
  const { openConnectModal } = useConnectModal()
  const { toggle } = useMenuStore()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          className="flex-1 flex items-center justify-center gap-2 bg-bg-secondary hover:bg-bg-tertiary text-white rounded-lg p-3 transition-colors"
          onClick={() => setIsOpen(true)}
        >
          <span className="flex items-center gap-1.5">
            <ImageWithHideOnError
              src={`/assets/chains/${defaultChain?.id}.webp`}
              width={20}
              height={20}
              className="h-5 rounded-sm size-5"
              alt={`${defaultChain?.name || "Network"}-logo`}
            />
            <span className="text-sm font-medium truncate">
              {defaultChain?.name || "Select Network"}
            </span>
          </span>
        </button>
      </DialogTrigger>
      <DialogPortal>
        <DialogContent
          className="sm:max-w-md p-0 overflow-hidden z-[999999] fixed"
          style={{ zIndex: 999999 }}
        >
          <DialogHeader className="p-4 border-b border-border-tertiary">
            <DialogTitle className="text-lg">Choose a Network</DialogTitle>
            <DialogDescription className="text-sm text-text-secondary">
              Select a network and connect your wallet
            </DialogDescription>
          </DialogHeader>
          <div className="p-4">
            {chains?.map((chain) => (
              <button
                key={chain.id}
                onClick={() => {
                  setDefaultChain(chain)
                  // Immediately prompt to connect wallet after network selection
                  setIsOpen(false)
                  if (openConnectModal) {
                    setTimeout(() => {
                      openConnectModal()
                      toggle() // Close mobile overlay
                    }, 300)
                  }
                }}
                className={`flex items-center justify-between w-full p-3 mb-2 rounded-lg transition-colors ${
                  defaultChain?.id === chain.id
                    ? "bg-bg-tertiary text-white"
                    : "bg-bg-secondary hover:bg-bg-tertiary text-text-secondary hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <ImageWithHideOnError
                    src={`/assets/chains/${chain.id}.webp`}
                    width={24}
                    height={24}
                    className="rounded-sm size-6"
                    alt={`${chain.name} Network`}
                  />
                  <div className="text-left">
                    <p className="font-medium text-sm">{chain.name}</p>
                    <p className="text-xs text-text-tertiary">
                      {defaultChain?.id === chain.id
                        ? "Selected"
                        : "Tap to select"}
                    </p>
                  </div>
                </div>
                {defaultChain?.id === chain.id && (
                  <div className="bg-green-600 rounded-full p-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="p-4 border-t border-border-tertiary bg-bg-secondary/50">
            <button
              onClick={() => {
                setIsOpen(false)
                if (openConnectModal) {
                  openConnectModal()
                }
              }}
              className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Connect Wallet with {defaultChain?.name}
            </button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}

export function MobileOverlay() {
  const { isOpen, toggle } = useMenuStore()
  const { address, isConnected } = useAccount()
  const { defaultChain } = useDefaultChain()
  const { openConnectModal } = useConnectModal()
  const { openAccountModal } = useAccountModal()
  const { setIsChainDialogOpen } = useChains()
  const pathname = usePathname()

  function handleConnect() {
    if (openConnectModal) {
      openConnectModal()
      toggle() // Close overlay after initiating connection
    }
  }

  function handleAccount() {
    if (openAccountModal) {
      openAccountModal()
      toggle() // Close overlay after opening account modal
    }
  }

  function openNetworkDialog() {
    setIsChainDialogOpen?.(true)
    toggle() // Close overlay when opening network dialog
  }

  return (
    <Dialog open={isOpen} onOpenChange={toggle}>
      <DialogPortal>
        <DialogContent className="fixed inset-0 w-screen h-screen p-0 bg-background z-[99999]">
          <ScrollArea className="h-full w-full p-6">
            <nav>
              <div className="flex mb-6 justify-between items-center">
                <Link href="/" className="flex items-center">
                  <ImageWithHideOnError
                    src="/assets/valhalla/valhalla-logo.webp"
                    width={32}
                    height={26}
                    alt="Valhalla Network"
                  />
                  <span className="text-white font-bold text-xl">Valhalla</span>
                </Link>

                <DialogTrigger asChild>
                  <button className="text-nav-item-button-icon-fg p-2 rounded-lg hover:text-white hover:bg-bg-tertiary transition-colors focus:outline-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </DialogTrigger>
              </div>

              {/* Quick Actions Bar */}
              <div className="flex items-center justify-between gap-2 mb-6">
                {/* Network Selection Button */}

                {isConnected ? (
                  <button
                    onClick={openNetworkDialog}
                    className="flex-1 flex items-center justify-center gap-2 bg-bg-secondary hover:bg-bg-tertiary text-white rounded-lg p-3 transition-colors"
                  >
                    <ImageWithHideOnError
                      src={`/assets/chains/${defaultChain?.id}.webp`}
                      width={20}
                      height={20}
                      className="h-5 rounded-sm size-5"
                      alt={`${defaultChain?.name || "Network"}-logo`}
                    />
                    <span className="text-sm font-medium truncate">
                      {defaultChain?.name || "Select Network"}
                    </span>
                  </button>
                ) : (
                  <NetworkSelectionModal />
                )}

                {/* Wallet Button */}
                {isConnected ? (
                  <button
                    onClick={handleAccount}
                    className="flex-1 flex items-center justify-center gap-2 bg-bg-secondary hover:bg-bg-tertiary text-white rounded-lg p-3 transition-colors"
                  >
                    <span className="bg-gray-500 h-5 w-5 rounded-full relative overflow-hidden">
                      {address && (
                        <Jazzicon
                          seed={jsNumberForAddress(address)}
                          diameter={20}
                        />
                      )}
                    </span>
                    <span className="text-sm font-medium truncate">
                      {shortenAddress(address || "")}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={handleConnect}
                    className="flex-1 flex items-center justify-center gap-2 bg-bg-secondary hover:bg-bg-tertiary text-white rounded-lg p-3 transition-colors"
                  >
                    <WalletIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">Connect</span>
                  </button>
                )}
              </div>

              {/* Navigation Menu */}
              <div className="bg-bg-secondary rounded-sm p-2 mb-6">
                {MENUS.map(({ href, text }) => {
                  const isActive =
                    pathname === href || pathname?.startsWith(`${href}/`)
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => toggle()}
                      className={cn(
                        "flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium",
                        isActive ? "text-white bg-white" : "text-white/40",
                      )}
                    >
                      <div>{text}</div>
                    </Link>
                  )
                })}
              </div>

              <Link
                href={"https://docs.mangrove.exchange/"}
                target="_blank"
                className="flex items-center w-full gap-3 px-4 py-3 rounded-lg text-nav-item-button-icon-fg hover:text-white hover:bg-bg-tertiary text-sm font-medium transition-colors"
              >
                <span className="text-nav-item-button-icon-fg">
                  <HelpIcon />
                </span>
                <div>Help & Documentation</div>
              </Link>
            </nav>
          </ScrollArea>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}

export default function Navbar() {
  const { toggle } = useMenuStore()
  const { address, isConnected, isConnecting } = useAccount()
  const { openConnectModal } = useConnectModal()
  const { openAccountModal } = useAccountModal()
  const pathname = usePathname()

  function handleConnect() {
    if (openConnectModal) {
      openConnectModal()
    }
  }

  function handleAccount() {
    if (openAccountModal) {
      openAccountModal()
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full">
        <div className="mx-auto px-4">
          <div className="flex h-16 items-center justify-between relative h-[80px]">
            {/* Logo and Desktop Navigation */}
            <div className="flex items-center space-x-4">
              {/* Logo */}
              <div className="grid justify-center">
                <div className="flex items-center gap-2">
                  <Link href="/" className="flex items-center space-x-2">
                    <Valhalla />
                  </Link>
                </div>
              </div>
            </div>

            <div className="hidden lg:block absolute left-1/2 -translate-x-1/2">
              <div className="flex items-center p-1 space-x-1">
                {MENUS.map(({ href, text }) => {
                  const isActive =
                    pathname === href || pathname?.startsWith(`${href}/`)
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "flex items-center cursor-pointer gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive
                          ? "text-white bg-[#ffffff08]"
                          : "text-white/40",
                      )}
                    >
                      <span>{text}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Right Side - Network, Account & Mobile Menu */}
            <div className="flex items-center gap-3">
              {/* Network Selector */}
              <div className="hidden lg:block">
                <ChainSelector />
              </div>

              {/* User Account Button */}
              {isConnected ? (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleAccount}
                  className="hidden lg:flex border-transparent items-center gap-1 bg-white hover:bg-[#000] hover:text-white text-[#000] rounded-sm px-3 py-1.5 h-[38px]! text-xs font-medium transition-colors"
                >
                  {address && <WalletIcon className="w-4" />}
                  <div className="relative top-[1px]">
                    {shortenAddress(address || "")}
                  </div>
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleConnect}
                  className="hidden lg:flex items-center border-transparent h-[38px] gap-1 bg-white hover:bg-bg-secondary text-[#000] rounded-sm px-3 py-1.5 text-xs font-medium transition-colors"
                >
                  {isConnecting ? (
                    <Spinner className="h-6" />
                  ) : (
                    <span>Connect</span>
                  )}
                </Button>
              )}

              {/* Mobile menu button */}
              <button
                className="lg:hidden text-nav-item-button-icon-fg p-2 rounded-lg hover:text-text-primary hover:bg-bg-tertiary transition-colors"
                onClick={toggle}
              >
                <BurgerIcon />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <MobileOverlay />
    </>
  )
}
