import { axiosApi } from "@/api/api";
import { ROUTES } from "@/routes/routes";
import { cn } from "@/utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import dayjs from "dayjs";
import { useMemo } from "react";
import { useTypedSearchParams } from "react-router-typesafe-routes/dom";
import { InfinityLoaderComponent } from "./common/InfinityLoaderComponent";
import { Table } from "./common/Table";
import { TableLoader } from "./common/TableLoader";

const columnHelper = createColumnHelper<ReportListItem>();

export function NotificationListPage() {
  const [{ from_date, status, to_date, employer }] = useTypedSearchParams(
    ROUTES.ADMIN.LIST_REPORT,
  );

  const reportListingQuery = useInfiniteQuery({
    queryKey: ["notificationListPage", from_date, status, to_date, employer],
    queryFn: async ({ pageParam }) =>
      // axiosApi({
      //   url: (pageParam || "report/onboarding/") as "report/onboarding/",
      //   method: "GET",
      //   params: {
      //     from_date,
      //     status,
      //     to_date,
      //     employer,
      //   },
      // }).then((e) => e.data),
      axiosApi({
        url: (pageParam || "notification/") as "notification/",
        method: "GET",
        params: {
          page_size: 25,
        },
      }).then((e) => e.data),
    getNextPageParam(lastPage) {
      return lastPage?.next;
    },
    initialPageParam: "",
  });
  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "Id",
        cell: (info) => info.getValue(),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => (
          <div className="max-w-[200px] truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
        footer: (info) => info.column.id,
      }),

      columnHelper.accessor("title", {
        header: "Title",
        cell: (info) => info.getValue(),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("date", {
        header: "Date",
        cell: (info) => {
          return (
            <div className="flex items-center space-x-3 truncate">
              {dayjs(info.getValue()).format("DD MMM YYYY HH:mm A")}
            </div>
          );
        },
      }),
    ],
    [],
  );

  const reportList = useMemo(
    () =>
      reportListingQuery.data?.pages
        ?.map((e) => e.data)
        ?.flat()
        ?.map((e) => ({
          id: e.id,
          name: e.to_name,
          title: e.subject,
          date: e.created_at,
        })) || [],
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
            List Notification
            {reportListingQuery.hasNextPage ? "true" : "false"}
          </h2>
        </div>

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
                console.log(reportListingQuery.hasNextPage);
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
  id: number;
  name: string;
  title: string;
  date: string;
}
