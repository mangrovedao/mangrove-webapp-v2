import { cn } from "@/utils"
import type { DialogType } from "./types"

export const getContentClasses = (type: DialogType) =>
  cn("p-8 max-w-md", {
    "border-red-500 border-2 !shadow-error": type === "error",
    "border-primary-dark-green border-2 !shadow-success": type === "success",
  })

export const titleClasses = "text-center text-2xl font-medium"
export const descriptionClasses = "text-center text-sm font-normal !mt-4"
export const footerClasses = "!mt-8 flex space-x-2 justify-end"
