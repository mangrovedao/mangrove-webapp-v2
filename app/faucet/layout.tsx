import React from "react"

import { Navbar } from "@/components/navbar"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Faucet | Mangrove DEX",
  description: "Faucet on Mangrove DEX",
}

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <>
      <Navbar innerClasses="max-w-8xl mx-auto" />
      <main className="max-w-8xl mx-auto px-4 pt-8 overflow-x-hidden">
        {children}
      </main>
    </>
  )
}
