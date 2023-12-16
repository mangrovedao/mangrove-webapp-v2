/* eslint-disable @typescript-eslint/ban-ts-comment */
import Script from "next/script"
import React from "react"
import { Toaster } from "sonner"

import { Navbar } from "@/components/navbar"
import { RootProvider } from "@/providers/root"

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
      <body className="grid grid-areas-layout">
        <RootProvider>
          <Navbar />
          {children}
          {/* FIXME: This is a quick fix, I don't know why but the <w3m-modal /> is not injected into the DOM with the way I set the providers/contexts in the app */}
          {/* @ts-ignore */}
          <w3m-modal />
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
      </body>
    </html>
  )
}
