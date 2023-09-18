import Image from "next/image"
import { useState } from "react"

type Props = React.ComponentProps<typeof Image>

export const ImageWithHideOnError = (props: Props) => {
  const [hideImage, setHideImage] = useState(false)

  return (
    !hideImage && (
      <Image
        {...props}
        onError={() => {
          setHideImage(true)
        }}
        alt={props.alt}
      />
    )
  )
}
