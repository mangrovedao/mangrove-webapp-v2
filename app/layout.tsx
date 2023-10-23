import { Inter } from "next/font/google"
import { Toaster } from "sonner"

import { Navbar } from "@/components/navbar"
import { RootProvider } from "@/providers/root"
import { cn } from "utils"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const runtime = "edge"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "dark")}>
        <RootProvider>
          <Navbar />
          {children}
        </RootProvider>
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  )
}
