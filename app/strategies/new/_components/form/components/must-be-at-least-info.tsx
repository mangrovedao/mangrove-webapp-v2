type Props = {
  min: number
  onMinClicked: (min: string) => void
}

export function MustBeAtLeastInfo({ onMinClicked, min }: Props) {
  return (
    <div className="flex items-center mt-1">
      <span className="text-xs space-x-1">
        <span className="text-cloud-300">Must be at least {min}</span>
        <button
          className="text-xs underline !cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => onMinClicked?.(min.toString())}
        >
          MIN
        </button>
      </span>
    </div>
  )
}
