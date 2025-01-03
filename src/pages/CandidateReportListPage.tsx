import { axiosApi } from "@/api/api";
import { MatchingJobsChipGroup } from "@/components/MatchingJobsChipGroup";
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
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTypedSearchParams } from "react-router-typesafe-routes/dom";
import { InfinityLoaderComponent } from "./common/InfinityLoaderComponent";
import { Table } from "./common/Table";
import { TableLoader } from "./common/TableLoader";
import { CandidateReportListFilter } from "./Filter/CandidateReportListFilter";

const columnHelper = createColumnHelper<CandidateReportListItem>();

export function CandidateReportListPage() {
  const { isRecruiter } = useLogin();

  const [candidate, setCandidate] = useState("");

  const [{ location, from_date, to_date, sector, skill: department }] =
    useTypedSearchParams(
      isRecruiter
        ? ROUTES.RECRUITER.CANDIDATE_REPORT
        : ROUTES.ADMIN.CANDIDATE_REPORT,
    );

  const reportListingQuery = useInfiniteQuery({
    queryKey: [
      "candidate-reportListingQuery",
      location,
      candidate,
      from_date,
      to_date,
      sector,
      department,
    ],
    queryFn: async ({ pageParam }) =>
      axiosApi({
        url: (pageParam || "report/candidate/") as "report/candidate/",
        method: "GET",
        params: {
          department: department
            ? JSON.stringify(department.split(",").map(Number))
            : undefined,
          location,
          candidate,
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
        size: 75,
        cell: (info) => format(info.getValue(), "yyyy-MM-dd"),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("name", {
        header: "CANDIDATE",
        cell: (info) => (
          <div
            className="flex max-w-[100px] flex-wrap  gap-x-4 gap-y-2 truncate"
            title={info.getValue()}
          >
            {info.getValue()}
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
      //     <div className="max-w-[100px] truncate" title={info.getValue()}>
      //       {info.getValue()}
      //     </div>
      //   ),
      //   footer: (info) => info.column.id,
      // }),
      // columnHelper.accessor("phone", {
      //   header: "PHONE",
      //   cell: (info) => (
      //     <div className="max-w-[100px] truncate" title={info.getValue()}>
      //       {info.getValue()}
      //     </div>
      //   ),
      //   footer: (info) => info.column.id,
      // }),
      columnHelper.accessor("location", {
        header: "LOCATION",
        size: 100,
        cell: (info) => (
          <div className="max-w-[100px] truncate" title={info.getValue().name}>
            {info.getValue().name}
          </div>
        ),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("profile_url", {
        header: "PROFILE",
        enableResizing: false,
        size: 60,
        footer: (info) => info.column.id,
        cell: (info) => (
          <a
            className="flex w-full max-w-[200px] items-center justify-center gap-2 truncate"
            title={info.getValue()}
            href={info.row.original.profile_url}
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
      // columnHelper.accessor("platform", {
      //   header: "PLATFORM",
      //   cell: (info) => (
      //     <div className="max-w-[100px] truncate" title={info.getValue()}>
      //       {info.getValue()}
      //     </div>
      //   ),
      //   footer: (info) => info.column.id,
      // }),
      columnHelper.accessor("sector", {
        header: "SECTOR",
        enableResizing: false,
        size: 60,
        cell: (info) => {
          const sector = info.getValue() as string;
          return (
            <div
              className="max-w-[100px] truncate px-2 text-center"
              title={sector ? sector : "Not Available"}
            >
              {sector ? sector : "Not Available"}
            </div>
          );
        },
      }),
      columnHelper.accessor("responded", {
        header: "RESPONSE",
        size: 70,
        cell: (info) => {
          const responded = info.getValue() as boolean;
          return (
            <div
              className="flex max-w-[100px] items-center justify-center truncate"
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
      columnHelper.accessor("matching_jobs", {
        header: "MATCHING JOBS",
        size: 105,
        cell: (info) => {
          const items = info
            .getValue()
            .map((e) => ({ id: e.job_id, name: e.job_title, score: e.score }));
          return items.length > 0 ? (
            <MatchingJobsChipGroup
              navigate={true}
              items={items}
              className="whitespace-wrap bg-[#55BCE7] text-white"
            />
          ) : (
            <div className="" title="No Matches">
              No Matches
            </div>
          );
        },
      }),
    ],

    [],
  );

  const candidateReportListQuery = useMemo(
    () => reportListingQuery.data?.pages?.map((e) => e.data)?.flat() || [],
    [reportListingQuery.data],
  );

  const candidateReportList = useMemo(
    () =>
      candidateReportListQuery?.map<CandidateReportListItem>((e) => ({
        email: e.email,
        name: e.name,
        phone: e.phone,
        platform: e.platform,
        profile_url: e.profile_url,
        sector: e.sector,
        responded: e.responded,
        matching_jobs: e.matching_jobs.map((e) => ({
          job_id: e.job_id,
          job_title: e.job_title,
          score: e.score,
        })),
        location: { id: e.location.id, name: e.location.name },
        created_at: e.created_at,
      })) || [],
    [candidateReportListQuery],
  );

  const table = useReactTable({
    columns: columns,
    data: candidateReportList,
    getCoreRowModel: getCoreRowModel(),
    enableFilters: false,
  });

  const downloadCandidateReportMutation = useMutation({
    mutationKey: ["downloadCandidateReportMutation"],
    mutationFn: async () => {
      try {
        const response: AxiosResponse = await axiosApi({
          url: "report/candidate/",
          method: "GET",
          params: {
            location: location,
            candidate: candidate,
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

        const filename = "Candidate_Report.xlsx";
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
            Candidate Report List
          </h2>
        </div>
        <CandidateReportListFilter
          onSearch={() => reportListingQuery.refetch()}
          onClick={() => downloadCandidateReportMutation.mutateAsync()}
          isLoading={downloadCandidateReportMutation.isPending}
          isEmpty={candidateReportList.length === 0}
          candidate={candidate}
          setCandidate={setCandidate}
        />
        <div className="flex flex-col gap-5 md:gap-7 2xl:gap-10">
          <div
            className={cn(
              "dark:bg-boxdark dark:border-strokedark relative overflow-x-auto rounded-sm border border-stroke bg-white shadow-default",
              reportListingQuery.isLoading && "min-h-[20rem]",
            )}
          >
            <InfinityLoaderComponent
              dataLength={candidateReportList.length}
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
                    dataList={candidateReportList}
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

export interface CandidateReportListItem {
  name: string;
  email: string;
  phone: string;
  location: { id: number; name: string };
  profile_url: string;
  responded: boolean;
  platform: string;
  sector: string | null;
  matching_jobs: { job_id: number; job_title: string; score: number }[];
  created_at: string;
}
