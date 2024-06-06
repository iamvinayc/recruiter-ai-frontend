import { OnboardingStatus, axiosApi, formatOnboardingStatus, OnboardingStatusColorMap } from "@/api/api";
import { ROUTES } from "@/routes/routes";
import { cn } from "@/utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { useTypedSearchParams } from "react-router-typesafe-routes/dom";
import { InfinityLoaderComponent } from "./common/InfinityLoaderComponent";
import { ReportListFilter } from "./common/ReportListFilter";
import { Table } from "./common/Table";
import { TableLoader } from "./common/TableLoader";

const columnHelper = createColumnHelper<ReportListItem>();

export function ReportListPage() {
  const [{ from_date, status, to_date, employer }] = useTypedSearchParams(
    ROUTES.ADMIN.LIST_REPORT,
  );

  const reportListingQuery = useInfiniteQuery({
    queryKey: ["reportListingQuery", from_date, status, to_date, employer],
    queryFn: async ({ pageParam }) =>
      axiosApi({
        url: (pageParam || "report/onboarding/") as "report/onboarding/",
        method: "GET",
        params: {
          from_date,
          status,
          to_date,
          employer,
        },
      }).then((e) => e.data),
    getNextPageParam() {
      return undefined;
    },
    initialPageParam: "",
  });
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "SLNo",
        header: "No",
        cell: (info) => info.row.index + 1,
      }),
      columnHelper.accessor("candidate_name", {
        header: "Candidate",
        cell: (info) => info.getValue(),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("job_title", {
        header: "Position",
        cell: (info) => (
          <div className="max-w-[200px] truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
        footer: (info) => info.column.id,
      }),

      columnHelper.accessor("employer_name", {
        header: "Company",
        cell: (info) => info.getValue(),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          return (
            <div
              className="flex items-center space-x-3 truncate"
              title={formatOnboardingStatus(info.getValue())}
            >
              <span
                className={cn(
                  "relative grid select-none items-center whitespace-nowrap rounded-none px-3 py-1.5 font-sans text-xs font-bold text-white",
                  info.getValue() === OnboardingStatus.CANCELLED ||
                    info.getValue() === OnboardingStatus.REJECTED
                    ? "bg-red-500"
                    : info.getValue() === OnboardingStatus.EMPLOYER_SELECTED
                      ? "bg-green-500"
                      : "bg-blue-500",
                )}
                style={{
                  background:
                    OnboardingStatusColorMap[
                    info.getValue() as keyof typeof OnboardingStatusColorMap
                    ] ?? "rgb(59 130 246);",
                }}
              >
                {formatOnboardingStatus(info.getValue())}
              </span>
            </div>
          );
        },
      }),
    ],
    [],
  );

  const reportList = useMemo(
    () => reportListingQuery.data?.pages?.map((e) => e.data)?.flat() || [],
    [reportListingQuery.data],
  );

  const table = useReactTable({
    columns: columns,
    data: reportList,
    getCoreRowModel: getCoreRowModel(),
    enableFilters: false,
  });
  return (
    <main>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            List Reports
          </h2>
        </div>
        <ReportListFilter onSearch={() => reportListingQuery.refetch()} />
        <div className="flex flex-col gap-5 md:gap-7 2xl:gap-10">
          <div
            className={cn(
              "dark:bg-boxdark dark:border-strokedark relative overflow-x-auto rounded-sm border border-stroke bg-white shadow-default",
              reportListingQuery.isLoading && "min-h-[20rem]",
            )}
          >
            <InfinityLoaderComponent
              dataLength={reportList.length}
              hasMore={reportListingQuery.hasNextPage}
              next={() => {
                reportListingQuery.fetchNextPage();
              }}
            >
              <Table
                table={table}
                loader={
                  <TableLoader
                    colSpan={columns.length}
                    dataList={reportList}
                    isLoading={reportListingQuery.isLoading}
                    isUpdateLoading={
                      reportListingQuery.isLoading ||
                      reportListingQuery.isRefetching
                    }
                  />
                }
              />
            </InfinityLoaderComponent>
          </div>
        </div>
      </div>
    </main>
  );
}

interface ReportListItem {
  candidate_name: string;
  job_title: string;
  employer_name: string;
  status: string;
}
