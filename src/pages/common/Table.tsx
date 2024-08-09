import { Column, flexRender, Table as ITable } from "@tanstack/react-table";

import { DebouncedInput } from "@/components/common/Input";
import { cn } from "@/utils";
import { useState } from "react";

export function Table<T>({
  table,
  loader,
  flat,
  theadClassName,
  tableClassName,
  thClassName,
  tdClassName,
}: {
  table: ITable<T>;
  loader: JSX.Element;
  flat?: boolean;
  theadClassName?: string;
  tableClassName?: string;
  thClassName?: string;
  tdClassName?: string;
}) {
  return (
    <table className={cn(`min-w-full table-fixed overflow-scroll ${tableClassName}`)}>
      <thead className={`${theadClassName} bg-[#55BCE7]`}>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                className={cn(
                  `border-b border-slate-200  text-left font-medium text-slate-800 dark:border-slate-600 dark:text-slate-200`,
                  flat ? "p-2 pl-3 " : "p-4 pb-3 pl-8 ",
                  thClassName ? `${thClassName}` : "",
                )}
                key={header.id}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                {header.column.getCanFilter() ? (
                  <Filter column={header.column} table={table} />
                ) : null}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody className="relative">
        {table.getRowModel().rows.map((row) => (
          <tr key={`tr-${row.id}`} className="relative">
            {row.getVisibleCells().map((cell) => (
              <td
                className={cn(
                  "border-b border-slate-200 text-slate-500 dark:border-slate-600 dark:text-slate-400",
                  flat ? "p-2 pl-3 " : "p-4 pl-8 ",
                  tdClassName ? `${tdClassName}` : "",
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

//#region filter

const Filter = <T,>({
  column,
}: {
  column: Column<T, unknown>;
  table: ITable<T>;
}) => {
  const { setFilterValue, id } = column;
  const [value, setValue] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  if (id == "is_active") {
    return (
      <div className="w-auto text-center">
        <input
          type="checkbox"
          className="mt-2"
          checked={isChecked}
          onChange={(e) => {
            const val = e.currentTarget.checked;
            setIsChecked(val);
            setFilterValue(val);
          }}
        />
      </div>
    );
  }
  const headerText = column?.columnDef?.header;
  return (
    <div>
      <DebouncedInput
        className="mt-2 border border-slate-200 px-2 py-1 text-xs shadow-sm"
        type="text"
        placeholder={typeof headerText === "string" ? headerText : id}
        value={value}
        onChange={(val) => {
          setValue("" + val);
          setFilterValue("" + val);
        }}
      />
    </div>
  );
};
//#endregion filter
