import { axiosApi } from "@/api/api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLogin } from "@/hooks/useLogin";
import { ROUTES } from "@/routes/routes";
import { cn } from "@/utils";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { AxiosResponse } from "axios";
import { format } from "date-fns";
import {
  AtSignIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
  PhoneIcon,
  XCircleIcon,
} from "lucide-react";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { useTypedSearchParams } from "react-router-typesafe-routes/dom";
import { InfinityLoaderComponent } from "./common/InfinityLoaderComponent";
import { Table } from "./common/Table";
import { TableLoader } from "./common/TableLoader";
import { EmployerReportListFilter } from "./Filter/EmployetReportListFilter";

const columnHelper = createColumnHelper<EmployerReportListItem>();

export function EmployerReportListPage() {
  const { isRecruiter } = useLogin();
  const [{ location, from_date, to_date, sector, skill: department }] =
    useTypedSearchParams(
      isRecruiter
        ? ROUTES.RECRUITER.EMPLOYER_REPORT
        : ROUTES.ADMIN.EMPLOYER_REPORT,
    );

  const reportListingQuery = useInfiniteQuery({
    queryKey: [
      "employer-reportListingQuery",
      location,
      from_date,
      to_date,
      sector,
      department,
    ],
    queryFn: async ({ pageParam }) =>
      axiosApi({
        url: (pageParam || "report/employer/") as "report/employer/",
        method: "GET",
        params: {
          department: department
            ? JSON.stringify(department.split(",").map(Number))
            : undefined,
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
      // columnHelper.display({
      //   id: "SLNo",
      //   header: "No",
      //   cell: (info) => info.row.index + 1,
      // }),
      columnHelper.accessor("created_at", {
        header: "DATE",
        cell: (info) => format(info.getValue(), "yyyy-MM-dd"),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("title", {
        header: "TITLE",
        cell: (info) => (
          <div className="max-w-[200px] truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("employer", {
        header: "EMPLOYER",
        cell: (info) => (
          <div
            className="flex max-w-[200px] flex-wrap gap-x-4 gap-y-2 truncate"
            title={info.getValue()}
          >
            <span>{info.getValue()}</span>
            {info.row.original.email ? (
              <Tooltip>
                <TooltipTrigger className="h-5 w-5 ">
                  <AtSignIcon className="h-full w-full " />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{info.row.original.email}</p>
                </TooltipContent>
              </Tooltip>
            ) : null}
            {info.row.original.phone ? (
              <Tooltip>
                <TooltipTrigger className="h-5 w-5 ">
                  <PhoneIcon className="h-full w-full " />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{info.row.original.phone}</p>
                </TooltipContent>
              </Tooltip>
            ) : null}
          </div>
        ),
        footer: (info) => info.column.id,
      }),
      // columnHelper.accessor("email", {
      //   header: "EMAIL",
      //   cell: (info) => (
      //     <div className="max-w-[250px] truncate" title={info.getValue()}>
      //       {info.getValue()}
      //     </div>
      //   ),
      //   footer: (info) => info.column.id,
      // }),

      // columnHelper.accessor("phone", {
      //   header: "PHONE",
      //   cell: (info) => (
      //     <div className="max-w-[200px] truncate" title={info.getValue()}>
      //       {info.getValue()}
      //     </div>
      //   ),
      //   footer: (info) => info.column.id,
      // }),
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
        enableResizing: false,
        size: 75,
        // cell: (info) => <OpenUrlButton url={info.getValue()} />,
        footer: (info) => info.column.id,
        cell: (info) => (
          <a
            className="flex w-full max-w-[200px] items-center justify-center gap-2 truncate"
            title={info.getValue()}
            href={info.row.original.job_link}
            target="_blank"
            rel="noreferrer"
          >
            {info?.getValue()?.includes("linkedin") ? (
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid"
                viewBox="0 0 256 256"
              >
                <path
                  d="M218.123 218.127h-37.931v-59.403c0-14.165-.253-32.4-19.728-32.4-19.756 0-22.779 15.434-22.779 31.369v60.43h-37.93V95.967h36.413v16.694h.51a39.907 39.907 0 0 1 35.928-19.733c38.445 0 45.533 25.288 45.533 58.186l-.016 67.013ZM56.955 79.27c-12.157.002-22.014-9.852-22.016-22.009-.002-12.157 9.851-22.014 22.008-22.016 12.157-.003 22.014 9.851 22.016 22.008A22.013 22.013 0 0 1 56.955 79.27m18.966 138.858H37.95V95.967h37.97v122.16ZM237.033.018H18.89C8.58-.098.125 8.161-.001 18.471v219.053c.122 10.315 8.576 18.582 18.89 18.474h218.144c10.336.128 18.823-8.139 18.966-18.474V18.454c-.147-10.33-8.635-18.588-18.966-18.453"
                  fill="#0A66C2"
                />
              </svg>
            ) : (
              <ExternalLinkIcon />
            )}
          </a>
        ),
      }),
      // columnHelper.accessor("job_link", {
      //   header: "JOB LINK",
      //   cell: (info) => <OpenUrlButton url={info.getValue()} />,
      //   footer: (info) => info.column.id,
      // }),
      columnHelper.accessor("job_link", {
        header: "JOB LINK",
        enableResizing: false,
        size: 85,
        cell: (info) => (
          <a
            className="flex w-full max-w-[200px] items-center justify-center gap-2 truncate"
            title={info.getValue()}
            href={info.row.original.job_link}
            target="_blank"
            rel="noreferrer"
          >
            {info.row.original.platform.toUpperCase() === "LINKEDIN" ? (
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid"
                viewBox="0 0 256 256"
              >
                <path
                  d="M218.123 218.127h-37.931v-59.403c0-14.165-.253-32.4-19.728-32.4-19.756 0-22.779 15.434-22.779 31.369v60.43h-37.93V95.967h36.413v16.694h.51a39.907 39.907 0 0 1 35.928-19.733c38.445 0 45.533 25.288 45.533 58.186l-.016 67.013ZM56.955 79.27c-12.157.002-22.014-9.852-22.016-22.009-.002-12.157 9.851-22.014 22.008-22.016 12.157-.003 22.014 9.851 22.016 22.008A22.013 22.013 0 0 1 56.955 79.27m18.966 138.858H37.95V95.967h37.97v122.16ZM237.033.018H18.89C8.58-.098.125 8.161-.001 18.471v219.053c.122 10.315 8.576 18.582 18.89 18.474h218.144c10.336.128 18.823-8.139 18.966-18.474V18.454c-.147-10.33-8.635-18.588-18.966-18.453"
                  fill="#0A66C2"
                />
              </svg>
            ) : (
              <ExternalLinkIcon />
            )}
          </a>
        ),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("sector", {
        header: "SECTOR",
        enableResizing: false,
        size: 65,
        cell: (info) => {
          const sector = info.getValue() as string;
          return (
            <div
              className="max-w-[200px] truncate text-center"
              title={sector ? sector : "Not Available"}
            >
              {sector ? sector : "Not Available"}
            </div>
          );
        },
      }),
      columnHelper.accessor("responded", {
        header: "RESPONSE",
        size: 80,
        cell: (info) => {
          const responded = info.getValue() as boolean;
          return (
            <div
              className="flex w-full max-w-[200px] items-center justify-center truncate"
              title={responded ? "Responded" : "Not Responded"}
            >
              {responded ? (
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
              ) : (
                <XCircleIcon className="h-8 w-8 text-red-500" />
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor("is_mail_sent", {
        header: "MAIL",
        size: 70,
        cell: (info) => {
          const responded = info.getValue() as boolean;
          return (
            <div
              className="flex w-full max-w-[200px] items-center justify-center truncate"
              title={responded ? "Sended" : "Not Send"}
            >
              {responded ? (
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
              ) : (
                <XCircleIcon className="h-8 w-8 text-red-500" />
              )}
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

        const filename = "Employer_Report.xlsx";
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
    <TooltipProvider>
      <div className="mx-auto w-full p-4 md:p-6 2xl:p-10">
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
                tableClassName="md:w-full"
                thClassName="md:w-1/12 md:pl-5"
                tdClassName="md:pl-5"
                table={table}
                applyWidth
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
    </TooltipProvider>
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
