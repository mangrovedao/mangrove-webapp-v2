import Image from "next/image"
import { useState } from "react"

type Props = React.ComponentProps<typeof Image> & {
  placeholderImage?: string
}

export const ImageWithHideOnError = (props: Props) => {
  const [hideImage, setHideImage] = useState(false)

  return !hideImage ? (
    <Image
      {...props}
      onError={() => {
        setHideImage(true)
      }}
      alt={props.alt}
    />
  ) : (
    <img
      className="object-contain"
      width={props.width}
      height={props.height}
      src={props.placeholderImage || "https://chainlist.org/unknown-logo.png"}
      alt={props.alt}
    />
  )
}
