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
        <script src="datafeeds/udf/dist/bundle.js"></script>
        <link rel="stylesheet" href="fonts/fonts.css" />
      </head>
      <body className="h-screen w-screen overflow-hidden">
        <RootProvider>
          <Navbar />
          {children}
        </RootProvider>
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  )
}
