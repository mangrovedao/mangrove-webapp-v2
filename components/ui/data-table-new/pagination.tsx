import { Text } from "@/components/typography/text"
import * as Ark from "@ark-ui/react"
import { ArrowLeft, ArrowRight } from "lucide-react"

export type PaginationProps = typeof Ark.Pagination.Root.defaultProps

const buttonClasses =
  " text-sm hover:text-white transition-colors disabled:text-gray-scale-400 aria-[current=page]:text-white aria-[current=page]:border aria-[current=page]:bg-bg-active rounded-lg h-8 w-8 flex justify-center items-center"
const ellipsisClasses =
  "h-8 w-8 flex justify-center items-center cursor-default"

export function Pagination(props: PaginationProps) {
  if (!props?.count || (props.pageSize && props?.count < props?.pageSize))
    return null
  return (
    <div className="flex w-full my-2 pl-6 pr-5">
      <Ark.Pagination.Root
        count={props?.count ?? 0}
        {...props}
        className="text-gray-scale-300 text-sm font-medium p-3 inline-flex gap-4 w-full"
      >
        {({ pages }) => (
          <div className="flex justify-between w-full">
            <Ark.Pagination.PrevTrigger className={buttonClasses}>
              <div className="flex gap-2 items-center text-text-tertiary">
                <ArrowLeft />
                <Text variant={"text2"}>Previous</Text>
              </div>
            </Ark.Pagination.PrevTrigger>
            <div className="flex">
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
            </div>
            <Ark.Pagination.NextTrigger className={buttonClasses}>
              <div className="flex gap-2 items-center text-text-tertiary">
                <Text variant={"text2"}>Next</Text>
                <ArrowRight />
              </div>
            </Ark.Pagination.NextTrigger>
          </div>
        )}
      </Ark.Pagination.Root>
    </div>
  )
}
