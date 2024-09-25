import dynamic from "next/dynamic"

const Swap = dynamic(() => import("./swap"), { ssr: false })

export default function Page() {
  return (
    <main className="flex flex-col min-h-screen max-w-xl mx-auto">
      <Swap />
    </main>
  )
}
