import { type Market } from "@mangrovedao/mangrove.js"
import { DotIcon } from "lucide-react"
import React from "react"

import { TokenPair } from "@/components/token-pair"
import { Text } from "@/components/typography/text"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import { CircularProgressBar } from "@/components/ui/circle-progress-bar"
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { cn } from "@/utils"
import { type Order } from "../schema"

type DrawerLineProps = {
  title: string
  item: React.ReactNode
  secondaryItem?: React.ReactNode
}

const DrawerLine = ({ title, item, secondaryItem }: DrawerLineProps) => (
  <div className="flex justify-between">
    <Text className="text-muted-foreground">{title}:</Text>
    <div className="grid justify-items-end">
      <Text>{item}</Text>
      {secondaryItem && (
        <Text className="text-muted-foreground">{secondaryItem}</Text>
      )}
    </div>
  </div>
)

const Badge = ({
  title,
  isExpired,
}: {
  title: string
  isExpired?: boolean
}) => (
  <div
    className={cn(
      "flex pl-1 pr-2 justify-between text-green-caribbean bg-primary-dark-green rounded items-center",
      { "text-red-100 bg-red-950": isExpired },
    )}
  >
    <DotIcon className="h-4 w-auto" />
    <Title variant="title3">{title}</Title>
  </div>
)

type EditOrderDrawerProps = {
  onClose: () => void
  order?: Order
  market?: Market
}

export const EditOrderDrawer = ({
  order,
  market,
  onClose,
}: EditOrderDrawerProps) => {
  if (!order || !market) return null

  const { base, quote } = market
  const isBid = order.isBid
  const formattedOrderDate = `${order.creationDate.toDateString()} ${order.creationDate.getHours()}:${order.creationDate.getMinutes()}`
  const formattedPrice = `${Number(order.price).toFixed(4)} ${base.symbol}`
  const isOrderExpired = order.expiryDate && order.expiryDate <= new Date()

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
            titleProps={{ variant: "title1" }}
          />

          <DrawerLine
            title="Status"
            item={
              <Badge
                title={isOrderExpired ? "Closed" : "Open"}
                isExpired={isOrderExpired}
              />
            }
          />
          <DrawerLine title="Order Date" item={formattedOrderDate} />
          <DrawerLine
            title="Side"
            item={
              <Text className={isBid ? "text-green-caribbean" : "text-red-100"}>
                {isBid ? "Buy" : "Sell"}
              </Text>
            }
          />
          <DrawerLine title="Type" item="xx" />
          <DrawerLine
            title="Filled/Amount"
            item={`${order.takerGot} / ${order.takerGave} ${base.symbol}`}
            secondaryItem={
              <div className="flex gap-1">
                <CircularProgressBar progress={20} className="h-5 w-5" />
                <Text>20 %</Text>
              </div>
            }
          />
          <DrawerLine title="Price" item={formattedPrice} />
          {order.expiryDate && (
            <DrawerLine
              title="Time in force"
              item={isOrderExpired ? "Expired" : "Good till time"}
              secondaryItem="xx"
            />
          )}
          <DrawerLine title="Slippage tolerance" item="xx %" />
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose className="flex-1">
            <Button className="w-full" variant="secondary" size="lg">
              Cancel
            </Button>
          </DrawerClose>
          <Button className="flex-1" variant="primary" size="lg">
            Modify
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
