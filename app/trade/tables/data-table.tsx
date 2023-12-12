"use client"

import { flexRender, type Table as TableType } from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData> {
  table: TableType<TData>
  isError?: boolean
}

export function DataTable<TData>({ table, isError }: DataTableProps<TData>) {
  const rows = table.getRowModel().rows
  const leafColumns = table
    .getAllLeafColumns()
    .filter((column) => column.getIsVisible())
  return (
    <Table>
      <TableHeader className="sticky top-[0] bg-background z-40 p-0 text-xs">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id} className="px-2">
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
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
              className="text-gray-scale-300 hover:text-white transition-colors group/row"
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className="px-0 py-2 group/cell whitespace-nowrap"
                >
                  <div className="group-hover/row:bg-gray-scale-700 py-2 group-first/cell:rounded-l-lg group-last/cell:rounded-r-lg">
                    <div className="px-2 h-6 flex items-center">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </div>
                  </div>
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={leafColumns.length}
              className="h-24 text-center text-muted-foreground"
            >
              {isError
                ? "Due to excessive demand, we are unable to return your data. Please try again later."
                : "No results."}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
