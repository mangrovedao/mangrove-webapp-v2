"use client"

import { Button } from "@/components/ui/button-old"
import withClientOnly from "@/hocs/withClientOnly"
import { useLayoutEffect, useState } from "react"
import { createPortal } from "react-dom"

const MobileOverlay = () => {
  const [mounted, setMounted] = useState(false)
  useLayoutEffect(() => {
    setMounted(true)
  }, [])
  const container = mounted && globalThis.document.body
  return container
    ? createPortal(
        <div className="fixed bg-black-rich inset-0 z-[999] md:hidden px-4">
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-white text-center">
              This app is not optimized for mobile yet. <br /> You can use the
              Swap app on small devices.
              <br />
              <br />
              <Button className="z-50">
                <a href="https://swap.mangrove.exchange" target="_blank">
                  Go to Swap App
                </a>
              </Button>
            </p>
          </div>
        </div>,
        container,
      )
    : null
}

export default withClientOnly(MobileOverlay)
