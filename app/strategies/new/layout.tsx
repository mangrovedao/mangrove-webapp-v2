import React from "react"

export default function Layout({ children }: React.PropsWithChildren) {
  return <main className="w-full">{children}</main>
}
