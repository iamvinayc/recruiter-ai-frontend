import { flexRender, Table as ITable } from "@tanstack/react-table";

import { cn } from "@/utils";

export function Table<T>({
  table,
  loader,
  flat,
}: {
  table: ITable<T>;
  loader: JSX.Element;
  flat?: boolean;
}) {
  return (
    <table className={cn("min-w-full   table-fixed overflow-scroll")}>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                className={cn(
                  "border-b border-slate-200  text-left font-medium text-slate-600 dark:border-slate-600 dark:text-slate-200",
                  flat ? "p-2 pl-3 " : "p-4 pb-3 pl-8 ",
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
          <tr key={`tr-${row.id}`}>
            {row.getVisibleCells().map((cell) => (
              <td
                className={cn(
                  "border-b border-slate-200 text-slate-500 dark:border-slate-600 dark:text-slate-400",
                  flat ? "p-2 pl-3 " : "p-4 pl-8 ",
                )}
                key={`td-${cell.id}`}
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
