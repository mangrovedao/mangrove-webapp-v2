"use client"
import { Button } from "@/components/ui/button"
import { useDefaultChain } from "@/hooks/use-default-chain"
import { useChains } from "@/providers/chains"
import { useMenuStore } from "@/stores/menu.store"
import { BurgerIcon, HelpIcon, SwapIcon, TelegramIcon, TradeIcon } from "@/svgs"
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
import { ChevronDown, WalletIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import Jazzicon, { jsNumberForAddress } from "react-jazzicon"
import { useAccount } from "wagmi"
import ChainSelector from "./chain-selector"
import { DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog-new"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { ImageWithHideOnError } from "./ui/image-with-hide-on-error"
import { Spinner } from "./ui/spinner"

const MENUS = [
  {
    href: "/swap",
    icon: SwapIcon,
    text: "Swap",
    disabled: false,
  },
  {
    href: "/trade",
    icon: TradeIcon,
    text: "Trade",
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

  const getChainIcon = (chainId: number) => {
    return `/assets/chains/${chainId}.webp` || `/assets/chains/${chainId}.svg`
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          className="flex-1 flex items-center justify-center gap-2 bg-bg-secondary hover:bg-bg-tertiary text-white rounded-lg p-3 transition-colors"
          onClick={() => setIsOpen(true)}
        >
          <span className="flex items-center gap-1.5">
            <ImageWithHideOnError
              src={getChainIcon(defaultChain?.id || 0)}
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
                  <img
                    src="/assets/oxium/oxium-full-logo.png"
                    alt="oxium-logo"
                    width="130"
                  />
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
      <header className="sticky top-0 z-50 w-full border-b border-border-tertiary bg-background shadow-md">
        <div className="mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Desktop Navigation */}
            <div className="flex items-center space-x-4">
              {/* Logo */}
              <div className="grid justify-center">
                <div className="flex items-center gap-2">
                  <Link href="/" className="flex items-center">
                    <img
                      src="/assets/oxium/oxium-full-logo.png"
                      alt="oxium-logo"
                      width="130"
                    />
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="focus:outline-none">
                        <ChevronDown className="h-4 w-4 text-text-primary hover:text-text-tertiary transition-transform duration-200 ease-in-out data-[state=open]:rotate-180" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-bg-secondary">
                      <DropdownMenuLabel className="text-xs text-text-primary">
                        Documentation
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Link
                          href="https://docs.mangrove.exchange/"
                          target="_blank"
                          className="text-xs text-text-secondary"
                        >
                          User documentation
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link
                          href="https://docs.mangrove.exchange/dev"
                          target="_blank"
                          className="text-xs text-text-secondary"
                        >
                          Developer documentation
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuGroup className="justify-center gap-2">
                        <DropdownMenuLabel className="text-xs text-text-primary">
                          Socials
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="flex justify-center gap-2">
                          <DropdownMenuItem className="hover:bg-bg-tertiary">
                            <Link
                              href="https://x.com/MangroveDAO"
                              target="_blank"
                            >
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="text-text-secondary"
                              >
                                <path
                                  d="M11.7368 8.62558L16.5763 3H15.4295L11.2273 7.88461L7.87105 3H4L9.07533 10.3864L4 16.2857H5.14688L9.58449 11.1274L13.1289 16.2857H17L11.7365 8.62558H11.7368ZM10.166 10.4515L9.65172 9.71595L5.56012 3.86336H7.32166L10.6236 8.58659L11.1379 9.32211L15.43 15.4616H13.6685L10.166 10.4518V10.4515Z"
                                  fill="currentColor"
                                ></path>
                              </svg>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link
                              href="https://discord.com/invite/77d4ekhsXH"
                              target="_blank"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                viewBox="0 0 16 16"
                                className="text-text-secondary"
                              >
                                <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612" />
                              </svg>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link
                              href="https://t.me/MangroveDAO"
                              target="_blank"
                            >
                              <TelegramIcon
                                width="20"
                                height="20"
                                className="text-text-secondary"
                              />
                            </Link>
                          </DropdownMenuItem>
                        </div>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

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
              <Link
                href="https://forms.gle/Ukr9BLJYSgN7Rp388"
                target="_blank"
                className="text-text-secondary text-right font-bold text-[0.6rem] hover:text-text-tertiary"
              >
                any feedback ?
              </Link>
              <div className="hidden lg:block">
                <ChainSelector />
              </div>

              {/* User Account Button */}
              {isConnected ? (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleAccount}
                  className="hidden lg:flex border-transparent items-center gap-1 bg-bg-tertiary hover:bg-bg-secondary text-text-primary rounded-sm px-3 py-1.5 h-[38px]! text-xs font-medium transition-colors"
                >
                  {address && <WalletIcon className="w-4" />}
                  <span>{shortenAddress(address || "")}</span>
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleConnect}
                  className="hidden lg:flex items-center border-transparent h-[38px] gap-1 bg-bg-tertiary hover:bg-bg-secondary text-text-primary rounded-sm px-3 py-1.5 text-xs font-medium transition-colors"
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
