"use client"
import SelectMarket from "./components/pairs"
import StatusBar from "./components/status-bar"

export default function Header() {
  return (
    <div className="p-1 grid grid-cols-4 gap-4">
      <div className="col-span-1 ">
        <SelectMarket />
      </div>
      <div className="col-span-3">
        <StatusBar />
      </div>
    </div>
  )
}
