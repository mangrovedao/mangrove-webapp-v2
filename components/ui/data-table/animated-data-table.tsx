"use client"
import { cn } from "@/utils"
import { Row, type Table as TableType } from "@tanstack/react-table"
import { motion } from "framer-motion"
import React from "react"
import { DataTable } from "./data-table"

// Extend the DataTableProps to include animation options
interface AnimatedDataTableProps<TData> {
  table: TableType<TData>
  isError?: boolean
  isLoading?: boolean
  pagination?: {
    onPageChange: (pageDetails: PageDetails) => void
    page: number
    pageSize: number
    count?: number
  }
  isRowHighlighted?: (row: TData) => boolean
  onRowHover?: (row: TData | null) => void
  onRowClick?: (row: TData | null) => void
  renderExtraRow?: (row: Row<TData>) => React.ReactNode
  tableRowClasses?: string
  skeletonRows?: number
  cellClasses?: string
  emptyArrayMessage?: string
  // Animation options
  animationVariant?: "fade" | "slide" | "scale" | "stagger"
  animationDuration?: number
}

export function AnimatedDataTable<TData>({
  table,
  isError,
  isLoading,
  pagination,
  isRowHighlighted,
  onRowHover,
  onRowClick,
  renderExtraRow,
  tableRowClasses,
  skeletonRows,
  cellClasses,
  emptyArrayMessage,
  animationVariant = "stagger",
  animationDuration = 0.3,
}: AnimatedDataTableProps<TData>) {
  // Custom row renderer that wraps each row with motion components
  const renderAnimatedRow = (row: Row<TData>) => {
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

    return (
      <motion.tr
        key={`animated-row-${row.id}`}
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={variants[animationVariant]}
        transition={{
          duration: animationDuration,
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
            key={`animated-cell-${cell.id}`}
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
                {cell.column.columnDef.cell &&
                  (typeof cell.column.columnDef.cell === "function"
                    ? cell.column.columnDef.cell(cell.getContext())
                    : cell.column.columnDef.cell)}
              </div>
            </div>
          </motion.td>
        ))}
      </motion.tr>
    )
  }

  // Use the original DataTable but with our custom row renderer
  return (
    <DataTable
      table={table}
      isError={isError}
      isLoading={isLoading}
      pagination={pagination}
      isRowHighlighted={isRowHighlighted}
      onRowHover={onRowHover}
      onRowClick={onRowClick}
      renderExtraRow={renderExtraRow}
      tableRowClasses={tableRowClasses}
      skeletonRows={skeletonRows}
      cellClasses={cellClasses}
      emptyArrayMessage={emptyArrayMessage}
    />
  )
}
