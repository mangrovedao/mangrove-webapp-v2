"use client"

import { Button } from "@/components/ui/button"

export default function Rewards() {
  return (
    <div>
      <h1>Rewards</h1>
      <Button
        onClick={() => {
          throw new Error("test error")
        }}
      >
        Throw error
      </Button>
    </div>
  )
}
