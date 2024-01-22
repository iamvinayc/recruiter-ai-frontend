import { axiosApi } from "@/api/api";
import { cn } from "@/utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { InfinityLoaderComponent } from "./common/InfinityLoaderComponent";
import { Table } from "./common/Table";
import { TableLoader } from "./common/TableLoader";


const columnHelper = createColumnHelper<EmployerListItem>();

export default function EmployerListPage() {
  const employerListingQuery = useInfiniteQuery({
    queryKey: ["onboardingListingQuery"],
    queryFn: async ({ pageParam }) =>
      axiosApi({
        url: (pageParam ||
            "data-sourcing/employer/") as "data-sourcing/employer/",
        method: "GET",
      }).then((e) => e.data),
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
          employer_label: e.employer_label,
          email: e.email,
          phone1: e.phone1,
          phone2: e.phone2,
          is_interested: e.is_interested,
        })) || [],
    [employerListingQuery.data],
  );
  const columns = useMemo(
    () => [
      columnHelper.accessor("employer_label", {
        header: "Employer Name",
        cell: (info) => (
          <div className="max-w-[200px] truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("email", {
        header: "Email",
        cell: (info) => (
          <div className="max-w-[200px] truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("phone1", {
        header: "Phone No. 1",
        cell: (info) => (
          <div className="max-w-[200px] truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("phone2", {
        header: "Phone No. 2",
        cell: (info) => (
          <div className="max-w-[200px] truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    columns: columns,
    data: employerList,
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
    employer_label: string;
    email: string;
    phone1?: string;
    phone2?: string;
    is_interested: boolean;
}
