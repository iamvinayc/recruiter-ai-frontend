import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { ROUTES } from "@/routes/routes";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useEffect, useState } from "react";
import { useTypedSearchParams } from "react-router-typesafe-routes/dom";
dayjs.extend(customParseFormat);

export function CandidateReportListFilter({
  onSearch,
  isLoading,
  onClick,
}: {
  onSearch: VoidFunction;
  isLoading?: boolean;
  onClick?: () => void;
}) {
  const [{ from_date, to_date }, setTypedParams] = useTypedSearchParams(
    ROUTES.ADMIN.CANDIDATE_REPORT,
  );
  const [selectedFromDate, setSelectedFromDate] = useState("");
  const [selectedToDate, setSelectedToDate] = useState("");
  useState<ListItem | null>(null);

  useEffect(() => {
    setSelectedFromDate(from_date);
  }, [from_date]);
  useEffect(() => {
    setSelectedToDate(to_date);
  }, [to_date]);

  const isNotDirty = from_date == selectedFromDate && to_date == selectedToDate;
  const isDirty = !isNotDirty;
  const isAllEmpty =
    [from_date, to_date, selectedFromDate, selectedToDate].filter(Boolean)
      .length == 0;

  return (
    <div className="mb-2">
      <div className="dark:border-strokedark rounded-sm border border-sky-300 bg-white p-4 shadow-default">
        <h2 className="text-xl font-bold uppercase text-stone-700">Filter</h2>
        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <Input
            label="From Date"
            type="date"
            value={
              selectedFromDate
                ? dayjs(selectedFromDate, "DD-MM-YYYY").format("YYYY-MM-DD")
                : selectedFromDate
            }
            onChange={(e) => {
              setSelectedFromDate(
                dayjs(e.currentTarget.value).format("DD-MM-YYYY"),
              );
            }}
          />
          <Input
            label="To Date"
            type="date"
            value={
              selectedToDate
                ? dayjs(selectedToDate, "DD-MM-YYYY").format("YYYY-MM-DD")
                : selectedToDate
            }
            min={
              selectedFromDate
                ? dayjs(selectedFromDate, "DD-MM-YYYY").format("YYYY-MM-DD")
                : selectedFromDate
            }
            onChange={(e) => {
              setSelectedToDate(
                dayjs(e.currentTarget.value).format("DD-MM-YYYY"),
              );
            }}
          />
          <div className="mb-1 flex items-end">
            <Button
              className="h-8 rounded-lg text-center"
              isLoading={isLoading}
              onClick={onClick}
            >
              Download
            </Button>
          </div>
        </div>

        <div className="mt-6 grid w-full grid-cols-2 justify-end space-x-4 md:flex">
          {isAllEmpty ? null : (
            <button
              onClick={() => {
                setTypedParams({
                  from_date: "",
                  to_date: "",
                });
              }}
              className="rounded-none bg-red-600 px-14 py-2 font-medium text-white outline-none hover:opacity-90 focus:ring active:scale-95"
            >
              Reset
            </button>
          )}
          {isDirty ? (
            <>
              <button
                onClick={() => {
                  if (isNotDirty) {
                    onSearch();
                  }
                  setTypedParams({
                    from_date: selectedFromDate,
                    to_date: selectedToDate,
                  });
                }}
                className="rounded-none bg-blue-600 px-8 py-2 font-medium text-white outline-none hover:opacity-90 focus:ring active:scale-95"
              >
                Apply Filter
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

interface ListItem {
  value: string;
  label: string;
}
