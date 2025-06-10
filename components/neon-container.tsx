export default function NeonContainer({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className="w-full rounded-sm border border-solid p-3 relative overflow-hidden"
      style={{ boxShadow: "0 0 15px 0 rgba(240, 171, 171, 0.1)" }}
    >
      <div className="absolute inset-[3px] bg-[#000000]   rounded-sm -z-10"></div>

      <div className={className}>{children}</div>
    </div>
  )
}
