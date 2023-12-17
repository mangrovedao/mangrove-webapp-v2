"use client"
import { useWeb3Modal } from "@web3modal/wagmi/react"
import { Copy, ExternalLink, LogOut, Network, Wallet } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import React from "react"
import Jazzicon, { jsNumberForAddress } from "react-jazzicon"
import { toast } from "sonner"
import { useAccount, useDisconnect, useNetwork } from "wagmi"

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
import { Bell, ChevronDown } from "@/svgs"
import { cn } from "@/utils"
import { shortenAddress } from "@/utils/wallet"
import { ClientOnly } from "./client-only"
import { ImageWithHideOnError } from "./ui/image-with-hide-on-error"
import { Separator } from "./ui/separator"

const LINKS = [
  {
    name: "Trade",
    href: "/trade",
  },
  {
    name: "Strategies",
    href: "/strategies",
  },
]

export function Navbar() {
  const currentRoute = usePathname()
  const clipPathId = React.useId()
  return (
    <nav className="flex w-full justify-between items-center border-b px-4 text-sm grid-in-header min-h-[var(--bar-height)]">
      <div className="flex w-full justify-between items-center max-w-8xl mx-auto">
        <span className="flex items-center lg:space-x-8 h-8 py-1">
          <Link href={"/"}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 121 20"
              className="h-5 hidden lg:block"
            >
              <g fill="currentColor" clipPath={`url(#${clipPathId})`}>
                <path d="M119.238 5.842c0-.478.404-.83.883-.83.478 0 .879.352.879.83 0 .479-.405.835-.879.835-.475 0-.883-.352-.883-.835zm.883.696a.69.69 0 00.705-.696c0-.4-.309-.692-.705-.692a.69.69 0 00-.71.692.69.69 0 00.71.696zm.458-.542a.429.429 0 01-.429.356.492.492 0 01-.512-.514c0-.288.19-.51.503-.51.223 0 .405.123.434.348h-.153c-.029-.122-.132-.202-.277-.202-.214 0-.33.159-.33.36 0 .202.128.372.339.372.144 0 .251-.087.272-.21h.157-.004zM20.25 10.374c-1.234 0-2.36.466-3.265 1.245a8.172 8.172 0 00-2.385-1.178c.495-.34.92-.78 1.234-1.301 1.284-.024 2.5-.451 3.421-1.333 1.127-1.08 1.548-2.59 1.35-4.125a6.198 6.198 0 00-.768-.043c-1.329 0-2.587.427-3.537 1.336-.949.91-1.395 2.12-1.395 3.394a3.104 3.104 0 01-2.182 1.633V7.15c.924-.897 1.49-2.048 1.49-3.318 0-1.526-.814-2.883-2.089-3.832-1.275.945-2.088 2.302-2.088 3.832 0 1.27.565 2.425 1.486 3.318v2.868a3.126 3.126 0 01-2.258-1.634c0-1.277-.441-2.495-1.395-3.405-.949-.91-2.207-1.337-3.536-1.337a6.27 6.27 0 00-.768.044c-.202 1.534.219 3.045 1.35 4.125.916.878 2.13 1.305 3.413 1.333.317.53.75.977 1.258 1.317A8.155 8.155 0 007.26 11.62c-.904-.776-2.03-1.246-3.265-1.246-1.592 0-3.008.779-3.998 2 .986 1.223 2.401 2.002 3.998 2.002 1.214 0 2.324-.45 3.22-1.206.032-.028.065-.06.098-.087.05-.044.095-.087.14-.13a7 7 0 014.066-1.701v2.586c-3.323.285-5.951 2.919-6.104 6.166h1.2c.125-2.63 2.23-4.726 4.908-5.007v4.98h1.2v-4.98c2.675.273 4.787 2.373 4.92 5.007h1.2c-.16-3.251-2.797-5.889-6.12-6.166v-2.582a7.016 7.016 0 014.07 1.704c.045.04.086.083.131.123l.104.095c.895.751 2.005 1.206 3.218 1.206 1.593 0 3.009-.78 4-2.001-.987-1.222-2.402-2.001-4-2.001l.005-.008zm-3.104-4.58c.723-.692 1.58-.922 2.29-.985-.078.862-.424 1.618-1.027 2.187-.722.692-1.58.922-2.29.985.078-.862.425-1.618 1.027-2.187zm-5.913-1.962c0-.806.313-1.586.887-2.246.582.664.887 1.432.887 2.246 0 .815-.313 1.586-.887 2.247-.582-.665-.887-1.44-.887-2.247zM5.76 6.996c-.603-.577-.95-1.329-1.028-2.187.702.06 1.568.293 2.29.985A3.43 3.43 0 018.051 7.98c-.702-.06-1.568-.293-2.29-.985zm-1.77 6.23c-.847 0-1.655-.301-2.345-.851.694-.558 1.502-.85 2.344-.85.842 0 1.655.3 2.344.85-.693.558-1.494.85-2.344.85zm16.255 0c-.846 0-1.655-.301-2.344-.851.693-.558 1.502-.85 2.343-.85.842 0 1.655.3 2.345.85-.694.558-1.494.85-2.345.85zm20.87-8.254c1.192 0 2.15.371 2.876 1.111.739.72 1.106 1.712 1.106 2.986v5.687h-2.03v-5.37c0-.827-.203-1.464-.607-1.919-.404-.455-.957-.68-1.659-.68-.739 0-1.337.241-1.8.724-.461.482-.692 1.123-.692 1.926v5.315h-2.027V9.417c0-.815-.206-1.455-.619-1.926-.412-.47-.97-.704-1.667-.704-.739 0-1.341.245-1.808.732-.466.486-.701 1.139-.701 1.95v5.283h-2.026V5.241h1.989v1.376a3.235 3.235 0 011.234-1.202 3.552 3.552 0 011.77-.443 3.87 3.87 0 011.845.478c.553.305.961.732 1.217 1.27.343-.53.838-.953 1.482-1.27a4.691 4.691 0 012.113-.478h.004zm13.771 1.593V5.24h1.956v9.52h-1.956v-1.31c-.896 1.025-2.026 1.539-3.392 1.539-1.44 0-2.625-.483-3.557-1.448-.933-.965-1.404-2.167-1.404-3.602 0-1.436.467-2.603 1.404-3.532.932-.93 2.117-1.392 3.557-1.392s2.496.518 3.392 1.554v-.004zm-3.116 6.64c.92 0 1.688-.312 2.303-.937.602-.613.904-1.372.904-2.278 0-.906-.302-1.65-.904-2.262-.615-.621-1.383-.934-2.303-.934-.92 0-1.717.313-2.303.934-.59.613-.887 1.372-.887 2.278 0 .905.297 1.669.888 2.278.59.613 1.357.921 2.302.921zm9.252 1.555h-2.026V5.24h1.989v1.341a3.09 3.09 0 011.271-1.167c.553-.284 1.18-.423 1.878-.423 1.093 0 2.018.34 2.765 1.025.763.696 1.143 1.676 1.143 2.95v5.794h-2.047V9.512c0-.862-.215-1.527-.644-2.005-.43-.475-1.007-.716-1.733-.716-.764 0-1.383.257-1.87.767-.486.51-.73 1.175-.73 1.99v5.212h.004zm16.828-8.3V5.24h1.957v8.55c0 1.531-.492 2.75-1.474 3.655-.986.906-2.286 1.36-3.908 1.36-1.621 0-3.128-.454-4.444-1.36l.883-1.503c1.093.755 2.27 1.131 3.52 1.131 1.044 0 1.873-.28 2.488-.838.615-.558.92-1.286.92-2.183v-.689c-.874.942-1.984 1.412-3.338 1.412-1.448 0-2.64-.462-3.574-1.396-.932-.93-1.403-2.096-1.403-3.496s.487-2.563 1.457-3.48c.974-.93 2.175-1.392 3.611-1.392 1.316 0 2.414.482 3.301 1.447h.004zm-3.132 6.588c.92 0 1.684-.3 2.286-.902.603-.589.904-1.336.904-2.242 0-.906-.301-1.665-.904-2.242-.614-.59-1.374-.882-2.286-.882-.912 0-1.654.3-2.27.901-.602.578-.903 1.317-.903 2.227 0 .91.301 1.673.904 2.262.615.59 1.37.882 2.27.882v-.004zm9.273 1.712h-2.026V5.242H83.9v1.36c.59-1.07 1.531-1.609 2.823-1.609.417 0 .813.056 1.18.158l-.181 1.89a3.194 3.194 0 00-1.085-.173c-.801 0-1.44.257-1.92.775C84.24 8.16 84 8.908 84 9.888v4.877l-.008-.004zm3.85-4.769c0-1.38.491-2.555 1.478-3.532.994-.976 2.253-1.467 3.78-1.467 1.527 0 2.777.49 3.76 1.467.994.965 1.493 2.144 1.493 3.532s-.495 2.603-1.494 3.572c-.974.964-2.224 1.447-3.76 1.447-1.534 0-2.78-.482-3.78-1.447-.986-.977-1.477-2.168-1.477-3.572zm8.464 0c0-.87-.313-1.617-.94-2.242-.603-.637-1.358-.953-2.266-.953-.908 0-1.66.316-2.286.953a3.083 3.083 0 00-.92 2.242c0 .87.309 1.638.92 2.262.627.625 1.386.938 2.286.938.9 0 1.65-.313 2.265-.938.628-.624.941-1.38.941-2.262zm7.19 2.049l2.839-6.803h2.228l-4.349 9.504h-1.474l-4.35-9.504h2.25l2.856 6.803zm15.058-2.227c0 .304-.025.617-.075.937h-7.762c.149.764.499 1.373 1.061 1.82.557.447 1.304.672 2.24.672.566 0 1.156-.095 1.779-.28.619-.19 1.151-.436 1.593-.744l.846 1.431c-1.242.882-2.674 1.325-4.296 1.325-1.746 0-3.07-.486-3.974-1.467-.904-.98-1.354-2.156-1.354-3.532s.467-2.622 1.399-3.551c.945-.942 2.171-1.412 3.669-1.412 1.498 0 2.604.43 3.5 1.289.895.858 1.365 2.045 1.365 3.516l.009-.004zm-4.866-3.128c-.763 0-1.411.229-1.948.68-.536.45-.874 1.052-1.023 1.791h5.786c-.087-.743-.388-1.34-.912-1.791-.524-.455-1.156-.68-1.907-.68h.004z"></path>
              </g>
              <defs>
                <clipPath id={clipPathId}>
                  <path fill="#fff" d="M0 0h121v20H0z"></path>
                </clipPath>
              </defs>
            </svg>
          </Link>

          <Separator orientation="vertical" className="hidden lg:block" />

          <div className="space-x-4 lg:space-x-10">
            {LINKS.map(({ name, href }) => (
              <Link
                key={href}
                href={href}
                className={
                  "hover:opacity-90 transition-opacity inline-flex h-8 items-center relative"
                }
              >
                <span>{name}</span>
                <span
                  className={cn(
                    "h-[2px] w-full bg-green-caribbean inset-x-0 -bottom-3 absolute opacity-0 transition-all",
                    {
                      "opacity-100": currentRoute === href,
                    },
                  )}
                />
              </Link>
            ))}
          </div>
        </span>

        <ClientOnly>
          <RightPart />
        </ClientOnly>
      </div>
    </nav>
  )
}

