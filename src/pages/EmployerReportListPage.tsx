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
import { format } from "date-fns";
import { useLogin } from "@/hooks/useLogin";

const columnHelper = createColumnHelper<EmployerReportListItem>();

export function EmployerReportListPage() {
  const { isRecruiter } = useLogin();
  const [{ location, from_date, to_date, sector }] = useTypedSearchParams(
    isRecruiter
      ? ROUTES.RECRUITER.EMPLOYER_REPORT
      : ROUTES.ADMIN.EMPLOYER_REPORT,
  );

  const reportListingQuery = useInfiniteQuery({
    queryKey: ["employer-reportListingQuery", location, from_date, to_date, sector],
    queryFn: async ({ pageParam }) =>
      axiosApi({
        url: (pageParam || "report/employer/") as "report/employer/",
        method: "GET",
        params: {
          location,
          from_date,
          to_date,
          sector,
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
      columnHelper.accessor("created_at", {
        header: "DATE",
        cell: (info) => format(info.getValue(), "yyyy-MM-dd"),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("title", {
        header: "TITLE",
        cell: (info) => info.getValue(),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("employer", {
        header: "EMPLOYER",
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
          <div className="max-w-[250px] truncate" title={info.getValue()}>
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
        header: "HR URL",
        cell: (info) => <OpenUrlButton url={info.getValue()} />,
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("job_link", {
        header: "JOB LINK",
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
      columnHelper.accessor("sector", {
        header: "SECTOR",
        cell: (info) => {
          const sector = info.getValue() as string;
          return (
            <div
              className="max-w-[200px] truncate"
              title={sector ? sector : "Not Available"}
            >
              {sector ? sector : "Not Available"}
            </div>
          );
        },
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
        header: "MAIL",
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
        sector: e.sector,
        responded: e.responded,
        location: { id: e.location.id, name: e.location.name },
        created_at: e.created_at,
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
            location: location,
            export_to_excel: true,
            to_date: to_date,
            from_date: from_date,
            sector: sector,
          },
          responseType: "blob",
          data: undefined,
          headers: {
            "Content-Type": "application/ms-excel",
          },
        });

        let filename = "Employer_Report.xlsx";
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
          isEmpty={employerReportList.length === 0}
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
  sector: string | null;
  created_at: string;
}
