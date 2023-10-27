import Book from "./sections/book"
import Market from "./sections/market"
import Trade from "./sections/trade"

export default function Page() {
  return (
    <div className="grid grid-cols-4 gap-8 h-screen p-10">
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
