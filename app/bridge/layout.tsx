import { Metadata } from "next"
import React from "react"

import { Navbar } from "@/components/navbar"

export const metadata: Metadata = {
  title: "Bridge | Mangrove DEX",
  description: "Bridge on Mangrove DEX",
}

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <>
      <Navbar innerClasses="max-w-8xl mx-auto" />
      <main className="max-w-4xl mx-auto px-4 pt-20 mb-10">{children}</main>
    </>
  )
}
