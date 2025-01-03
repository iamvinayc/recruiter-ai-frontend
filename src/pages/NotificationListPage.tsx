import { axiosApi } from "@/api/api";
import { PopupDialog } from "@/components/PopupDialog";
import { SpinnerIcon } from "@/components/common/SvgIcons";
import { useLogin } from "@/hooks/useLogin";
import { queryClient } from "@/routes";
import { ROUTES } from "@/routes/routes";
import { cn, makeUrlWithParams } from "@/utils";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import dayjs from "dayjs";
import { EyeIcon } from "lucide-react";
import { useMemo } from "react";
import { useTypedSearchParams } from "react-router-typesafe-routes/dom";
import { InfinityLoaderComponent } from "./common/InfinityLoaderComponent";
import { Table } from "./common/Table";
import { TableLoader } from "./common/TableLoader";

const columnHelper = createColumnHelper<ReportListItem>();

export function NotificationListPage() {
  const { isRecruiter } = useLogin();
  // const [showDetailsId, setShowDetailsId] = useState("");
  const [{ notification_id: showDetailsId }, setTypeParams] =
    useTypedSearchParams(ROUTES.ADMIN.LIST_NOTIFICATION);
  const setShowDetailsId = (id: string) =>
    setTypeParams({ notification_id: id });

  const reportListingQuery = useInfiniteQuery({
    queryKey: ["notificationListPage"],
    queryFn: async ({ pageParam }) =>
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
  const notificationDetailsQuery = useQuery({
    queryKey: ["notificationDetails", showDetailsId],
    queryFn: async () =>
      axiosApi({
        url: makeUrlWithParams("notification/{{notificationId}}/", {
          notificationId: showDetailsId,
        }),
        method: "GET",
      }).then((e) => e.data),
    enabled: !!showDetailsId,
  });

  const readNotificationsMutation = useMutation({
    mutationKey: ["readNotifications"],
    mutationFn: async ({ id }: { id: number }) => {
      return axiosApi({
        url: "notification/:id/".replace(":id", "" + id) as "notification/:id/",
        method: "PUT",
      })
        .then((e) => e.data)
        .then((e) => {
          if (e.isSuccess) {
            // invalidate and force refetch a query
            queryClient.invalidateQueries({
              queryKey: ["notificationList"],
              refetchType: "all",
            });
          }
        });
    },
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "Id",
        cell: (info) => (
          <div>
            {info.getValue()}
            {info.row.original.hasRead ? null : (
              <div className="absolute left-0 top-0 z-0  h-full w-full bg-graydark bg-opacity-10" />
            )}
          </div>
        ),

        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("name", {
        header: "NAME",
        cell: (info) => (
          <div className="max-w-[200px] truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
        footer: (info) => info.column.id,
      }),

      columnHelper.accessor("title", {
        header: "TITLE",
        cell: (info) => (
          <div className="relative">
            {info.getValue()}
            {!info.row.original.hasRead && (
              <div className="absolute -right-1 -top-1 h-1 w-1 rounded-full bg-primary" />
            )}
          </div>
        ),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("date", {
        header: "DATE",
        cell: (info) => {
          return (
            <div className="flex items-center space-x-3 truncate">
              {dayjs(info.getValue()).format("DD MMM YYYY HH:mm A")}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "Action",
        header: "ACTION",
        cell: (info) => {
          const isLoading =
            readNotificationsMutation.variables?.id === info.row.original.id &&
            readNotificationsMutation.isPending;
          return (
            <div className="flex items-center justify-center space-x-3 truncate">
              <button
                onClick={() => {
                  setShowDetailsId("" + info.row.original.id);
                  readNotificationsMutation
                    .mutateAsync({
                      id: info.row.original.id,
                    })
                    .then(() => {
                      reportListingQuery.refetch();
                    });
                }}
                className="z-10 rounded-none bg-[#55BCE7] p-3 text-white hover:bg-opacity-70"
                disabled={isLoading}
              >
                {isLoading ? (
                  <SpinnerIcon className="ml-0 mr-0 h-4 w-4 " />
                ) : (
                  <EyeIcon className="h-4 w-4 " />
                )}
              </button>
            </div>
          );
        },
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [readNotificationsMutation.isPending, readNotificationsMutation.variables],
  );

  const reportList = useMemo(
    () =>
      reportListingQuery.data?.pages
        ?.map((e) => e.data)
        ?.flat()
        ?.map<ReportListItem>((e) => ({
          id: e.id,
          name: e.to_name,
          title: e.subject,
          date: e.created_at,
          hasRead: isRecruiter ? e.is_user_read : e.is_admin_read,
        })) || [],
    [reportListingQuery.data, isRecruiter],
  );

  const table = useReactTable({
    columns: columns,
    data: reportList,
    getCoreRowModel: getCoreRowModel(),
    enableFilters: false,
  });

  const content = notificationDetailsQuery?.data?.data?.content || "";
  return (
    <main>
      <div className="mx-auto w-full p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            List Notification
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
        <PopupDialog
          isOpen={!!showDetailsId}
          setIsOpen={() => setShowDetailsId("")}
          title="Notification Details"
          containerClassName="relative h-[70vh]"
          showXMarkIcon
        >
          {content ? (
            <iframe
              src={`data:text/html;base64,${btoa(
                unescape(encodeURIComponent(content)),
              )}`}
              className="h-full w-full py-4"
            />
          ) : null}
        </PopupDialog>
      </div>
    </main>
  );
}

interface ReportListItem {
  id: number;
  name: string;
  title: string;
  date: string;
  hasRead: boolean;
}
