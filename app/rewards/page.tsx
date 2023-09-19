"use client"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"

export default function Rewards() {
  return (
    <div>
      <h1>Rewards</h1>
      <Button
        onClick={() => {
          toast.error("test error")
          throw new Error("test error")
        }}
      >
        Throw error
      </Button>
    </div>
  )
}
