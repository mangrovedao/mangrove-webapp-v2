import dynamic from "next/dynamic"

const Swap = dynamic(() => import("./swap"), { ssr: false })

export default function Page() {
  return (
    <main className="flex flex-col">
      <iframe
        src="https://symph.ag/embed?bgColor=black&notifications=true"
        className="lg:mx-20 h-[calc(100vh-10rem)] -mt-20"
      ></iframe>
      {/* <Swap /> */}
    </main>
  )
}
