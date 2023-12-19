import { type Market } from "@mangrovedao/mangrove.js"

import { TokenPair } from "@/components/token-pair"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { DotIcon } from "lucide-react"
import { type Order } from "../schema"

type Props = {
  onClose: () => void
  order?: Order
  market?: Market
}

export function EditOrderDrawer({ order, market, onClose }: Props) {
  if (!order || !market) return null
  const { base, quote } = market

  return (
    <Drawer open={!!order} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Order Details</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <TokenPair
            tokenClasses="h-7 w-7"
            baseToken={base}
            quoteToken={quote}
            titleProps={{
              variant: "title1",
            }}
          />
          <DrawerLine title="Status" item={<Badge title="Open" />} />
          <DrawerLine
            title="Order Date"
            item={order.creationDate.toDateString()}
            secondaryItem={`${order.creationDate.getHours()}:${order.creationDate.getMinutes()}`}
          />
          <DrawerLine
            title="Side"
            item={
              order.isBid ? (
                <span className="text-green-caribbean">Buy</span>
              ) : (
                <span className="text-red-100">Sell</span>
              )
            }
          />
          <DrawerLine title="Type" item={"xx"} />
          <DrawerLine
            title="Filled/Amount"
            item={`${order.takerGot} / ${order.takerGave} ${base.symbol}`}
          />
          <DrawerLine
            title="Price"
            item={`${Number(order.price).toFixed(4)} ${base.symbol}`}
          />
          {order?.expiryDate ? (
            <DrawerLine
              title="Time in force"
              item={
                order?.expiryDate > new Date() ? "Good till time" : "Expired"
              }
              secondaryItem={"xx"}
            />
          ) : undefined}
          <DrawerLine title="Slippage tolerance" item={"xx %"} />
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose className="flex-1">
            <Button className="w-full" variant={"secondary"} size={"lg"}>
              Cancel
            </Button>
          </DrawerClose>
          <Button className="flex-1" variant={"primary"} size={"lg"}>
            Modify
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

type DrawerLineProps = {
  title: string
  item: React.ReactNode
  secondaryItem?: React.ReactNode
}

const DrawerLine = ({ title, item, secondaryItem }: DrawerLineProps) => {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{title}:</span>
      <div className="grid justify-items-end">
        <span>{item}</span>
        {secondaryItem ? (
          <span className="text-muted-foreground">{secondaryItem}</span>
        ) : undefined}
      </div>
    </div>
  )
}

const Badge = ({ title }: { title: string }) => (
  <div className="flex pl-1 pr-2 justify-between text-green-caribbean bg-primary-dark-green rounded items-center">
    <DotIcon className="h-4 w-auto" />
    <Title variant={"title3"}>{title}</Title>
  </div>
)
