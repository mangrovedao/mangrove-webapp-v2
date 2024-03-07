"use client"

export default function OverviewCharts() {
  return (
    <div className="p-6 flex flex-col justify-between h-full">
      <div className="flex justify-between">
        <div className="flex space-x-2">
          <span className="w-12 py-0.5 text-center text-cloud-200 text-sm rounded-full border">
            0.5h
          </span>
          <span className="w-12 py-0.5 text-center text-cloud-200 text-sm rounded-full border">
            1h
          </span>
          <span className="w-12 py-0.5 text-center text-cloud-200 text-sm rounded-full border">
            4h
          </span>
          <span className="w-12 py-0.5 text-center text-sm rounded-full border border-green-caribbean">
            1d
          </span>
          <span className="w-12 py-0.5 text-center text-cloud-200 text-sm rounded-full border">
            7d
          </span>
          <span className="w-12 py-0.5 text-center text-cloud-200 text-sm rounded-full border">
            1m
          </span>
        </div>

        {/* <div>
          <Select value="line" defaultValue="line">
            <SelectTrigger className="p-0 rounded-none bg-transparent text-sm !border-transparent">
              <SelectValue suppressHydrationWarning />
            </SelectTrigger>
            <SelectContent>
              {["line", "chart"].map((v) => (
                <SelectItem key={v} value={v}>
                  <div className="flex items-center space-x-2">{v}</div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div> */}
      </div>
    </div>
  )
}
