import { ClientOnly } from "@/components/client-only"
import { Navbar } from "@/components/navbar"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm flex-col">
        <Navbar />
        <ClientOnly>
          <h1>Webapp</h1>
        </ClientOnly>
      </div>
    </main>
  )
}
