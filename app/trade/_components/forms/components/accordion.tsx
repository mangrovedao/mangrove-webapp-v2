import InfoTooltip from "@/components/info-tooltip-new"
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
  disabled?: boolean
  tooltip?: string
  chevronValue?: string
}
export function Accordion({
  title,
  children,
  defaultOpen = false,
  className,
  disabled = false,
  tooltip,
  chevronValue,
}: Props) {
  return (
    <Collapsible
      className={cn(
        "w-full cursor-pointer group",
        disabled && "cursor-not-allowed",
        className,
      )}
      defaultOpen={defaultOpen}
      disabled={disabled}
    >
      <CollapsibleTrigger asChild>
        <button className="flex items-center justify-between w-full hover:opacity-80 transition-opacity">
          <span className="text-text-secondary flex items-center text-xs">
            {title}
          </span>
          <div className="flex items-center">
            {chevronValue && (
              <span className="text-text-secondary text-xs">
                {chevronValue}
              </span>
            )}
            <ChevronDown
              className={
                "h-6 w-6 transition-transform group-data-[state=open]:rotate-180 text-text-secondary"
              }
            />
            {tooltip && (
              <InfoTooltip className="text-text-quaternary text-sm">
                {tooltip}
              </InfoTooltip>
            )}
          </div>

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
