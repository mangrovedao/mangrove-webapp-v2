"use client"

export default function EmbedSwap() {
  return (
    <iframe
      src="https://kame.ag/swap-frame"
      className="max-h-screen w-full"
      style={{ zIndex: 1, height: "calc(100vh)" }}
    />
  )
}
