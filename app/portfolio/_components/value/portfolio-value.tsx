"use client"

import { CircularProgressBar } from "@/components/ui/circle-progress-bar"
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
          <span className="opacity-70 pl-4">Past week</span>
        </div>

        <div className="bg-primary-bush-green items-center rounded-xl p-6 flex">
          <div className="pr-10">
            <CircularProgressBar
              size={75}
              strokeWidth={20}
              progress={75}
              className="ml-3"
            />
          </div>

          <div className="flex flex-col flex-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="bg-green-caribbean size-2.5 rounded-full" />
                <span>Orders</span>
                <span className="bg-primary-dark-green py-1 px-2 text-cloud-200 rounded-lg">
                  3
                </span>
              </div>
              <span>
                $ 1234.12 <span className="opacity-60">(75%)</span>
              </span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="bg-green-bangladesh size-2.5 rounded-full" />
                <span>Strategies</span>
                <span className="bg-primary-dark-green py-1 px-2 text-cloud-200 rounded-lg">
                  5
                </span>
              </div>
              <span>
                $ 640.60 <span className="opacity-60">(25%)</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
