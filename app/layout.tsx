import React from "react"
import { Toaster } from "sonner"

import AdminCommand from "@/components/stateful/admin-command/admin-command"
import { WrongNetworkAlertDialog } from "@/components/stateful/dialogs/wrong-network-dialog"
import { RootProvider } from "@/providers/root"

import { Button } from "@/components/ui/button"
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
      <body>
        <RootProvider>
          {children}
          <AdminCommand />
          <WrongNetworkAlertDialog />
          {/* <DisclaimerDialog /> */}
        </RootProvider>
        <Toaster
          position="bottom-center"
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
        <div className="fixed bg-black-rich inset-0 z-[999] md:hidden px-4">
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-white text-center">
              This app is not optimized for mobile yet. <br /> You can use the
              Swap app on small devices.
              <br />
              <br />
              <Button>
                <a href="https://swap.mangrove.exchange" target="_blank">
                  Go to Swap App
                </a>
              </Button>
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}
