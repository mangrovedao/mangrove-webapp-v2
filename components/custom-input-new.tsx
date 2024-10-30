import * as React from "react"

import { cn } from "@/utils"
import { Text } from "./typography/text"
import { Input, type InputProps } from "./ui/input-new"

export type CustomInputProps = {
  symbol?: React.ReactNode
  icon?: string
} & InputProps

const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(
  ({ className, icon, symbol, ...props }, ref) => {
    return (
      <div
        className="w-full flex items-center bg-bg-primary relative rounded-lg focus-within:border-border-brand border border-transparent transition-all"
        onClick={(e) => {
          const input = e.currentTarget.querySelector("input")
          input?.focus()
        }}
      >
        <div className="text-text-tertiary pl-4">
          <Text
            className="text-sm font-axiforma text-text-quaternary"
            variant={"text2"}
          >
            Custom
          </Text>
        </div>
        <div className="flex-1 relative">
          <Input
            ref={ref}
            className={cn(
              "rounded-none h-8 ml-[75%] text-text-quaternary text-sm w-10 bg-transparent justify-end !outline-none transition-none overflow-hidden",
              className,
            )}
            {...props}
          />

          {symbol && (
            <div
              className={cn(
                "flex items-center absolute inset-y-0 right-4 z-30 bg-bg-primary",
                {
                  "text-gray-scale-400": props.disabled,
                  "text-text-secondary": !props.disabled,
                },
                className,
              )}
            >
              {symbol}
            </div>
          )}
        </div>
      </div>
    )
  },
)

CustomInput.displayName = "CustomInput"

export { CustomInput }
