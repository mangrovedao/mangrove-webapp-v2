import React from "react"

import { Navbar } from "@/components/navbar"

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
