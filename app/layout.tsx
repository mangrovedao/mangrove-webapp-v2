import Script from "next/script"
import React from "react"
import { Toaster } from "sonner"

import AdminCommand from "@/components/stateful/admin-command/admin-command"
import { RootProvider } from "@/providers/root"

import { WrongNetworkAlertDialog } from "@/components/stateful/dialogs/wrong-network-dialog"
import "./globals.css"

const toastClasses =
  "!border !border-dark-green !text-sm !font-axiforma !text-white !bg-gray-scale-700 !font-normal"
const titleClasses = "!font-medium"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Script src="datafeeds/udf/dist/bundle.js" async></Script>
      </head>
      <body>
        <RootProvider>
          {children}
          <AdminCommand />
          <WrongNetworkAlertDialog />
        </RootProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            className: toastClasses,
            classNames: {
              toast: toastClasses,
              title: titleClasses,
              error: "!fill-red-100",
              success: "!fill-green-caribbean",
            },
            style: {
              fontFamily: "Axiforma",
              fontSize: "14px",
              border: "1px solid #032221",
              borderRadius: "8px",
            },
          }}
        />
      </body>
    </html>
  )
}
