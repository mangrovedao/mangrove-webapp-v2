import { Toaster } from "sonner"

import { Navbar } from "@/components/navbar"
import { RootProvider } from "@/providers/root"

import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script src="datafeeds/udf/dist/bundle.js" async></script>
      </head>
      <body className="grid grid-areas-layout">
        <RootProvider>
          <Navbar />
          {children}
        </RootProvider>
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  )
}
