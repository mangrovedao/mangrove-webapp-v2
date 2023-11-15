"use client"

import { AlertDialog } from "@components/stateful/alert-dialog"
import { Dialog } from "@components/stateful/dialog"

export function DialogProvider({ children }: React.PropsWithChildren) {
  return (
    <>
      {children}
      <Dialog />
      <AlertDialog />
    </>
  )
}
