import { axiosApi } from "@/api/api";
import { ROUTES } from "@/routes/routes";
import { cn } from "@/utils";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useTypedSearchParams } from "react-router-typesafe-routes/dom";
import { InfinityLoaderComponent } from "./common/InfinityLoaderComponent";
import { Table } from "./common/Table";
import { TableLoader } from "./common/TableLoader";
import { CandidateReportListFilter } from "./Filter/CandidateReportListFilter";
import { MatchingJobsChipGroup } from "@/components/MatchingJobsChipGroup";
import toast from "react-hot-toast";
import { AxiosResponse } from "axios";
import OpenUrlButton from "@/components/OpenUrlButton";
import { format } from "date-fns";
import { useLogin } from "@/hooks/useLogin";

const columnHelper = createColumnHelper<CandidateReportListItem>();

export function CandidateReportListPage() {
  const { isRecruiter } = useLogin();
  
  const [candidate, setCandidate] = useState("");

  const [{ location, from_date, to_date, sector }] = useTypedSearchParams(
    isRecruiter
      ? ROUTES.RECRUITER.CANDIDATE_REPORT
      : ROUTES.ADMIN.CANDIDATE_REPORT,
  );

  const reportListingQuery = useInfiniteQuery({
    queryKey: ["candidate-reportListingQuery", location, candidate, from_date, to_date, sector],
    queryFn: async ({ pageParam }) =>
      axiosApi({
        url: (pageParam || "report/candidate/") as "report/candidate/",
        method: "GET",
        params: {
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
        cell: (info) => format(info.getValue(), "yyyy-MM-dd"),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("name", {
        header: "CANDIDATE",
        cell: (info) => (
          <div className="max-w-[100px] truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("email", {
        header: "EMAIL",
        cell: (info) => (
          <div className="max-w-[100px] truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
        footer: (info) => info.column.id,
      }),

      columnHelper.accessor("phone", {
        header: "PHONE",
        cell: (info) => (
          <div className="max-w-[100px] truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("location", {
        header: "LOCATION",
        cell: (info) => (
          <div className="max-w-[100px] truncate" title={info.getValue().name}>
            {info.getValue().name}
          </div>
        ),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("profile_url", {
        header: "PROFILE URL",
        cell: (info) => <OpenUrlButton url={info.getValue()} />,
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("platform", {
        header: "PLATFORM",
        cell: (info) => (
          <div className="max-w-[100px] truncate" title={info.getValue()}>
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
              className="max-w-[100px] truncate px-2"
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
              className="max-w-[100px] truncate"
              title={responded ? "Responded" : "Not Responded"}
            >
              {responded ? "Responded" : "Not Responded"}
            </div>
          );
        },
      }),
      columnHelper.accessor("matching_jobs", {
        header: "MACTHING JOBS",
        cell: (info) => {
          const items = info
            .getValue()
            .map((e, _) => ({ id: e.job_id, name: e.job_title, score: e.score }))
          return (
            items.length > 0 ? (
              <MatchingJobsChipGroup
                navigate={true}
                items={items}
                className="whitespace-wrap bg-[#55BCE7] text-white"
              />
            ) : (
              <div className="" title="No Matches">
                No Matches
              </div>
            )
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
        matching_jobs: e.matching_jobs.map((e) => ({ job_id: e.job_id, job_title: e.job_title, score: e.score })),
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

        let filename = "Candidate_Report.xlsx";
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
                thClassName="md:w-1/12 md:pl-5"
                tdClassName="md:pl-5 md:text-sm"
                table={table}
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
    </main>
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
