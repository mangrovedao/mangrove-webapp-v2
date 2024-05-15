import { MangroveLogo } from "@/svgs"

export function SetLiquiditySourcing() {
  return (
    <div className="bg-[#041010] rounded-lg px-4 pt-4 pb-12 space-y-8">
      <div className="flex justify-center items-center">
        <MangroveLogo className="w-12 h-12 flex justify-center items-center" />
      </div>
      <h1 className="text-2xl text-white text-center">
        Set Liquidity sourcing
      </h1>
      <p className="text-base text-gray-scale-300">
        By granting permission, you are allowing the following contract to set
        the selected liquidity sources.
      </p>
    </div>
  )
}
