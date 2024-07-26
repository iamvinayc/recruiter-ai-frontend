import { axiosApi } from "@/api/api";
import { ROUTES } from "@/routes/routes";
import { cn } from "@/utils";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { useTypedSearchParams } from "react-router-typesafe-routes/dom";
import { InfinityLoaderComponent } from "./common/InfinityLoaderComponent";
import { Table } from "./common/Table";
import { TableLoader } from "./common/TableLoader";
import { EmployerReportListFilter } from "./Filter/EmployetReportListFilter";
import { AxiosResponse } from "axios";
import toast from "react-hot-toast";
import OpenUrlButton from "@/components/OpenUrlButton";

const columnHelper = createColumnHelper<EmployerReportListItem>();

export function EmployerReportListPage() {
  const [{ from_date, to_date }] = useTypedSearchParams(
    ROUTES.ADMIN.EMPLOYER_REPORT,
  );

  const reportListingQuery = useInfiniteQuery({
    queryKey: ["employer-reportListingQuery", from_date, to_date],
    queryFn: async ({ pageParam }) =>
      axiosApi({
        url: (pageParam || "report/employer/") as "report/employer/",
        method: "GET",
        params: {
          from_date,
          to_date,
        },
      }).then((e) => e.data),
    getNextPageParam(e) {
      return e.next;
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
      columnHelper.accessor("title", {
        header: "TITLE",
        cell: (info) => info.getValue(),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("employer", {
        header: "Employer",
        cell: (info) => (
          <div className="max-w-[200px] truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("email", {
        header: "EMAIL",
        cell: (info) => (
          <div className="max-w-[200px] truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
        footer: (info) => info.column.id,
      }),

      columnHelper.accessor("phone", {
        header: "PHONE",
        cell: (info) => (
          <div className="max-w-[200px] truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("location", {
        header: "LOCATION",
        cell: (info) => (
          <div className="max-w-[200px] truncate" title={info.getValue().name}>
            {info.getValue().name}
          </div>
        ),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("hr_url", {
        header: "HR_URL",
        cell: (info) => <OpenUrlButton url={info.getValue()} />,
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("job_link", {
        header: "JOB_LINK",
        cell: (info) => <OpenUrlButton url={info.getValue()} />,
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("platform", {
        header: "PLATFORM",
        cell: (info) => (
          <div className="max-w-[200px] truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("responded", {
        header: "RESPONSE",
        cell: (info) => {
          const responded = info.getValue() as boolean;
          return (
            <div
              className="max-w-[200px] truncate"
              title={responded ? "Responded" : "Not Responded"}
            >
              {responded ? "Responded" : "Not Responded"}
            </div>
          );
        },
      }),
      columnHelper.accessor("is_mail_sent", {
        header: "IS_MAIL_SENT",
        cell: (info) => {
          const responded = info.getValue() as boolean;
          return (
            <div
              className="max-w-[200px] truncate"
              title={responded ? "Sended" : "Not Send"}
            >
              {responded ? "Sended" : "Not Send"}
            </div>
          );
        },
      }),
    ],
    [],
  );

  const employerReportListQuery = useMemo(
    () => reportListingQuery.data?.pages?.map((e) => e.data)?.flat() || [],
    [reportListingQuery.data],
  );

  const employerReportList = useMemo(
    () =>
      employerReportListQuery?.map<EmployerReportListItem>((e) => ({
        title: e.title,
        employer: e.employer,
        email: e.email,
        phone: e.phone,
        hr_url: e.hr_url,
        is_mail_sent: e.is_mail_sent,
        job_link: e.job_link,
        platform: e.platform,
        responded: e.responded,
        location: { id: e.location.id, name: e.location.name },
      })) || [],
    [employerReportListQuery],
  );

  const table = useReactTable({
    columns: columns,
    data: employerReportList,
    getCoreRowModel: getCoreRowModel(),
    enableFilters: false,
  });

  const downloadEmployerReportMutation = useMutation({
    mutationKey: ["downloadEmployerReportMutation"],
    mutationFn: async () => {
      try {
        const response: AxiosResponse = await axiosApi({
          url: "report/employer/",
          method: "GET",
          params: {
            export_to_excel: true,
          },
          responseType: "blob",
          data: undefined,
          headers: {
            "Content-Type": "application/ms-excel",
          },
        });

        const contentDisposition = response.headers["content-disposition"];
        let filename = "Employer_Report.xlsx";

        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch.length > 1) {
            filename = filenameMatch[1];
          }
        }

        const blob = new Blob([response.data], {
          type: "application/ms-excel",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        toast.error("Error downloading file");
        console.error("File could not be downloaded:", error);
      }
    },
  });

  return (
    <main>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            Employer Report List
          </h2>
        </div>
        <EmployerReportListFilter
          onSearch={() => reportListingQuery.refetch()}
          onClick={() => downloadEmployerReportMutation.mutateAsync()}
          isLoading={downloadEmployerReportMutation.isPending}
        />
        <div className="flex flex-col gap-5 md:gap-7 2xl:gap-10">
          <div
            className={cn(
              "dark:bg-boxdark dark:border-strokedark relative overflow-x-auto rounded-sm border border-stroke bg-white shadow-default",
              reportListingQuery.isLoading && "min-h-[20rem]",
            )}
          >
            <InfinityLoaderComponent
              dataLength={employerReportList.length}
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
                    dataList={employerReportList}
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

export interface EmployerReportListItem {
  title: string;
  employer: string;
  email: string;
  phone: string;
  location: { id: number; name: string };
  hr_url: string;
  job_link: string;
  responded: boolean;
  is_mail_sent: boolean;
  platform: string;
}
