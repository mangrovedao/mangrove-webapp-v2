type Props = {
  min: number
  max: number
  onMinClicked: (min: string) => void
}

export function MustBeBetweenInfo({ onMinClicked, min, max }: Props) {
  return (
    <div className="flex items-center mt-1">
      <span className="text-xs space-x-1">
        <span className="text-cloud-300">
          Must be between {min} and {max}
        </span>
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
