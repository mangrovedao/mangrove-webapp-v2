"use client"
import { Button } from "@/components/ui/button"
import { useDefaultChain } from "@/hooks/use-default-chain"
import { useChains } from "@/providers/chains"
import { useMenuStore } from "@/stores/menu.store"
import {
  BurgerIcon,
  EarnIcon,
  HelpIcon,
  PersonIcon,
  RewardsIcon,
  SwapIcon,
  TradeIcon,
} from "@/svgs"
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
import { useAccount, useDisconnect } from "wagmi"
import ChainSelector from "./chain-selector"
import { DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog-new"
import { ImageWithHideOnError } from "./ui/image-with-hide-on-error"

const MENUS = [
  {
    href: "/swap",
    icon: SwapIcon,
    text: "Swap",
  },
  {
    href: "/trade",
    icon: TradeIcon,
    text: "Trade",
  },
  {
    href: "/earn",
    icon: EarnIcon,
    text: "Earn",
  },
  {
    href: "/rewards",
    icon: RewardsIcon,
    text: "Rewards",
    disabled: false,
  },
  // {
  //   href: "",
  //   icon: GouvernanceIcon,
  //   text: "Governance",
  //   disabled: true,
  // },
  // {
  //   href: "/more",
  //   icon: MoreIcon,
  //   text: "More",
  // },
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="26"
                    fill="none"
                    className="mr-2"
                  >
                    <path
                      fill="#00BF58"
                      d="M26.26 13.483c-1.557 0-2.979.607-4.12 1.62a10.195 10.195 0 00-3.01-1.532a5.42 5.42 0 001.558-1.692c1.62-.03 3.156-.586 4.318-1.732 1.421-1.403 1.953-3.367 1.703-5.361a7.597 7.597 0 00-.969-.057c-1.677 0-3.266.555-4.464 1.738-1.198 1.182-1.76 2.755-1.76 4.41A3.932 3.932 0 0116.76 13V9.294c1.166-1.167 1.88-2.663 1.88-4.313 0-1.984-1.026-3.747-2.636-4.981-1.61 1.229-2.635 2.992-2.635 4.981 0 1.65.713 3.151 1.875 4.313v3.727a3.955 3.955 0 01-2.85-2.123c0-1.66-.557-3.244-1.76-4.426C9.437 5.289 7.85 4.734 6.171 4.734c-.317 0-.64.016-.968.057-.256 1.994.276 3.958 1.703 5.361 1.156 1.141 2.687 1.697 4.307 1.732.401.69.948 1.27 1.589 1.712a10.17 10.17 0 00-2.938 1.506c-1.14-1.007-2.562-1.619-4.12-1.619-2.01 0-3.797 1.013-5.047 2.601 1.245 1.589 3.032 2.601 5.047 2.601 1.532 0 2.933-.586 4.063-1.568.042-.036.083-.077.125-.113a5.46 5.46 0 00.177-.17 8.704 8.704 0 015.13-2.21v3.362c-4.192.37-7.51 3.794-7.703 8.014h1.516c.156-3.418 2.812-6.143 6.193-6.508v6.472h1.516v-6.472c3.375.355 6.041 3.084 6.208 6.508h1.516c-.203-4.225-3.532-7.654-7.724-8.014V14.63c1.916.16 3.708.93 5.135 2.216.057.051.11.108.167.16l.13.123c1.13.976 2.531 1.567 4.063 1.567 2.01 0 3.797-1.012 5.047-2.6-1.245-1.589-3.032-2.601-5.047-2.601l.005-.01z"
                    ></path>
                  </svg>
                  <span className="text-white font-bold text-xl">Mangrove</span>
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
                {MENUS.map(({ href, disabled, icon: Icon, text }) => {
                  const isActive =
                    pathname === href || pathname?.startsWith(`${href}/`)
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => toggle()}
                      className={cn(
                        "flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium",
                        isActive
                          ? "text-white bg-bg-tertiary"
                          : "text-nav-item-button-icon-fg hover:text-white hover:bg-bg-secondary",
                        disabled && "opacity-50 pointer-events-none",
                      )}
                    >
                      <span
                        className={cn(
                          "text-nav-item-button-icon-fg",
                          isActive && "text-white",
                        )}
                      >
                        <Icon />
                      </span>
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
  const { address, isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const { openAccountModal } = useAccountModal()
  const { disconnect } = useDisconnect()
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
      <header className="sticky top-0 z-50 w-full border-b border-border-tertiary bg-background shadow-md">
        <div className="mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Desktop Navigation */}
            <div className="flex items-center space-x-4">
              {/* Logo */}
              <Link href="/" className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="26"
                  fill="none"
                  className="mr-2"
                >
                  <path
                    fill="#00BF58"
                    d="M26.26 13.483c-1.557 0-2.979.607-4.12 1.62a10.195 10.195 0 00-3.01-1.532a5.42 5.42 0 001.558-1.692c1.62-.03 3.156-.586 4.318-1.732 1.421-1.403 1.953-3.367 1.703-5.361a7.597 7.597 0 00-.969-.057c-1.677 0-3.266.555-4.464 1.738-1.198 1.182-1.76 2.755-1.76 4.41A3.932 3.932 0 0116.76 13V9.294c1.166-1.167 1.88-2.663 1.88-4.313 0-1.984-1.026-3.747-2.636-4.981-1.61 1.229-2.635 2.992-2.635 4.981 0 1.65.713 3.151 1.875 4.313v3.727a3.955 3.955 0 01-2.85-2.123c0-1.66-.557-3.244-1.76-4.426C9.437 5.289 7.85 4.734 6.171 4.734c-.317 0-.64.016-.968.057-.256 1.994.276 3.958 1.703 5.361 1.156 1.141 2.687 1.697 4.307 1.732.401.69.948 1.27 1.589 1.712a10.17 10.17 0 00-2.938 1.506c-1.14-1.007-2.562-1.619-4.12-1.619-2.01 0-3.797 1.013-5.047 2.601 1.245 1.589 3.032 2.601 5.047 2.601 1.532 0 2.933-.586 4.063-1.568.042-.036.083-.077.125-.113a5.46 5.46 0 00.177-.17 8.704 8.704 0 015.13-2.21v3.362c-4.192.37-7.51 3.794-7.703 8.014h1.516c.156-3.418 2.812-6.143 6.193-6.508v6.472h1.516v-6.472c3.375.355 6.041 3.084 6.208 6.508h1.516c-.203-4.225-3.532-7.654-7.724-8.014V14.63c1.916.16 3.708.93 5.135 2.216.057.051.11.108.167.16l.13.123c1.13.976 2.531 1.567 4.063 1.567 2.01 0 3.797-1.012 5.047-2.6-1.245-1.589-3.032-2.601-5.047-2.601l.005-.01z"
                  ></path>
                </svg>
                <span className="text-white font-bold text-xl">Mangrove</span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:block">
                <div className="flex items-center p-1 space-x-1">
                  {MENUS.map(({ href, disabled, icon: Icon, text }) => {
                    const isActive =
                      pathname === href || pathname?.startsWith(`${href}/`)
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                          isActive
                            ? "text-white bg-bg-tertiary"
                            : "text-nav-item-button-icon-fg hover:text-white hover:bg-bg-secondary",
                          disabled && "opacity-50 pointer-events-none",
                        )}
                      >
                        <span
                          className={cn(
                            "text-nav-item-button-icon-fg",
                            isActive && "text-text-primary",
                          )}
                        >
                          <Icon />
                        </span>
                        <span>{text}</span>
                      </Link>
                    )
                  })}
                </div>
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
                  className="hidden lg:flex border-transparent items-center gap-1 bg-bg-tertiary hover:bg-bg-secondary text-text-primary rounded-sm px-3 py-1.5 text-xs font-medium transition-colors"
                >
                  {address && <WalletIcon className="w-4" />}
                  <span>{shortenAddress(address || "")}</span>
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleConnect}
                  className="hidden lg:flex items-center border-transparent gap-1 bg-bg-tertiary hover:bg-bg-secondary text-text-primary rounded-sm px-3 py-1.5 text-xs font-medium transition-colors"
                >
                  <span>Connect</span>
                  <PersonIcon />
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
