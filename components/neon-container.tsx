export default function NeonContainer({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className="w-full rounded-2xl border border-solid p-5 relative overflow-hidden"
      style={{
        boxShadow: "0px 0px 24px rgba(0, 203, 111, 0.4)",
      }}
    >
      <div
        className="absolute inset-[1px] rounded-2xl -z-20"
        style={{
          background: "linear-gradient(30deg, #7BAFB9 0%, #00CB6F 100%)",
        }}
      ></div>
      <div className="absolute inset-[3px] bg-[#0B1819] rounded-2xl -z-10"></div>

      <div className={className}>{children}</div>
    </div>
  )
}
