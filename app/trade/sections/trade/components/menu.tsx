import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/utils"

type Props = {
  marketType: string
  setMarketType: (type: string) => void
}

const MENU_ITEMS = [
  {
    name: "Limit",
  },
  {
    name: "Market",
  },
  {
    name: "Amplified",
  },
]

export default function Menu({ marketType, setMarketType }: Props) {
  return (
    <div className="flex justify-between ">
      {MENU_ITEMS.map(({ name }) => (
        <Button
          key={name}
          variant={"invisible"}
          className="relative"
          onClick={() => setMarketType(name)}
        >
          {name}
          <span
            className={cn(
              "h-[0.10rem] w-full bg-caribbean-green inset-x-0 -bottom-1 absolute opacity-0 transition-all",
              {
                "opacity-100": marketType === name,
              },
            )}
          />
        </Button>
      ))}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="invisible" className="relative">
            Stop <ChevronDown className="h-4 w-4" />
            <span
              className={cn(
                "h-[0.10rem] w-full bg-caribbean-green inset-x-0 -bottom-1 absolute opacity-0 transition-all",
                {
                  "opacity-100": marketType === "Stop",
                },
              )}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuItem onClick={() => setMarketType("Stop")}>
            <span>Stop Limit</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setMarketType("Stop")}>
            <span>Stop Market</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setMarketType("Stop")}>
            <span>Trailling Stop</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setMarketType("Stop")}>
            <span>Take Profit Stop</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setMarketType("Stop")}>
            <span>Take Profit Market</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
