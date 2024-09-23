import { Metadata } from "next"
import React from "react"

export const metadata: Metadata = {
  title: "Bridge | Mangrove DEX",
  description: "Bridge on Mangrove DEX",
}

export default function Layout({ children }: React.PropsWithChildren) {
  return <main className="max-w-4xl mx-auto px-4 pt-20 mb-10">{children}</main>
}
