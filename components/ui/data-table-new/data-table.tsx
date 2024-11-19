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
import { LoadingBody } from "./loading-body"
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
}: DataTableProps<TData>) {
  const rows = table.getRowModel().rows
  const tableName = Object.keys(table._getAllFlatColumnsById()).join("-")
  const leafColumns = table
    .getAllLeafColumns()
    .filter((column) => column.getIsVisible())

  return (
    <>
      <Table>
        <TableHeader className={`sticky z-40 text-xs ${rows.length}`}>
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
                      className="text-text-tertiary text-xs"
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
          {isLoading ? (
            <LoadingBody cells={leafColumns.length} rows={skeletonRows} />
          ) : rows?.length ? (
            rows.map((row) => (
              <>
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
                        "px-0 py-2 group/cell whitespace-nowrap !text-red-500",
                        cellClasses,
                      )}
                    >
                      <div
                        className={cn(
                          " py-2 group-first/cell:rounded-l-lg group-last/cell:rounded-r-lg",
                          {
                            [rowHighlightedClasses?.inner ??
                            "!bg-primary-dark-green"]: isRowHighlighted?.(
                              row.original,
                            ),
                          },
                        )}
                      >
                        <div className="px-4 h-6 flex items-center ">
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
              </>
            ))
          ) : (
            <TableRow
              key={`${tableName}-bodyrow-${Math.random()}`}
              className="hover:bg-transparent"
            >
              <TableCell
                colSpan={leafColumns.length}
                className="h-19 text-center bg-gradient-to-t from-bg-primary to-bg-secondary rounded-xl text-text-tertiary"
              >
                {isError
                  ? "Due to excessive demand, we are unable to return your data. Please try again later."
                  : emptyArrayMessage ?? "No results."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Pagination {...pagination} />
    </>
  )
}
