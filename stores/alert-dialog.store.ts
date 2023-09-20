import { create } from "zustand"

import {
  dialogStateCreator,
  type DialogActions,
  type DialogStore,
} from "@/stores/dialog.store"

// we share the exact same state except for the description
type Store = Omit<DialogStore, "description">

export const useAlertDialogStore = create<Store & DialogActions>(
  dialogStateCreator,
)
