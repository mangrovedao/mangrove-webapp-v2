import React from "react"

import { Navbar } from "@/components/navbar"
import { Caption } from "@/components/typography/caption"

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <>
      <Navbar innerClasses="max-w-8xl mx-auto" />
      <main className="max-w-5xl mx-auto px-4 pt-8 overflow-x-hidden mb-10">
        {children}
        <hr className="mb-4 mt-16" />
        <Caption variant={"caption1"} className="text-cloud-300">
          *Boosts levels are dynamic, means that they could change after some
          time.
        </Caption>
      </main>
    </>
  )
}
