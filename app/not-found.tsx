import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex justify-center items-center w-full h-[calc(100vh-var(--bar-height))]">
      <div className="">
        <h2 className="text-4xl">404 Page Not Found</h2>
        <p className="text-gray-scale-300">
          The page you requested does not exist
        </p>
        <div className="mt-4">
          <Link
            href="/"
            className="underline hover:opacity-80 transition-opacity"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  )
}
