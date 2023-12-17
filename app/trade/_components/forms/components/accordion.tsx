import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronDown } from "@/svgs"
import { cn } from "@/utils"

type Props = {
  title: string
  children: React.ReactNode
  className?: string
  defaultOpen?: boolean | undefined
}
export function Accordion({
  title,
  children,
  defaultOpen = false,
  className,
}: Props) {
  return (
    <Collapsible
      className={cn("w-full cursor-pointer group", className)}
      defaultOpen={defaultOpen}
    >
      <CollapsibleTrigger asChild>
        <button className="flex items-center justify-between w-full hover:opacity-80 transition-opacity">
          <h4 className="font-semibold">{title}</h4>
          <ChevronDown
            className={
              "h-4 w-4 transition-transform group-data-[state=open]:rotate-180"
            }
          />
          <span className="sr-only">Toggle</span>
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent
        className="space-y-2 data-[state=closed]:hidden"
        forceMount
      >
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}
