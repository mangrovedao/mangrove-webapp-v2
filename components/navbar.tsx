"use client"
import { Button } from "@/components/ui/button"
import { useMenuStore } from "@/stores/menu.store"
import { BurgerIcon, HelpIcon, TelegramIcon } from "@/svgs"
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
import Jazzicon, { jsNumberForAddress } from "react-jazzicon"
import { useAccount } from "wagmi"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Spinner } from "./ui/spinner"

const MENUS = [
  {
    href: "/swap",
    text: "Swap",
    disabled: false,
  },
  {
    href: "/trade",
    text: "Trade",
    disabled: false,
  },
  {
    href: "/earn",
    text: "Earn",
    disabled: false,
  },
]

export function MobileOverlay() {
  const { isOpen, toggle } = useMenuStore()
  const { address, isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const { openAccountModal } = useAccountModal()
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
                {MENUS.map(
                  ({
                    href,
                    disabled,
                    // icon: Icon,
                    text,
                  }) => {
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
                            ? "text-black-rich bg-bg-tertiary"
                            : "text-nav-item-button-icon-fg hover:text-white hover:bg-bg-secondary",
                          disabled && "opacity-50 pointer-events-none",
                        )}
                      >
                        {/* <span
                        className={cn(
                          "text-nav-item-button-icon-fg",
                          isActive && "text-black-rich",
                        )}
                      >
                        <Icon />
                      </span> */}
                        <div>{text}</div>
                      </Link>
                    )
                  },
                )}
              </div>

              <Link
                href={"https://docs.oxium.xyz/"}
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
                      <DropdownMenuLabel className="text-xs text-text-secondary">
                        Documentation
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Link
                          href="https://docs.oxium.xyz/"
                          target="_blank"
                          className="text-xs "
                        >
                          User documentation
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link
                          href="https://docs.oxium.xyz"
                          target="_blank"
                          className="text-xs"
                        >
                          Developer documentation
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuGroup className="justify-center gap-2">
                        <DropdownMenuLabel className="text-xs text-text-secondary">
                          Socials
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="flex justify-center gap-2">
                          <DropdownMenuItem>
                            <Link href="https://x.com/oxiumxyz" target="_blank">
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
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
                              href="http://discord.gg/invite/oxium"
                              target="_blank"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                viewBox="0 0 16 16"
                              >
                                <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612" />
                              </svg>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link href="https://www.oxium.xyz/" target="_blank">
                              <TelegramIcon width="20" height="20" />
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
                  {MENUS.map(
                    ({
                      href,
                      disabled,

                      // icon: Icon,

                      text,
                    }) => {
                      const isActive =
                        pathname === href || pathname?.startsWith(`${href}/`)
                      return (
                        <Link
                          key={href}
                          href={href}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                            isActive
                              ? "text-black-rich bg-bg-tertiary"
                              : "text-nav-item-button-icon-fg hover:text-white hover:bg-bg-secondary",
                            disabled && "opacity-50 pointer-events-none",
                          )}
                        >
                          <span>{text}</span>
                        </Link>
                      )
                    },
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - Network, Account & Mobile Menu */}
            <div className="flex items-center gap-3">
              <Link
                href="https://forms.gle/Ukr9BLJYSgN7Rp388"
                target="_blank"
                className="text-text-secondary text-right font-bold text-[0.6rem] hover:text-text-tertiary"
              >
                any feedback ?
              </Link>

              {/* User Account Button */}
              {isConnected ? (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleAccount}
                  className="hidden lg:flex border-transparent items-center gap-1 bg-bg-tertiary text-black-rich rounded-sm px-3 py-1.5 h-[38px]! text-xs font-medium transition-colors"
                >
                  {address && <WalletIcon className="w-4" />}
                  <span>{shortenAddress(address || "")}</span>
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleConnect}
                  className="hidden lg:flex items-center border-transparent h-[38px] gap-1 bg-bg-tertiary text-black-rich rounded-sm px-3 py-1.5 text-xs font-medium transition-colors"
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
