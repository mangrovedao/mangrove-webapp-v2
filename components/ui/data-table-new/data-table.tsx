"use client"
import React from "react"

import { flexRender, Row, type Table as TableType } from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table-new"
import { cn } from "@/utils"
import { ScrollArea, ScrollBar } from "../scroll-area"
import { Pagination, type PaginationProps } from "./pagination"

interface DataTableProps<TData> {
  table: TableType<TData>
  isError?: boolean
  emptyArrayMessage?: string
  isLoading?: boolean
  pagination?: PaginationProps
  isRowHighlighted?: (row: TData) => boolean
  onRowHover?: (row: TData | null) => void
  onRowClick?: (row: TData | null) => void
  renderExtraRow?: (row: Row<TData>) => React.ReactNode
  tableRowClasses?: string
  skeletonRows?: number
  cellClasses?: string
  rowHighlightedClasses?: { row?: string; inner?: string }
  containerClassName?: string
}

export function DataTable<TData>({
  table,
  isError,
  emptyArrayMessage,
  isLoading,
  pagination,
  isRowHighlighted = () => false,
  onRowHover = () => {},
  onRowClick,
  renderExtraRow = () => null,
  tableRowClasses,
  skeletonRows = 1,
  cellClasses,
  rowHighlightedClasses,
  containerClassName,
}: DataTableProps<TData>) {
  const rows = table.getRowModel().rows
  const tableName = Object.keys(table._getAllFlatColumnsById()).join("-")
  const leafColumns = table
    .getAllLeafColumns()
    .filter((column) => column.getIsVisible())

  return (
    <>
      <div className={cn("w-full overflow-auto", containerClassName)}>
        <ScrollArea className="h-full">
          <Table className="min-w-full table-auto">
            <TableHeader className={`sticky z-40 text-xs h-2 ${rows.length}`}>
              {rows.length > 0 &&
                table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={`${tableName}-head-row-${headerGroup.id}`}
                    className="hover:bg-transparent"
                  >
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          key={`${tableName}-head-${header.id}`}
                          className="text-text-primary text-xs whitespace-nowrap"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
            </TableHeader>
            <TableBody>
              {rows?.length ? (
                rows.map((row) => (
                  <React.Fragment key={`${tableName}-fragment-${row.id}`}>
                    <TableRow
                      key={`${tableName}-body-row-${row.id}`}
                      data-state={row.getIsSelected() && "selected"}
                      className={cn(
                        "hover:text-white transition-colors group/row ",
                        {
                          "cursor-pointer": !!onRowClick,
                          [rowHighlightedClasses?.row ??
                          "text-white hover:opacity-80 transition-all"]:
                            isRowHighlighted?.(row.original),
                        },
                        tableRowClasses,
                      )}
                      onClick={(e) => {
                        onRowClick?.(row.original)
                      }}
                      onMouseEnter={() => onRowHover?.(row.original)}
                      onMouseLeave={() => onRowHover?.(null)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={`${tableName}-body-cell-${cell.id}`}
                          className={cn(
                            "px-0 py-1 group/cell whitespace-nowrap !text-red-500",
                            cellClasses,
                          )}
                        >
                          <div
                            className={cn(
                              " py-1 group-first/cell:rounded-l-sm group-last/cell:rounded-r-sm",
                              {
                                [rowHighlightedClasses?.inner ??
                                "!bg-primary-dark-green"]: isRowHighlighted?.(
                                  row.original,
                                ),
                              },
                            )}
                          >
                            <div className="px-2 h-6 flex items-center ">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </div>
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                    {renderExtraRow?.(row)}
                  </React.Fragment>
                ))
              ) : (
                <TableRow
                  key={`${tableName}-bodyrow-empty`}
                  className="hover:bg-transparent"
                >
                  <TableCell
                    colSpan={leafColumns.length}
                    className="h-19 text-center rounded-sm text-text-tertiary"
                  >
                    {isError
                      ? "Due to excessive demand, we are unable to return your data. Please try again later."
                      : emptyArrayMessage ?? "No results."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
      <Pagination {...pagination} />
    </>
  )
}
