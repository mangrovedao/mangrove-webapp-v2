"use client"
import { Coins, ListTree } from "lucide-react"
import React, { useState } from "react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import withClientOnly from "@/hocs/withClientOnly"
import { ActionButton } from "./action-button"
import { Dependencies } from "./dependencies/dependencies"
import { Footer } from "./footer"
import { Tokens } from "./tokens/tokens"

const MENU_ITEMS = [
  {
    label: "Tokens",
    icon: Coins,
    content: Tokens,
  },
  {
    label: "Dependencies",
    icon: ListTree,
    content: Dependencies,
    hideSearch: true,
  },
]

function AdminCommand() {
  const [open, toggle] = React.useReducer((isOpen) => !isOpen, false)
  const [context, setContext] = useState<(typeof MENU_ITEMS)[number] | null>()
  const [search, setSearch] = useState("")

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        handleOpenChange()
      } else if (e.key === "Backspace" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setContext(null)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  function handleOpenChange() {
    toggle()
    setSearch("")
    setContext(null)
  }

  function handleBack() {
    setContext(null)
    setSearch("")
  }

  return (
    <CommandDialog open={open} onOpenChange={handleOpenChange}>
      <div className="px-3 py-2 text-base text-gray-400">
        {context?.label ?? "Home"}
      </div>
      {!context?.hideSearch && (
        <CommandInput
          placeholder={"Type a command or search..."}
          value={search}
          onValueChange={setSearch}
        />
      )}
      {context?.content ? (
        <context.content onBack={handleBack} />
      ) : (
        <>
          <CommandList className="overflow-hidden">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Informations">
              {MENU_ITEMS.map((item) => {
                return (
                  <CommandItem
                    key={item.label}
                    onSelect={() => {
                      setSearch("")
                      setContext(item)
                    }}
                  >
                    {item.icon && <item.icon className="h-5 w-5 mr-2" />}
                    <span>{item.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
          <Footer>
            <ActionButton keys={["Esc"]} onClick={handleOpenChange}>
              Quit
            </ActionButton>
          </Footer>
        </>
      )}
    </CommandDialog>
  )
}

export default withClientOnly(AdminCommand)
