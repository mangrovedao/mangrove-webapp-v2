import { Title } from "@/components/typography/title"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { TooltipInfo } from "@/svgs"
import { cn } from "@/utils"
import BoxContainer from "./box-container"

type Props = {
  className?: string
}

export default function NextLevel({ className }: Props) {
  return (
    <BoxContainer className={cn(className)}>
      <div className="flex justify-between">
        <Title className="flex items-center">
          Next level{" "}
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger className="hover:opacity-80 transition-opacity ml-1 text-cloud-300">
                <TooltipInfo />
              </TooltipTrigger>
              <TooltipContent>
                Boosts are tied to your level, which <br /> is revised every 7
                days based on <br /> your weekly trading volume.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Title>
        <div className="text-base text-cloud-200 flex items-center">
          4d 12h 36m 15s{" "}
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger className="hover:opacity-80 transition-opacity ml-0.5">
                <TooltipInfo />
              </TooltipTrigger>
              <TooltipContent>Time until your level is updated.</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </BoxContainer>
  )
}
