"use client"

import { AlertDialog } from "@/components/stateful/dialogs/alert-dialog"
import { Dialog } from "@/components/stateful/dialogs/dialog"

export function DialogProvider({ children }: React.PropsWithChildren) {
  return (
    <>
      {children}
      <Dialog />
      <AlertDialog />
    </>
  )
}
