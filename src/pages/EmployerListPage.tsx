import { axiosApi } from "@/api/api";
import { BlockButton } from "@/components/common/BlockButton";
import { cn, replaceWith } from "@/utils";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import {
  ColumnFilter,
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { InfinityLoaderComponent } from "./common/InfinityLoaderComponent";
import { Table } from "./common/Table";
import { TableLoader } from "./common/TableLoader";

const columnHelper = createColumnHelper<EmployerListItem>();

export default function EmployerListPage() {
  const [columnFilters, setColumnFilters] = useState<ColumnFilter[]>([]);

  const blockEmployerMutation = useMutation({
    mutationKey: ["blockEmployerMutation"],
    mutationFn: async ({ blocked, id }: { id: number; blocked: boolean }) => {
      return axiosApi({
        url: replaceWith(
          "data-sourcing/employer/block/:id/",
          "data-sourcing/employer/block/:id/".replace(":id", id.toString()),
        ),
        method: "PATCH",
        params: undefined,
        data: {
          blocked,
        },
      })
        .then((e) => e.data.isSuccess)
        .then((success) => {
          if (success) employerListingQuery.refetch();
          return success;
        });
    },
  });

  const employerListingQuery = useInfiniteQuery({
    queryKey: ["employerListingQuery", columnFilters],
    queryFn: async ({ pageParam }) => {
      const name =
        (columnFilters.find((e) => e.id === "employer_label")
          ?.value as string) || "";
      return axiosApi({
        url: (pageParam ||
          "data-sourcing/employer/") as "data-sourcing/employer/",
        method: "GET",
        params: {
          per_page: 12,
          name,
        },
      }).then((e) => e.data);
    },
    getNextPageParam(e) {
      return e.next;
    },
    initialPageParam: "",
  });

  const employerList = useMemo(
    () =>
      employerListingQuery?.data?.pages
        ?.map((e) => e?.data)
        ?.flat()
        ?.map<EmployerListItem>((e) => ({
          id: e.id,
          employer_label: e.employer_label,
          email: e.email,
          phone1: e.phone1,
          phone2: e.phone2,
          is_interested: e.is_interested,
          is_blocked: e.is_blocked,
        })) || [],
    [employerListingQuery.data],
  );

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "SLNo",
        header: "Sr. No",
        cell: (info) => info.row.index + 1,
      }),
      columnHelper.accessor("employer_label", {
        header: "Employer Name",
        cell: (info) => (
          <div className="max-w-[200px] truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
        footer: (info) => info.column.id,
        enableColumnFilter: true,
      }),
      columnHelper.accessor("email", {
        header: "Email",
        cell: (info) => (
          <div className="truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
        footer: (info) => info.column.id,
        enableColumnFilter: false,
      }),
      columnHelper.accessor("phone1", {
        header: "Phone No. 1",
        cell: (info) => (
          <div className="max-w-[200px] truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
        enableColumnFilter: false,
      }),
      columnHelper.accessor("phone2", {
        header: "Phone No. 2",
        cell: (info) => (
          <div className="max-w-[200px] truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
        enableColumnFilter: false,
      }),
      columnHelper.display({
        id: "action",
        header: "Action",
        cell: (info) => (
          <div className="max-w-[150px] truncate">
            <BlockButton
              isLoading={
                blockEmployerMutation.variables?.id === info.row.original.id &&
                blockEmployerMutation.isPending
              }
              onClick={() => {
                blockEmployerMutation.mutateAsync({
                  id: info.row.original.id,
                  blocked: !info.row.original.is_blocked,
                });
              }}
              is_blocked={info.row.original.is_blocked}
            />
          </div>
        ),
        enableColumnFilter: false,
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [blockEmployerMutation.variables?.id, blockEmployerMutation.isPending],
  );

  const table = useReactTable({
    columns: columns,
    data: employerList,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <main>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            Employer List
          </h2>
        </div>
        {/* -- Body --- */}
        <div className="flex flex-col gap-5 md:gap-7 2xl:gap-10">
          <div
            className={cn(
              "dark:bg-boxdark dark:border-strokedark relative overflow-x-auto rounded-sm border border-stroke bg-white shadow-default",
              employerListingQuery.isLoading && "min-h-[20rem]",
            )}
          >
            <InfinityLoaderComponent
              dataLength={employerList.length}
              hasMore={employerListingQuery.hasNextPage}
              next={() => {
                employerListingQuery.fetchNextPage();
              }}
            >
              <Table
                table={table}
                loader={
                  <TableLoader
                    colSpan={columns.length}
                    dataList={employerList}
                    isLoading={employerListingQuery.isLoading}
                    isUpdateLoading={
                      employerListingQuery.isLoading ||
                      employerListingQuery.isRefetching
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

interface EmployerListItem {
  id: number;
  employer_label: string;
  email: string;
  phone1?: string;
  phone2?: string;
  is_interested: boolean;
  is_blocked: boolean;
}
