import React from "react"

export default function withClientOnly<T extends object>(
  Component: React.ComponentType<T>,
) {
  return function WithClientOnly(props: T) {
    const [isClient, setIsClient] = React.useState(false)

    React.useEffect(() => {
      setIsClient(true)
    }, [])

    if (!isClient) {
      return null
    }

    return <Component {...props} />
  }
}
