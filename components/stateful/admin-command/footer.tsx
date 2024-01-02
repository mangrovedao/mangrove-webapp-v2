import type { PropsWithChildren, ReactNode } from "react"

export function Footer({ children }: PropsWithChildren) {
  const childrenArray = Array.isArray(children) ? children : [children]

  const childrenWithSeparator = childrenArray.reduce<ReactNode[]>(
    (acc, child, index) => {
      if (index !== 0) {
        acc.push(<hr key={`hr-${index}`} className="h-3 w-px bg-popover" />)
      }
      acc.push(child)
      return acc
    },
    [],
  )

  return (
    <div className="border-t flex justify-end text-xs text-gray-600">
      <div className="p-3 gap-1 flex items-center">{childrenWithSeparator}</div>
    </div>
  )
}
