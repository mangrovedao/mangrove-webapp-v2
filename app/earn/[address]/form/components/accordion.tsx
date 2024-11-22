import { Caption } from "@/components/typography/caption"
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
        <button className="flex items-center  w-full hover:opacity-80 transition-opacity">
          <Caption className="!text-sm text-text-primary ">{title}</Caption>
          <ChevronDown
            className={
              "h-6 w-6 transition-transform group-data-[state=open]:rotate-180 text-text-primary"
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
