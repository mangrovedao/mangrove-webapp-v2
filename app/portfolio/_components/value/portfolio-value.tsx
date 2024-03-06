"use client"

import DownArrowIcon from "../../_icons/DownArrowIcon"
import UpArrowIcon from "../../_icons/UpArrowIcon"

export default function PortfolioValue() {
  return (
    <div className="p-6 flex flex-col justify-between h-full">
      <h1>Portfolio Value</h1>

      <div className="space-y-4">
        <h6 className="md:text-5xl text-2xl">$ 1,234.12</h6>
        <div className="flex space-x-3">
          <div className="flex text-[#00DF81] space-x-1 items-center">
            <span>
              <UpArrowIcon />
            </span>
            <span>13%</span>
          </div>
          <div className="flex text-[#FF5C5C] space-x-1 items-center">
            <span>
              <DownArrowIcon />
            </span>
            <span>3%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
