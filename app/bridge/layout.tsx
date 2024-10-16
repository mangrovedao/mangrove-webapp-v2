import { Metadata } from "next"
import React from "react"

export const metadata: Metadata = {
  title: "Bridge | Mangrove DEX",
  description: "Bridge on Mangrove DEX",
}

export default function Layout({ children }: React.PropsWithChildren) {
  return <main className="">{children}</main>
}
