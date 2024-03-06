"use client"

export default function Metrics() {
  return (
    <div className="grid grid-cols-5">
      <div className="flex items-end space-x-3 px-5">
        <div className="bg-muted p-2 w-10 rounded-xl text-cloud-100 flex justify-center">
          ix
        </div>
        <div className="flex flex-col space-y-2">
          <span className="opacity-70 text-sm">Strategies PnL</span>
          <span className="font-medium text-2xl">-$1.23</span>
        </div>
      </div>
      <div className="flex items-end space-x-3 px-5">
        <div className="bg-muted p-2 w-10 rounded-xl text-cloud-100 flex justify-center">
          ix
        </div>
        <div className="flex flex-col space-y-2">
          <span className="opacity-70 text-sm">Avg.strategies return</span>
          <span className="font-medium text-2xl">13%</span>
        </div>
      </div>
      <div className="flex items-end space-x-3 px-5">
        <div className="bg-muted p-2 w-10 rounded-xl text-cloud-100 flex justify-center">
          ix
        </div>
        <div className="flex flex-col space-y-2">
          <span className="opacity-70 text-sm">Total points</span>
          <span className="font-medium text-2xl">3223</span>
        </div>
      </div>
      <div className="flex items-end space-x-3 px-5">
        <div className="bg-muted p-2 w-10 rounded-xl text-cloud-100 flex justify-center">
          ix
        </div>
        <div className="flex flex-col space-y-2">
          <span className="opacity-70 text-sm">Volume generated</span>
          <span className="font-medium text-2xl">$263.64</span>
        </div>
      </div>
      <div className="flex items-end space-x-3 px-5">
        <div className="bg-muted p-2 w-10 rounded-xl text-cloud-100 flex justify-center">
          ix
        </div>
        <div className="flex flex-col space-y-2">
          <span className="opacity-70 text-sm">Volume traded</span>
          <span className="font-medium text-2xl">$63.64</span>
        </div>
      </div>
    </div>
  )
}
