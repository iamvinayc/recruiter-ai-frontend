import { axiosApi } from "@/api/api";
import { BlockButton } from "@/components/common/BlockButton";
import {
  DebouncedInput,
  DebouncedSearchInput,
} from "@/components/common/Input";
import { useLogin } from "@/hooks/useLogin";
import { cn, replaceWith } from "@/utils";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { NotebookTabs } from "lucide-react";
import { useMemo, useState } from "react";
import { useTypedSearchParams } from "react-router-typesafe-routes/dom";
import { ROUTES } from "../routes/routes";
import { InfinityLoaderComponent } from "./common/InfinityLoaderComponent";
import { Table } from "./common/Table";
import { TableLoader } from "./common/TableLoader";
import EmployerListDialog from "./EmployerListPage.dialog";

const columnHelper = createColumnHelper<EmployerListItem>();

export default function EmployerListPage() {
  const [search, setSearch] = useState("");
  const [emailSearch, setEmailSearch] = useState("");

  const [selectedEmployerId, setSelectedEmployerId] = useState<string | null>(
    null,
  );

  const openDialog = (employerId: string) => {
    setSelectedEmployerId(employerId);
  };

  const closeDialog = () => {
    setSelectedEmployerId(null);
  };

  const { isRecruiter } = useLogin();
  const [{ id: employerId, final_followedup_employers }] = useTypedSearchParams(
    isRecruiter ? ROUTES.RECRUITER.LIST_EMPLOYER : ROUTES.ADMIN.LIST_EMPLOYER,
  );

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
    queryKey: [
      "employerListingQuery",
      search,
      employerId,
      final_followedup_employers,
      emailSearch,
    ],
    queryFn: async ({ pageParam }) => {
      return axiosApi({
        url: (pageParam ||
          "data-sourcing/employer/") as "data-sourcing/employer/",
        method: "GET",
        params: {
          per_page: 12,
          name: search,
          id: employerId,
          final_followedup_employers: final_followedup_employers || undefined,
          email: emailSearch,
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
          hr_url: e.hr_url,
        })) || [],
    [employerListingQuery.data],
  );

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "SLNo",
        header: "No",
        cell: (info) => info.row.index + 1,
      }),
      columnHelper.accessor("employer_label", {
        header: "COMPANY",
        cell: (info) => (
          <div className="max-w-[200px] truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
        footer: (info) => info.column.id,
        enableColumnFilter: false,
      }),
      columnHelper.accessor("email", {
        header: () => (
          <div>
            <div>EMAIL</div>
            <DebouncedInput
              className="mt-2 border border-slate-200 px-2 py-1 text-xs shadow-sm"
              placeholder="Search by Email"
              value={emailSearch}
              onChange={(val) => {
                setEmailSearch("" + val);
              }}
            />
          </div>
        ),
        cell: (info) => (
          <div className="truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
        footer: (info) => info.column.id,
        enableColumnFilter: false,
      }),
      columnHelper.accessor("phone1", {
        header: "CONTACT NUMBER",
        cell: (info) => (
          <div className="max-w-[200px] truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
        enableColumnFilter: false,
      }),
      columnHelper.accessor("phone2", {
        header: "ALTERNATE NUMBER",
        cell: (info) => (
          <div className="max-w-[200px] truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
        enableColumnFilter: false,
      }),
      // columnHelper.accessor("hr_url", {
      //   header: "HR PROFILE",
      //   cell: (info) => (
      //     <div className="max-w-[200px] truncate" title={info?.getValue() || "Not Found"}>
      //       {info.getValue() || "Not Found"}
      //     </div>
      //   ),
      //   enableColumnFilter: false,
      // }),
      columnHelper.display({
        id: "action",
        header: "ACTION",
        cell: (info) => (
          <div className="flex items-center space-x-2">
            <button
              className={cn(
                "rounded-none bg-primary p-3 text-white hover:bg-opacity-70",
              )}
              title="Job Register"
              onClick={() => openDialog(info.row.original.id.toString())}
            >
              <NotebookTabs className="h-5 w-5" strokeWidth={3} />
            </button>
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
            {info.row.original.hr_url ? (
              <a
                className={cn("rounded-none  hover:bg-opacity-70")}
                href={`${info.row.original.hr_url}`}
                target="_blank"
                rel="noreferrer"
              >
                <svg
                  className="h-10 w-10"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="xMidYMid"
                  viewBox="0 0 256 256"
                >
                  <path
                    d="M218.123 218.127h-37.931v-59.403c0-14.165-.253-32.4-19.728-32.4-19.756 0-22.779 15.434-22.779 31.369v60.43h-37.93V95.967h36.413v16.694h.51a39.907 39.907 0 0 1 35.928-19.733c38.445 0 45.533 25.288 45.533 58.186l-.016 67.013ZM56.955 79.27c-12.157.002-22.014-9.852-22.016-22.009-.002-12.157 9.851-22.014 22.008-22.016 12.157-.003 22.014 9.851 22.016 22.008A22.013 22.013 0 0 1 56.955 79.27m18.966 138.858H37.95V95.967h37.97v122.16ZM237.033.018H18.89C8.58-.098.125 8.161-.001 18.471v219.053c.122 10.315 8.576 18.582 18.89 18.474h218.144c10.336.128 18.823-8.139 18.966-18.474V18.454c-.147-10.33-8.635-18.588-18.966-18.453"
                    fill="#0A66C2"
                  />
                </svg>
              </a>
            ) : null}
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
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <main>
      <div className="mx-auto w-full p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            Company List
          </h2>

          <DebouncedSearchInput
            placeholder="Search by Company Name"
            value={search}
            onChange={(val) => {
              setSearch("" + val);
            }}
          />
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
      {selectedEmployerId && (
        <EmployerListDialog
          selectedEmployerId={selectedEmployerId}
          closeDialog={closeDialog}
        />
      )}
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
  hr_url: string | null;
}
