import dynamic from "next/dynamic"

const Swap = dynamic(() => import("./swap"), { ssr: false })

export default function Page() {
  return (
    <main className="flex flex-col max-w-xl mx-auto">
      <iframe
    src="https://symph.ag/embed?bgColor=black&notifications=true"
    className="h-[calc(100vh-8rem)] w-full" // Reduced height to account for navbar
    style={{ 
      maxHeight: 'calc(100vh - 100px)', // Adjust 100px to navbar + padding
      zIndex: 1 
    }}
  />
      {/* <Swap /> */}
    </main>
  )
}
