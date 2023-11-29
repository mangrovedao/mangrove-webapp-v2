import {
  CustomTabs,
  CustomTabsList,
  CustomTabsTrigger,
} from "@/components/stateless/custom-tabs"

type Props = {
  setMarketType: (type: string) => void
}

const MENU_ITEMS = [
  {
    name: "Limit",
  },
  {
    name: "Market",
  },
]

export default function Menu({ setMarketType }: Props) {
  return (
    <div className="inline-block align-middle">
      <CustomTabs
        defaultValue={MENU_ITEMS[0]?.name}
        onValueChange={(e) => setMarketType(e)}
      >
        <CustomTabsList className="w-full py-0">
          {MENU_ITEMS.map(({ name }) => (
            <CustomTabsTrigger key={`${name}-tab`} value={name}>
              {name}
            </CustomTabsTrigger>
          ))}
        </CustomTabsList>
      </CustomTabs>
    </div>
  )
}
