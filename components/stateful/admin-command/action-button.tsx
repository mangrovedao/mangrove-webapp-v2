import { Key } from "./key"

type ActionButtonProps = {
  keys?: string[]
} & React.ComponentProps<"button">

export function ActionButton({ children, keys, ...props }: ActionButtonProps) {
  return (
    <button
      {...props}
      className="space-x-2 text-gray-scale-300 hover:bg-gray-scale-600 px-2 py-1 rounded active:bg-gray-scale-700 transition-colors"
    >
      <span>{children}</span>
      <span className="space-x-1">
        {keys?.map((k) => <Key key={k}>{k}</Key>)}
      </span>
    </button>
  )
}
