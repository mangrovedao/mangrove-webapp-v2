import * as React from "react"

import { cn } from "@/utils"
import { Search } from "lucide-react"
import { Input, InputProps } from "./input-new"

export type SearchInputProps = {} & InputProps

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className={cn("w-full relative group/input", className)}>
        <div className="flex items-center absolute inset-y-0 left-4">
          <Search className="h-4 w-4" />
        </div>
        <Input ref={ref} className={cn("pl-12", className)} {...props} />
      </div>
    )
  },
)

SearchInput.displayName = "SearchInput"

export { SearchInput }
