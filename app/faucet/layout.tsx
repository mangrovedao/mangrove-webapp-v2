import React from "react"

import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Faucet | Mangrove DEX",
  description: "Faucet on Mangrove DEX",
}

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <main className="max-w-8xl mx-auto px-4 pt-8 overflow-x-hidden">
      {children}
    </main>
  )
}
