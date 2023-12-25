import { cn } from "@/utils"

interface CursorProps {
  xPosition: number
  height: number
  color?: "red" | "neutral" | "green"
  type: "left" | "right"
}

export default function Cursor({
  xPosition,
  height,
  color,
  type,
}: CursorProps) {
  return (
    <g
      width="25"
      height="24"
      fill="none"
      transform={`translate(${xPosition}, 0)`}
      className={cn("", {
        "text-green-caribbean": color === "green",
        "text-cherry-100": color === "red",
        "text-neutral": color === "neutral",
      })}
    >
      <line x1="0" y1="0" x2="0" y2={height} stroke="currentColor" />
      <g
        className={cn("-translate-x-3 translate-y-[calc(50%-24px)]", {
          "": type === "left",
          "": type === "right",
        })}
      >
        {type === "left" ? (
          <>
            <rect
              width="24"
              height="24"
              x="24.745"
              fill="currentColor"
              rx="8"
              transform={"rotate(90 24.745 0)"}
            />
            <path
              stroke="#010D0D"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M14.745 7l-5 5 5 5"
            />
          </>
        ) : (
          <>
            <rect
              width="24"
              height="24"
              x="0.745"
              y="24"
              fill="currentColor"
              rx="8"
              transform="rotate(-90 .745 24)"
            />
            <path
              stroke="#010D0D"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M10.745 17l5-5-5-5"
            ></path>
          </>
        )}
      </g>
    </g>
  )
}
