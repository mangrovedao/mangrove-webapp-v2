"use client"

import ChangeNetworkDialog from "@/components/change-network-dialog"
import Dialog from "@/components/dialog"
import useMangrove from "@/providers/mangrove"

export default function Home() {
  const { mangrove } = useMangrove()

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
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
      </div>

      <ChangeNetworkDialog />
      <Dialog />
    </main>
  )
}
