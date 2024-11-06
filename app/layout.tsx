import React from "react"
import { Toaster } from "sonner"

import { Navbar } from "@/components/navbar"
import AdminCommand from "@/components/stateful/admin-command/admin-command"
import DisclaimerDialog from "@/components/stateful/dialogs/disclaimer-dialog"
import { WrongNetworkAlertDialog } from "@/components/stateful/dialogs/wrong-network-dialog"
import { RootProvider } from "@/providers/root"

import Sidebar from "@/components/sidebar/sidebar"
import "./globals.css"

const toastClasses =
  "!border !border-dark-green !text-sm !font-axiforma !text-white !bg-bg-secondary !font-normal"
const titleClasses = "!font-medium"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="">
        <div className="md:pl-[6.5rem] px-4">
          <RootProvider>
            <Sidebar />
            <Navbar />
            {children}
            <AdminCommand />
            <WrongNetworkAlertDialog />
            <DisclaimerDialog />
          </RootProvider>
          <Toaster
            position="bottom-center"
            toastOptions={{
              className: toastClasses,
              classNames: {
                toast: toastClasses,
                title: titleClasses,
                error: "!fill-red-100 border-red-100",
                success: "!fill-green-caribbean border-border-brand",
              },
              style: {
                backgroundColor: "bg-bg-secondary",
                fontFamily: "Axiforma",
                fontSize: "14px",
                borderRadius: "16px",
                border: "3px solid border-border-tertiary",
              },
            }}
          />
        </div>
      </body>
    </html>
  )
}
