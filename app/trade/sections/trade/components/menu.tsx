import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Props = {
  marketType: string
  setMarketType: (type: string) => void
}

export default function Menu({ marketType, setMarketType }: Props) {
  return (
    <div className="flex justify-between">
      <Button
        variant={"link"}
        className={`${marketType === "Market" && `underline`}`}
        onClick={() => setMarketType("Market")}
      >
        Market
      </Button>
      <Button
        variant={"link"}
        className={`${marketType === "Limit" && `underline`}`}
        onClick={() => setMarketType("Limit")}
      >
        Limit
      </Button>
      <Button
        variant={"link"}
        className={`${marketType === "Amplified" && `underline`}`}
        onClick={() => setMarketType("Amplified")}
      >
        Amplified
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="link"
            className={`${marketType === "Stop" && `underline`} `}
            onClick={() => setMarketType("Stop")}
          >
            Stop <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuItem>
            <span>Stop Limit</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <span>Stop Market</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          <DropdownMenuItem>
            <span>Trailling Stop</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          <DropdownMenuItem>
            <span>Take Profit Stop</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          <DropdownMenuItem>
            <span>Take Profit Market</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
