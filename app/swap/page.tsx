import dynamic from "next/dynamic"

const Swap = dynamic(() => import("./swap"), { ssr: false })

export default function Page() {
  return (
    <main className="flex flex-col max-w-xl mx-auto">
      <iframe
        src="https://symph.ag/embed?bgColor=black&notifications=true"
        className="h-[calc(100vh-10rem)] -mt-10"
      ></iframe>
      {/* <Swap /> */}
    </main>
  )
}
