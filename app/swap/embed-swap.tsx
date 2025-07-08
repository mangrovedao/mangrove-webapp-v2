"use client"

export default function EmbedSwap() {
  return (
    <iframe
      src="https://kame.ag/swap-frame"
      className="max-h-screen w-full z-10"
      style={{
        height: "calc(100vh)",
        zIndex: 1,
      }}
    />
  )
}
