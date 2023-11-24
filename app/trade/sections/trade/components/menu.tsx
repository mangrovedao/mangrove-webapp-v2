import {
  CustomTabs,
  CustomTabsList,
  CustomTabsTrigger,
} from "@/components/stateless/custom-tabs"
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
    <div className="inline-block align-middle">
      <CustomTabs
        defaultValue={MENU_ITEMS[0]?.name}
        onValueChange={(e) => setMarketType(e)}
      >
        <CustomTabsList className="w-full">
          {MENU_ITEMS.map(({ name }, i) => (
            <CustomTabsTrigger value={name} className="w-full h-8 rounded-3xl">
              {name}
            </CustomTabsTrigger>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="invisible">
                Stop
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
        </CustomTabsList>
      </CustomTabs>
    </div>
  )
}
