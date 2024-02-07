import { Caption } from "@/components/typography/caption"

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <Caption
      variant={"caption1"}
      className="border border-green-bangladesh px-2 pt-1 pb-0.5 rounded-full inline-block bg-primary-night-woods text-gray-scale-100"
    >
      {children}
    </Caption>
  )
}
