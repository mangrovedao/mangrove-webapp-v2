import { Inter } from "next/font/google"
import { Toaster } from "sonner"

import { Navbar } from "@/components/navbar"
import { RootProvider } from "@/providers/root"
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
      <head>
        <script src="datafeeds/udf/dist/bundle.js"></script>
      </head>
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
