"use client"

export default function EmbedSwap() {
  return (
    <div className="flex flex-col w-auto mt-[5rem]">

    <iframe
      src="https://kame.ag/swap-frame"
      className="max-h-screen w-full z-10"
      style={{
        height: "calc(100vh)",
        zIndex: 1,
      }}
    />
    </div>
  )
}
