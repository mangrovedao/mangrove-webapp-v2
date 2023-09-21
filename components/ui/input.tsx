import * as React from "react"
import { cn } from "utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

interface InputWithIconProps extends InputProps {
  icon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputWithIconProps>(
  ({ className, type, icon, ...props }, ref) => {
    return (
      <div className="flex w-full relative">
        <input
          type={type}
          className={cn(
            "h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          ref={ref}
          {...props}
        />
        {icon && (
          <div className="peer-aria-pressed:text-red-600 flex items-center absolute inset-y-0 right-0 p-3">
            {icon}
          </div>
        )}
      </div>
    )
  },
)

Input.displayName = "Input"

export { Input }
