import MarketSelector from "@/components/stateful/market-selector"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import MarketInfoBar from "./components/market-infos-bar"
import Market from "./sections/market/market"
import Book from "./sections/orderbook/orderbook"
import Trade from "./sections/trade/trade"

const data = [
  {
    date: "10.03.2020",
    side: "sell",
    type: "Market",
    amount: "50ETh/30ETH",
    price: 0.98,
    status: "filled",
  },
  {
    date: "10.03.2020",
    side: "buy",
    type: "Limit",
    amount: "50ETh/30ETH",
    price: 0.98,
    status: "complete",
  },
  {
    date: "10.03.2020",
    side: "buy",
    type: "Amplified",
    amount: "50ETh/30ETH",
    price: 0.98,
    status: "complete",
  },
  {
    date: "10.03.2020",
    side: "buy",
    type: "Stop",
    amount: "50ETh/30ETH",
    price: 0.98,
    status: "complete",
  },
]

export default function Page() {
  return (
    <div className="h-full">
      <div className="h-full flex">
        <div className="max-w-xs">
          <div className="px-4 py-[15px] border-b">
            <MarketSelector />
          </div>
          <Trade className="h-full" />
        </div>
        <Book className="h-full max-w-xs w-full border-x" />
        <div className="w-full h-full">
          <MarketInfoBar />
          <Market className="w-full border-t" />
        </div>
      </div>
      <Tables />
    </div>
  )
}

function Tables({ className }: React.ComponentProps<"div">) {
  return (
    <div className={className}>
      <div className="m-5 flex space-x-5">
        <span>Open Orders (0)</span>
        <span>History (0)</span>
      </div>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Side</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount/Filled</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map(({ date, side, type, amount, price, status }, i) => (
              <TableRow key={`trading-market-${i}`}>
                <TableCell>{date}</TableCell>
                <TableCell>{side}</TableCell>
                <TableCell>{type}</TableCell>
                <TableCell>{amount}</TableCell>
                <TableCell>{price}</TableCell>
                <TableCell>{status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
