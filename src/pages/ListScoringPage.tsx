import { useQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronRight, EyeIcon, PencilIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useTypedSearchParams } from "react-router-typesafe-routes/dom";

import { axiosApi } from "@/api/api";
import { ChipGroup } from "@/components/common/ChipGroup";
import { ROUTES } from "@/routes/routes";
import { cn, emptyArray } from "@/utils";
import { Table } from "./common/Table";
import { TableLoader } from "./common/TableLoader";

const jobColumnHelper = createColumnHelper<ScoringJobItem>();
const candidateColumnHelper = createColumnHelper<ScoringCandidateItem>();

export function ListScoringPage() {
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [{ skill: department, location }] = useTypedSearchParams(
    ROUTES.ADMIN.LIST_SCORING,
  );

  //#region list query
  const listJobQuery = useQuery({
    queryKey: ["listScoringListQuery", department, location],

    queryFn: () => {
      console.log("department, location", department, location);
      return axiosApi({
        url: "onboarding/scoring/",
        method: "GET",
        params: {
          department,
          location,
        },
      }).then((e) => e.data.data);
    },
  });
  const listCandidateBasedOnJobQuery = useQuery({
    queryKey: ["listCandidateBasedOnJobQuery", selectedJobId],
    enabled: !!selectedJobId,
    queryFn: () => {
      return axiosApi({
        url: "onboarding/candidates_score/",
        method: "GET",
        params: {
          department,
          location,
          job_id: `${selectedJobId}`,
        },
      }).then((e) => e.data.data);
    },
  });

  //#endregion
  //#region memo states
  const jobListColumns = useMemo(
    () => [
      jobColumnHelper.accessor("job_title", {
        header: "Job Title",
        cell: (info) => <div title={info.getValue()}>{info.getValue()}</div>,
        footer: (info) => info.column.id,
      }),
      jobColumnHelper.accessor("job_location", {
        header: "Location",
        cell: (info) => <div title={info.getValue()}>{info.getValue()}</div>,
        footer: (info) => info.column.id,
      }),
      jobColumnHelper.accessor("department", {
        header: "Department",
        cell: (info) => (
          <div>
            <ChipGroup items={info.getValue() || []} />
          </div>
        ),
        footer: (info) => info.column.id,
      }),

      jobColumnHelper.display({
        header: "Action",
        id: "action",
        cell: (info) => {
          return (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedJobId(info.row.original.job_id)}
                className="flex items-center rounded-md bg-primary p-3 text-sm text-white hover:bg-opacity-80"
              >
                {/* <span>View matching candidates</span> */}
                <ChevronRight className="h-5 w-5 " />
              </button>
            </div>
          );
        },
      }),
    ],
    [],
  );
  const candidateListColumns = useMemo(
    () => [
      candidateColumnHelper.accessor("candidate_name", {
        header: "Candidate Name",
        cell: (info) => <div title={info.getValue()}>{info.getValue()}</div>,
        footer: (info) => info.column.id,
      }),
      candidateColumnHelper.accessor("candidate_email", {
        header: "Candidate Email",
        cell: (info) => <div title={info.getValue()}>{info.getValue()}</div>,
        footer: (info) => info.column.id,
      }),
      candidateColumnHelper.accessor("profile_score", {
        header: "Profile Score",
        cell: (info) => <div>{info.getValue()}</div>,
        footer: (info) => info.column.id,
      }),
      candidateColumnHelper.accessor("overall_score", {
        header: "Overall Score",
        cell: (info) => <div>{info.getValue()}</div>,
        footer: (info) => info.column.id,
      }),
      candidateColumnHelper.accessor("summary", {
        header: "Summary",
        cell: (info) => (
          <div className="max-w-[150px] truncate">{info.getValue()}</div>
        ),
        footer: (info) => info.column.id,
      }),
      candidateColumnHelper.accessor("reasons", {
        header: "Reason",
        cell: (info) => (
          <div className="max-w-[150px] truncate">{info.getValue()}</div>
        ),
        footer: (info) => info.column.id,
      }),

      candidateColumnHelper.display({
        header: "Action",
        id: "action",
        cell: (info) => {
          return (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedJobId(info.row.original.candidate_id)}
                className="flex items-center rounded-md bg-primary p-3 text-white hover:bg-opacity-80"
              >
                <EyeIcon className="h-5 w-5 " />
              </button>
            </div>
          );
        },
      }),
    ],
    [],
  );

  const jobList = useMemo(
    () =>
      listJobQuery.data?.map<ScoringJobItem>((e) => ({
        job_id: e.job_id,
        job_title: e.job_title,
        department: e.job_departments,
        job_location: e.job_location,
      })) || emptyArray,
    [listJobQuery.data],
  );
  const candidateList = useMemo(
    () =>
      listCandidateBasedOnJobQuery.data?.map<ScoringCandidateItem>((e) => ({
        candidate_id: e.candidate_id,
        candidate_email: e.candidate_email,
        candidate_name: e.candidate_name,
        profile_score: e.profile_score,
        overall_score: e.overall_score,
        reasons: e.reasons,
        summary: e.symmary,
      })) || emptyArray,
    [listCandidateBasedOnJobQuery.data],
  );

  //#endregion
  // const selectedItem = listScoringListQuery.data?.find(
  //   (e) => e.job_id === showDetailsId,
  // );
  const jobTable = useReactTable({
    columns: jobListColumns,
    data: jobList,
    getCoreRowModel: getCoreRowModel(),
  });
  const candidateTable = useReactTable({
    columns: candidateListColumns,
    data: candidateList,
    getCoreRowModel: getCoreRowModel(),
  });
  const selectedJob = listJobQuery.data?.find((e) => e.job_id == selectedJobId);
  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          {selectedJobId ? "Candidate score list" : "List Scoring"}
        </h2>
      </div>
      {selectedJob ? (
        <div className="mb-2">
          <div className="border-gray-200 dark:border-strokedark rounded-sm border border-stroke bg-white p-4 shadow-default">
            {/* <h2 className="text-xl font-bold text-stone-700">Selected Job</h2> */}
            <div className="flex gap-x-12">
              {[
                { title: "Job Title", value: selectedJob.job_title },
                { title: "Job Location", value: selectedJob.job_location },
              ].map(({ title, value }) => (
                <div>
                  <div className="font-medium">{title}:</div>
                  <div className="text-sm">{value}</div>
                </div>
              ))}
              <div>
                <div className="font-medium">Departments:</div>
                <div className="text-sm">
                  <ChipGroup items={selectedJob.job_departments} />
                </div>
              </div>
            </div>
            {/* <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"> */}
            {/* </div> */}
            <div className="mt-6 grid w-full grid-cols-2 justify-end space-x-4 md:flex">
              <button
                onClick={() => {
                  setSelectedJobId(null);
                }}
                className="flex items-center space-x-2 rounded-lg bg-blue-500 px-4 py-2 font-medium text-white outline-none hover:opacity-90 focus:ring active:scale-95"
              >
                <PencilIcon className="h-4 w-4" />
                <span>Change Job</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <div className="flex flex-col gap-5 md:gap-7 2xl:gap-10">
        <div
          className={cn(
            "dark:bg-boxdark dark:border-strokedark relative overflow-x-auto rounded-sm border border-stroke bg-white shadow-default",
            listJobQuery.isLoading && "min-h-[20rem]",
            selectedJobId !== null && "hidden",
          )}
        >
          <Table
            table={jobTable}
            loader={
              <TableLoader
                dataList={jobList}
                isLoading={listJobQuery.isLoading}
                isUpdateLoading={
                  listJobQuery.isLoading || listJobQuery.isRefetching
                }
              />
            }
          />
        </div>

        <div
          className={cn(
            "dark:bg-boxdark dark:border-strokedark relative overflow-x-auto rounded-sm border border-stroke bg-white shadow-default",
            listJobQuery.isLoading && "min-h-[20rem]",
            selectedJobId === null && "hidden",
          )}
        >
          <Table
            table={candidateTable}
            loader={
              <TableLoader
                dataList={candidateList}
                isLoading={listCandidateBasedOnJobQuery.isLoading}
                isUpdateLoading={
                  listCandidateBasedOnJobQuery.isLoading ||
                  listCandidateBasedOnJobQuery.isRefetching
                }
              />
            }
          />
        </div>
      </div>
    </div>
  );
}

interface ScoringJobItem {
  job_id: number;
  job_title: string;
  job_location: string;
  department: { name: string; id: number }[];
}

interface ScoringCandidateItem {
  candidate_id: number;
  candidate_name: string;
  candidate_email: string;
  profile_score: string;
  summary?: string;
  overall_score?: string | null;
  reasons?: string | null;
}
