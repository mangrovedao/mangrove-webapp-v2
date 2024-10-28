import { cn } from "@/utils"
import type { DialogType } from "./types"

export const getContentClasses = (type: DialogType) =>
  cn("max-w-[600px] max-h-[calc(100vh-80px)]", {
    "overflow-auto": type !== "error" && type !== "success",
    "border-red-500 border-2 !shadow-error": type === "error",
    "border-primary-dark-green border-2 !shadow-success": type === "success",
  })

export const titleClasses = "text-center text-2xl font-medium"
export const descriptionClasses =
  "text-center text-sm font-normal text-muted-foreground"
export const footerClasses = "flex space-x-2 w-full"
