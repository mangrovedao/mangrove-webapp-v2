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
} from "@/components/ui/table"
import { cn } from "@/utils"
import { AnimatePresence, motion } from "framer-motion"
import { LoadingBody } from "./loading-body"
import { Pagination, type PaginationProps } from "./pagination"

interface DataTableProps<TData> {
  table: TableType<TData>
  isError?: boolean
  isLoading?: boolean
  pagination?: PaginationProps
  isRowHighlighted?: (row: TData) => boolean
  onRowHover?: (row: TData | null) => void
  onRowClick?: (row: TData | null) => void
  renderExtraRow?: (row: Row<TData>) => React.ReactNode
  tableRowClasses?: string
  skeletonRows?: number
  cellClasses?: string
  emptyArrayMessage?: string
  // Animation props
  animated?: boolean
  animationVariant?: "fade" | "slide" | "scale" | "stagger"
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
  skeletonRows = 2,
  cellClasses,
  animated = false,
  animationVariant = "stagger",
}: DataTableProps<TData>) {
  const rows = table.getRowModel().rows
  const tableName = Object.keys(table._getAllFlatColumnsById()).join("-")
  const leafColumns = table
    .getAllLeafColumns()
    .filter((column) => column.getIsVisible())

  // Animation variants
  const variants = {
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    slide: {
      hidden: { x: -20, opacity: 0 },
      visible: { x: 0, opacity: 1 },
    },
    scale: {
      hidden: { scale: 0.9, opacity: 0 },
      visible: { scale: 1, opacity: 1 },
    },
    stagger: {
      hidden: { y: 10, opacity: 0 },
      visible: { y: 0, opacity: 1 },
    },
  }

  // Render a regular row
  const renderRegularRow = (row: Row<TData>) => (
    <React.Fragment key={`${tableName}-body-row-${row.id}`}>
      <TableRow
        data-state={row.getIsSelected() && "selected"}
        className={cn(
          "text-muted-foreground hover:text-white transition-colors group/row",
          {
            "cursor-pointer": !!onRowClick,
            "text-white hover:opacity-80 transition-all": isRowHighlighted?.(
              row.original,
            ),
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
              "px-0 py-2 group/cell whitespace-nowrap !text-sm",
              cellClasses,
            )}
          >
            <div
              className={cn(
                "group-hover/row:bg-gray-scale-700 py-2 group-first/cell:rounded-l-lg group-last/cell:rounded-r-lg",
                {
                  "!bg-primary-dark-green": isRowHighlighted?.(row.original),
                },
              )}
            >
              <div className="px-2 h-6 flex items-center">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            </div>
          </TableCell>
        ))}
      </TableRow>
      {renderExtraRow?.(row)}
    </React.Fragment>
  )

  // Render an animated row
  const renderAnimatedRow = (row: Row<TData>) => (
    <React.Fragment key={`${tableName}-body-row-${row.id}`}>
      <motion.tr
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={variants[animationVariant]}
        transition={{
          duration: 0.3,
          delay: animationVariant === "stagger" ? Number(row.id) * 0.05 : 0,
        }}
        className={cn(
          "text-muted-foreground hover:text-white transition-colors group/row",
          {
            "cursor-pointer": !!onRowClick,
            "text-white hover:opacity-80 transition-all": isRowHighlighted?.(
              row.original,
            ),
          },
          tableRowClasses,
        )}
        onClick={() => onRowClick?.(row.original)}
        onMouseEnter={() => onRowHover?.(row.original)}
        onMouseLeave={() => onRowHover?.(null)}
      >
        {row.getVisibleCells().map((cell) => (
          <motion.td
            key={`${tableName}-body-cell-${cell.id}`}
            className={cn(
              "px-0 py-2 group/cell whitespace-nowrap !text-sm",
              cellClasses,
            )}
          >
            <div
              className={cn(
                "group-hover/row:bg-gray-scale-700 py-2 group-first/cell:rounded-l-lg group-last/cell:rounded-r-lg",
                {
                  "!bg-primary-dark-green": isRowHighlighted?.(row.original),
                },
              )}
            >
              <div className="px-2 h-6 flex items-center">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            </div>
          </motion.td>
        ))}
      </motion.tr>
      {renderExtraRow?.(row)}
    </React.Fragment>
  )

  return (
    <>
      <Table>
        <TableHeader
          className={`sticky top-[0] border-b border-bg-secondary z-40 p-0 text-xs backdrop-blur-sm ${rows.length}`}
        >
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={`${tableName}-head-row-${headerGroup.id}`}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={`${tableName}-head-${header.id}`}
                    className="px-2"
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
            animated ? (
              <AnimatePresence>
                {rows.map((row) => renderAnimatedRow(row))}
              </AnimatePresence>
            ) : (
              rows.map((row) => renderRegularRow(row))
            )
          ) : (
            <TableRow key={`${tableName}-bodyrow-${Math.random()}`}>
              <TableCell
                colSpan={leafColumns.length}
                className="h-24 text-center text-muted-foreground"
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
