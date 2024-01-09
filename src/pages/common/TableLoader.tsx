import { SpinnerIcon } from "@/components/common/SvgIcons";
import { cn } from "@/utils";

export function TableLoader<T>({
  dataList,
  isLoading,
  isUpdateLoading ,
  colSpan = 6,
}: {
  dataList: T[];
  isLoading: boolean;
  isUpdateLoading: boolean;
  colSpan?: number;
}) {
   return (
    <tr className={cn((dataList.length > 0&&!isUpdateLoading) && "hidden")}>
      <td colSpan={colSpan}>
        <div
          className={cn(
            "absolute left-0 top-0 h-full w-full items-center justify-center bg-white bg-opacity-50",

            isUpdateLoading ? "flex" : "hidden",
          )}
        >
          <SpinnerIcon className="h-6 w-6 text-black" />
        </div>
        {!isLoading && dataList.length === 0 && (
          <div
            className={cn(
              "h-[20rem]",
              "flex w-full items-center justify-center",
            )}
          >
            No Data
          </div>
        )}
        {isLoading && dataList.length === 0 && (
          <div
            className={cn(
              "h-[20rem]",
              "flex w-full items-center justify-center",
            )}
          >
            Loading ....
          </div>
        )}
      </td>
    </tr>
  );
}
