"use client"

import { AlertDialog } from "@/components/stateful/alert-dialog"
import { Dialog } from "@/components/stateful/dialog"
import { SlippageSettings } from "@/components/stateful/slippage-settings"
import useMangrove from "@/providers/mangrove"
import { useAlertDialogStore } from "@/stores/alert-dialog.store"

export default function Home() {
  const { mangrove } = useMangrove()
  const setOpened = useAlertDialogStore((store) => store.setOpened)

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm flex-col space-y-4">
        <h1>Webapp</h1>
        <SlippageSettings />
        {/* <Button
          onClick={() =>
            openAlertDialog({
              onConfirm: () => {
                alert("goood")
                setOpened(false)
              },
            })
          }
        >
          Open alert
        </Button> */}
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

      <Dialog />
      <AlertDialog />
    </main>
  )
}
