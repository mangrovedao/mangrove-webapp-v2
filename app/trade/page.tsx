import Book from "./sections/book/book"
import Market from "./sections/market/market"
import Trade from "./sections/trade/trade"

export default function Page() {
  return (
    <div className="grid grid-cols-4 gap-3 h-screen p-1">
      <div className="border border-solid border-white rounded-md">
        <Trade />
      </div>
      <div className="border border-solid border-white rounded-md">
        <Book />
      </div>
      <div className="col-span-2 border border-solid border-white rounded-md">
        <Market />
      </div>
    </div>
  )
}
