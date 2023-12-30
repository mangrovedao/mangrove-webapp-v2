import * as Ark from "@ark-ui/react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export type PaginationProps = typeof Ark.Pagination.Root.defaultProps

const buttonClasses =
  "text-sm hover:text-white transition-colors disabled:text-gray-scale-400 aria-[current=page]:text-white aria-[current=page]:border aria-[current=page]:border-green-caribbean rounded-full h-8 w-8 flex justify-center items-center"
const ellipsisClasses =
  "h-8 w-8 flex justify-center items-center cursor-default"

export function Pagination(props: PaginationProps) {
  if (!props?.count) return null
  return (
    <div className="flex w-full justify-center my-2">
      <Ark.Pagination.Root
        count={props?.count ?? 0}
        {...props}
        className="justify-between text-gray-scale-300 bg-primary-solid-black rounded-full text-sm font-medium p-3 inline-flex gap-4"
      >
        {({ pages }) => (
          <>
            <Ark.Pagination.PrevTrigger className={buttonClasses}>
              <ChevronLeft />
            </Ark.Pagination.PrevTrigger>
            {pages.map((page, index) =>
              page.type === "page" ? (
                <Ark.Pagination.Item
                  key={index}
                  {...page}
                  className={buttonClasses}
                >
                  {page.value}
                </Ark.Pagination.Item>
              ) : (
                <Ark.Pagination.Ellipsis
                  key={index}
                  index={index}
                  className={ellipsisClasses}
                >
                  &#8230;
                </Ark.Pagination.Ellipsis>
              ),
            )}
            <Ark.Pagination.NextTrigger className={buttonClasses}>
              <ChevronRight />
            </Ark.Pagination.NextTrigger>
          </>
        )}
      </Ark.Pagination.Root>
    </div>
  )
}
