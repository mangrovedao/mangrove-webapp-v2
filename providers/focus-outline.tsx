"use client"

import { useFocusOutlineOnlyForKeyboard } from "@/hooks/use-focus-outline-only-for-keyboard"

export function FocusOutline({ children }: React.PropsWithChildren) {
  useFocusOutlineOnlyForKeyboard()
  return children
}
