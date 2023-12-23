"use client"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Coins, ListTree } from "lucide-react"
import React from "react"

export function AdminCommand() {
  const [open, toggle] = React.useReducer((isOpen) => !isOpen, false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggle()
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={toggle}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Informations">
          <CommandItem>
            <Coins className="h-5 w-5 mr-2" />
            <span>Tokens addresses</span>
          </CommandItem>
          <CommandItem>
            <ListTree className="h-5 w-5 mr-2" />
            <span>Project dependencies</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
