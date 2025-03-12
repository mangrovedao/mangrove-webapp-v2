"use client"
import React, { useEffect, useState } from "react"
import { Toaster } from "sonner"

import AdminCommand from "@/components/stateful/admin-command/admin-command"
import DisclaimerDialog from "@/components/stateful/dialogs/disclaimer-dialog"
import { WrongNetworkAlertDialog } from "@/components/stateful/dialogs/wrong-network-dialog"
import { RootProvider } from "@/providers/root"

import Navbar from "@/components/navbar"
import "./globals.css"

const toastClasses =
  "!border !border-dark-green !text-sm !font-axiforma !text-white !bg-bg-secondary !font-normal"
const titleClasses = "!font-medium"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [toastPosition, setToastPosition] = useState<
    "top-right" | "bottom-center"
  >("bottom-center")

  useEffect(() => {
    // Function to set position based on screen width
    const setPositionBasedOnScreenSize = () => {
      if (window.matchMedia("(max-width: 768px)").matches) {
        setToastPosition("top-right")
      } else {
        setToastPosition("bottom-center")
      }
    }

    // Set initial position
    setPositionBasedOnScreenSize()

    // Add event listener for window resize
    window.addEventListener("resize", setPositionBasedOnScreenSize)

    // Clean up event listener
    return () => {
      window.removeEventListener("resize", setPositionBasedOnScreenSize)
    }
  }, [])

  return (
    <html lang="en">
      <body>
        <div>
          <RootProvider>
            <Navbar />
            <div className="px-4">{children}</div>
            <AdminCommand />
            <WrongNetworkAlertDialog />
            <DisclaimerDialog />
          </RootProvider>
          <Toaster
            position={toastPosition}
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
