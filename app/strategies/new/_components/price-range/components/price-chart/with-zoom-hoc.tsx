/* eslint-disable @typescript-eslint/no-explicit-any */
import { Zoom } from "@visx/zoom"
import { type ComponentType } from "react"

interface WithZoomProps {
  width: number
  height: number
}

const withZoom = <P extends object>(Component: ComponentType<P>) => {
  const WithZoom: React.FC<P & WithZoomProps> = (props) => {
    return (
      <Zoom
        width={props.width}
        height={props.height}
        scaleXMin={0.1}
        scaleXMax={40}
      >
        {(zoom) => <Component {...props} zoom={zoom} />}
      </Zoom>
    )
  }

  WithZoom.displayName = `WithZoom(${getDisplayName(Component)})`

  return WithZoom
}

function getDisplayName(Component: ComponentType<any>): string {
  return Component.displayName ?? Component.name ?? "Component"
}

export default withZoom
