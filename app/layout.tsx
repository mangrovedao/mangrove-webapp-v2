import { Inter } from "next/font/google"

import { RootProvider } from "@/providers/root-provider"
import { cn } from "utils"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "dark")}>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  )
}
