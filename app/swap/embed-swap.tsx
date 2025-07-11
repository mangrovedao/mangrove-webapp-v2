"use client"

export default function EmbedSwap() {
  // TODO: change colours once the dev has updated the widget
  // 'https://kame.ag/widget?hideLogo=1&colorPalette=[{"orange":"f7e8e1"},{"white": "1A1A1A"},{"rgb_white":"00000000"},{"misty_rose":"00000000"},{"orange2":"00000000"},{"white1":"00000000"}]'
  return (
    <iframe
      src={
        'https://kame.ag/swap-frame'
      }
      className="max-h-screen w-full z-10"
      style={{
        height: "calc(100vh)",
        zIndex: 1,
      }}
    />
  )
}
