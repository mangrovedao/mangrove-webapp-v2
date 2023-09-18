import { Inter } from "next/font/google"

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
      <body className={cn(inter.className, "dark")}>{children}</body>
    </html>
  )
}
