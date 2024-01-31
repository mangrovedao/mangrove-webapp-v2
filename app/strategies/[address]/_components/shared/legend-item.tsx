import { cn } from "@/utils"

export function LegendItem({ type }: { type: "bids" | "asks" | "empty" }) {
  return (
    <span className="flex items-center text-sm">
      <span
        className={cn(
          "w-[6px] h-[6px] bg-green-caribbean rounded-full mx-[5px]",
          {
            "bg-[#BCBCBC]": type === "empty",
            "bg-green-caribbean": type === "bids",
            "bg-cherry-100": type === "asks",
          },
        )}
      ></span>
      {type === "asks"
        ? "Live asks"
        : type === "bids"
          ? "Live bids"
          : "Empty offers"}
    </span>
  )
}
