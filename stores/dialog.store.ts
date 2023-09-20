import type React from "react"
import { create } from "zustand"

import type { Button } from "@/components/ui/button"

type ActionButton = React.ComponentProps<typeof Button> & {
  isClosing?: boolean
}

type Store = {
  type?: "info" | "confirm" | "error" | "success"
  opened: boolean
  title: string | React.ReactNode
  children?: React.ReactNode
  description?: string | React.ReactNode
  actionButtons?: ActionButton[]
}

type Actions = {
  setOpened: (opened: boolean) => void
}

export const useDialogStore = create<Store & Actions>((set) => ({
  opened: false,
  setOpened: (opened) => set({ opened }),
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
}))
