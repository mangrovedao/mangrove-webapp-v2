import * as Ark from "@ark-ui/react"

export type PaginationProps = typeof Ark.Pagination.Root.defaultProps

const buttonClasses =
  "px-2 py-4 text-sm hover:text-white transition-colors disabled:text-gray-scale-400 aria-[current=page]:text-white"

// TODO: implement count once ready on the indexer
export function Pagination(props: PaginationProps) {
  return (
    <Ark.Pagination.Root
      count={100}
      pageSize={10}
      siblingCount={0}
      {...props}
      className="w-full flex justify-between text-gray-scale-300 mb-2"
    >
      {({ pages }) => (
        <>
          <Ark.Pagination.PrevTrigger className={buttonClasses}>
            Previous
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
                className={buttonClasses}
              >
                &#8230;
              </Ark.Pagination.Ellipsis>
            ),
          )}
          <Ark.Pagination.NextTrigger className={buttonClasses}>
            Next
          </Ark.Pagination.NextTrigger>
        </>
      )}
    </Ark.Pagination.Root>
  )
}
