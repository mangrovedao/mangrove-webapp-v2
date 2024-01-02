"use client"
import { useQuery } from "@tanstack/react-query"
import { ObjectView } from "react-object-view"

import { parseDependencies } from "@/app/api/dependencies/schema"
import { CommandList } from "@/components/ui/command"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { ActionButton } from "../action-button"
import { Footer } from "../footer"

export function Dependencies({ onBack }: { onBack: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ["dependencies"],
    queryFn: async () => {
      const res = await fetch("/api/dependencies")
      const deps = await res.json()
      return parseDependencies(deps)
    },
  })

  function copyToClipboard() {
    navigator.clipboard.writeText(JSON.stringify(data)).then(
      () => {
        toast.success("Copied to clipboard")
      },
      () => {
        toast.error("Failed to copy text")
      },
    )
  }

  return (
    <>
      <CommandList className="border-t">
        <div className="py-4">
          {isLoading ? (
            <div className="px-4">
              <Spinner className="h-6" />
            </div>
          ) : (
            <ObjectView
              data={data}
              palette={{
                base00: "transparent",
              }}
            />
          )}
        </div>
      </CommandList>
      <Footer>
        <ActionButton keys={["⌘", "j"]} onClick={copyToClipboard}>
          Copy json
        </ActionButton>
        <ActionButton keys={["⌘", "←"]} onClick={onBack}>
          Back
        </ActionButton>
      </Footer>
    </>
  )
}