function RightPart() {
  const { open } = useWeb3Modal()
  const { isConnected, connector, address, isConnecting } = useAccount()
  const { chain } = useNetwork()
  const { disconnect } = useDisconnect()

  function handleChangeNetwork() {
    open({ view: "Networks" })
  }

  if (!isConnected) {
    return (
      <>
        <Button
          onClick={() => open({ view: "Networks" })}
          disabled={isConnecting}
          size="sm"
        >
          Connect to wallet
        </Button>
      </>
    )
  }

  return (
    <div className="flex space-x-4 items-center h-8 py-1">
      <Button
        variant="invisible"
        className="space-x-4 lg:flex items-center hidden"
        size="sm"
        onClick={handleChangeNetwork}
      >
        <span className="flex space-x-2">
          <ImageWithHideOnError
            src={`/assets/chains/${chain?.id}.webp`}
            width={16}
            height={16}
            className="h-4 rounded-sm"
            key={chain?.id}
            alt={`${chain?.name}-logo`}
          />
          <span className="text-sm">{chain?.name}</span>
        </span>
        <ChevronDown className="w-3" />
      </Button>

      <Separator orientation="vertical" />

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
          <DropdownMenuItem
            onClick={() => {
              disconnect()
              open({ view: "Connect" })
            }}
          >
            <Wallet className="mr-2 h-4 w-4" />
            <span>Change wallet</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Chain: {chain?.name}</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleChangeNetwork}>
            <Network className="mr-2 h-4 w-4" />
            <span>Change network</span>
          </DropdownMenuItem>
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
      <Separator orientation="vertical" />
      <Button variant={"invisible"} size="sm" className="h-full">
        <Bell className="text-white w-4" />
      </Button>
    </div>
  )
}
