import { flexRender, Table } from "@tanstack/react-table";

import { cn } from "@/utils";

export function Table<T>({
  table,
  loader,
}: {
  table: Table<T>;
  loader: JSX.Element;
}) {
  return (
    <table className={cn("min-w-full   table-fixed overflow-scroll")}>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                className={cn(
                  "border-b border-slate-200 p-4 pb-3 pl-8  text-left font-medium text-slate-600 dark:border-slate-600 dark:text-slate-200",
                )}
                key={header.id}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody className="relative">
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td
                className="border-b border-slate-200 p-4 pl-8 text-slate-500 dark:border-slate-600 dark:text-slate-400"
                key={cell.id}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
        {loader}
      </tbody>
    </table>
  );
}
