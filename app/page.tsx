"use client"

import { AlertDialog } from "@/components/stateful/alert-dialog"
import { Dialog } from "@/components/stateful/dialog"
import useMangrove from "@/providers/mangrove"

export default function Home() {
  const { mangrove } = useMangrove()

  return (
    <main className="flex h-full flex-col items-center justify-between p-4">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm flex-col space-y-4">
        <h1>Webapp</h1>
        {mangrove ? (
          <div>
            <h2>Connected to mangrove</h2>
            <p>Mangrove address: {mangrove.address}</p>
            <p>Network name: {mangrove.network.name}</p>
            <p>Network id: {mangrove.network.id}</p>
          </div>
        ) : (
          <div>
            <h2>Not connected to mangrove</h2>
          </div>
        )}
        <div className="w-full h-96">{/* <DepthChart /> */}</div>
      </div>

      <Dialog />
      <AlertDialog />
    </main>
  )
}
