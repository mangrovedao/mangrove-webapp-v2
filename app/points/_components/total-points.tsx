import { cn } from "@/utils"
import { formatNumber } from "@/utils/numbers"
import { useUserPoints } from "./leaderboard/use-leaderboard"

export default function TotalPoints() {
  const { data: userPoints } = useUserPoints()

  const points = [
    {
      id: "Trader points",
      points: Number(userPoints?.taker_points ?? 0),
      color: "bg-green-caribbean",
    },
    {
      id: "Liquidity providing points",
      points: Number(userPoints?.maker_points ?? 0),
      color: "bg-[#8F5AE8]",
    },
    // {
    //   id: "Community points",
    //   points: Number(userPoints?.community_points ?? 0),
    //   color: "bg-white",
    // },
    {
      id: "Referral points",
      points: Number(userPoints?.referees_points ?? 0),
      color: "bg-green-bangladesh",
    },
  ]
  const totalPoints = points.reduce((total, item) => total + item.points, 0)

  return (
    <div className="w-full max-w-[390px]">
      <div className="flex justify-between">
        <div className="text-base text-cloud-200 font-normal">Total</div>
        <div className="text-base text-white font-normal">
          {formatNumber(totalPoints)} points
        </div>
      </div>
      <div className="h-1 w-full rounded-lg overflow-hidden flex mt-2">
        {totalPoints ? (
          points.map((item) => (
            <span
              key={item.id}
              style={{ width: `${(item.points / totalPoints) * 100}%` }}
              className={`${item.color} h-full`}
            ></span>
          ))
        ) : (
          <span className="bg-cloud-300 w-full" />
        )}
      </div>
      <table className="mt-4 w-full text-white text-xs">
        <tbody>
          {points.map((item) => {
            const points = item.points ?? 1
            const circleColor = !points ? "bg-cloud-300" : item.color
            const percentage = points ? (item.points / totalPoints) * 100 : 0
            return (
              <tr
                key={item.id}
                className={cn({
                  "text-cloud-00": !points,
                })}
              >
                <td className="flex items-center py-1">
                  <span
                    className={`inline-block w-1 h-1 rounded-full mr-2 ${circleColor}`}
                  ></span>
                  {item.id}
                </td>
                <td className="text-right py-1">{formatNumber(item.points)}</td>
                <td className="text-right text-cloud-200 py-1">
                  ({percentage.toFixed(0)}%)
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
