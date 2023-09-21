import type React from "react"
import { create, type StateCreator } from "zustand"

import type { Button } from "@/components/ui/button"

export type ActionButton = React.ComponentProps<typeof Button> & {
  isClosing?: boolean
  id: string
}

export type DialogStore = {
  type?: "info" | "confirm" | "error" | "success"
  opened: boolean
  title: React.ReactNode
  children?: React.ReactNode
  description?: React.ReactNode
  actionButtons?: ActionButton[]
}

export type DialogActions = {
  setOpened: (opened: boolean) => void
}

export const dialogStateCreator: StateCreator<DialogStore & DialogActions> = (
  set,
) => ({
  opened: false,
  type: "info",
  title: "Dialog",
  children: undefined,
  description: "This is a dialog.",
  /**
    * Example usage of actionButtons:
      actionButtons: [
        {
          isClosing: true,
        },
        {
          onClick: () => alert("Confirm"),
          children: "Confirm",
        },
      ],
    */
  actionButtons: undefined,

  /**
   * Actions
   */
  setOpened: (opened) => set({ opened }),
})

export const useDialogStore = create(dialogStateCreator)
