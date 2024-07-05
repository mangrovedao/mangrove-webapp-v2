"use client"
import { redirect, usePathname } from "next/navigation"
import React from "react"
import { useAccount } from "wagmi"

export function RedirectToBridge({ children }: React.PropsWithChildren) {
  const { chainId } = useAccount()
  const pathname = usePathname()

  React.useEffect(() => {
    if (chainId !== 81457 && chainId !== 84532 && pathname !== "/bridge") {
      redirect("/bridge")
    }
  }, [chainId, pathname])

  return <div>{children}</div>
}
