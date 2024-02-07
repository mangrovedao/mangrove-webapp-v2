const POINTS = [
  {
    id: "Trader points",
    points: 2920,
    color: "bg-green-caribbean",
  },
  {
    id: "Liquidity providing points",
    points: 540,
    color: "bg-[#8F5AE8]",
  },
  {
    id: "Community points",
    points: 25,
    color: "bg-white",
  },
  {
    id: "Referral points",
    points: 400,
    color: "bg-green-bangladesh",
  },
]

export default function TotalPoints() {
  const totalPoints = POINTS.reduce((total, item) => total + item.points, 0)

  return (
    <div className="w-full max-w-[390px]">
      <div className="flex justify-between">
        <div className="text-base text-cloud-200 font-normal">Total</div>
        <div className="text-base text-white font-normal">
          {totalPoints} points
        </div>
      </div>
      <div className="h-1 w-full rounded-lg overflow-hidden flex mt-2">
        {POINTS.map((item) => (
          <span
            key={item.id}
            style={{ width: `${(item.points / totalPoints) * 100}%` }}
            className={`${item.color} h-full`}
          ></span>
        ))}
      </div>
      <table className="mt-4 w-full text-white text-xs">
        <tbody>
          {POINTS.map((item) => (
            <tr key={item.id}>
              <td className="flex items-center py-1">
                <span
                  className={`inline-block w-1 h-1 rounded-full mr-2 ${item.color}`}
                ></span>
                {item.id}
              </td>
              <td className="text-right py-1">{item.points}</td>
              <td className="text-right text-cloud-200 py-1">
                ({((item.points / totalPoints) * 100).toFixed(0)}%)
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
