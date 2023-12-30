/* eslint-disable @next/next/no-img-element */
import { Check, ExclamationMark, Info } from "@/svgs"
import { cn } from "@/utils"
import type { DialogType } from "./types"

export function Heading({ type }: { type: DialogType }) {
  if (!type) return null
  return (
    <>
      <div className="w-full flex justify-center mb-8">
        <div
          className={cn(
            "w-16 aspect-square rounded-lg flex items-center justify-center",
            {
              "bg-red-500 text-red-100": type === "error",
              "bg-primary-dark-green text-green-caribbean":
                type === "success" || type === "info",
            },
          )}
        >
          {type === "error" ? (
            <ExclamationMark />
          ) : type === "info" ? (
            <Info className="h-8 w-auto" />
          ) : (
            <Check />
          )}
        </div>
      </div>

      <Illustration type={type} />
    </>
  )
}

function Illustration({ type }: { type: DialogType }) {
  if (type !== "error" && type !== "success") return null
  return (
    <img
      src={`/assets/illustrations/${type}-chameleon.webp`}
      alt="red chameleon illustration"
      className="absolute top-2 left-3 w-[41.7%] aspect-auto -translate-y-3/4"
    />
  )
}
